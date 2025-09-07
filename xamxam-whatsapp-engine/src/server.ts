// zoba-whatsapp-engine/src/server.ts

import { PrismaClient } from './generated/prisma/index.js';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import qrcode from 'qrcode';
import pino from 'pino';

// Configuration d'un logger structuré pour des logs plus clairs
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

const sessions = new Map<string, any>();
const qrCodePromises = new Map<string, Promise<string>>(); // Verrou intelligent pour gérer les connexions simultanées

async function connectToWhatsApp(shopId: string, socketId: string) {
  // Si une session est déjà pleinement connectée, on informe le client et on s'arrête.
  if (sessions.has(shopId)) {
    logger.info(`[${shopId}] Session already active for client ${socketId}.`);
    io.to(socketId).emit('connected', { status: 'Already Connected', jid: sessions.get(shopId).user?.id });
    return;
  }

  // Si une connexion est déjà en cours, le nouveau client attend le QR code existant.
  if (qrCodePromises.has(shopId)) {
    logger.warn(`[${shopId}] QR generation in progress. Client ${socketId} is waiting.`);
    try {
      const qr = await qrCodePromises.get(shopId);
      io.to(socketId).emit('qr', { qr });
    } catch (error) {
      io.to(socketId).emit('error', { message: 'Failed to retrieve QR code.' });
    }
    return;
  }

  // Création d'une promesse qui se résoudra avec l'URL du QR code.
  const qrPromise = new Promise<string>(async (resolve, reject) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(`sessions/${shopId}`);
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          const qrCodeUrl = await qrcode.toDataURL(qr);
          logger.info(`[${shopId}] QR Code generated.`);
          resolve(qrCodeUrl); // La promesse est tenue, le QR code est prêt.
          io.to(shopId).emit('qr', { qr: qrCodeUrl });
        }

        if (connection === 'close') {
          sessions.delete(shopId);
          qrCodePromises.delete(shopId); // Nettoyer le verrou
          const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            logger.info(`[${shopId}] Reconnecting in 5 seconds...`);
            setTimeout(() => connectToWhatsApp(shopId, 'reconnect'), 5000);
          } else {
            logger.info(`[${shopId}] Connection closed permanently.`);
          }
        } else if (connection === 'open') {
          sessions.set(shopId, sock);
          qrCodePromises.delete(shopId); // Nettoyer le verrou
          io.to(shopId).emit('connected', { status: 'Connected', jid: sock.user?.id });
          logger.info(`[${shopId}] Connection opened successfully.`);
        }
      });

      // ==================================================================
      // ===          LOGIQUE DE GESTION DES MESSAGES ENTRANTS          ===
      // ==================================================================
      sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        try {
          const senderJid = msg.key.remoteJid!;
          const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
          
          if (!messageContent) {
            logger.warn(`[${shopId}] Received a non-text message from ${senderJid}, ignoring.`);
            return;
          }
          
          logger.info(`[${shopId}] Processing message from ${senderJid}: "${messageContent}"`);
          
          // 1. Trouver ou créer le client
          let customer = await prisma.customer.findUnique({
            where: { shopId_phone: { shopId, phone: senderJid } }
          });
          if (!customer) {
            customer = await prisma.customer.create({
              data: { shopId, phone: senderJid, name: msg.pushName || senderJid }
            });
            logger.info(`[${shopId}] Created new customer: ${customer.id}`);
          }

          // 2. Trouver ou créer la conversation
          let conversation = await prisma.conversation.findUnique({
            where: { shopId_platform_externalId: { shopId, platform: 'WHATSAPP', externalId: senderJid } }
          });
          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: { shopId, customerId: customer.id, platform: 'WHATSAPP', externalId: senderJid, status: 'OPEN' }
            });
            logger.info(`[${shopId}] Created new conversation: ${conversation.id}`);
          }

          // 3. Créer le message
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: messageContent,
              isFromCustomer: true,
              messageType: 'TEXT',
              externalId: msg.key.id
            }
          });
          logger.info(`[${shopId}] Message from ${senderJid} stored in DB.`);

          // 4. Logique de réponse automatique pour le test
          if (messageContent.toLowerCase().includes('bonjour')) {
            await sock.sendMessage(senderJid, { text: `Bonjour ! Ceci est une réponse automatique de la boutique connectée à ZOBA.` });
            logger.info(`[${shopId}] Auto-reply sent to ${senderJid}.`);
          }

        } catch (error) {
          logger.error(`[${shopId}] Error processing message:`, error);
        }
      });

    } catch (error) {
      qrCodePromises.delete(shopId);
      reject(error);
    }
  });

  qrCodePromises.set(shopId, qrPromise);
}

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  socket.on('start-session', (data: { shopId: string }) => {
    if (!data.shopId) {
      logger.error(`Client ${socket.id} requested session without a shopId.`);
      return;
    }
    logger.info(`Client ${socket.id} requested session for shop: ${data.shopId}`);
    socket.join(data.shopId);
    connectToWhatsApp(data.shopId, socket.id);
  });
});

app.use(express.json());
app.post('/send-message', async (req, res) => {
  // Votre logique d'envoi de message reste la même
});

server.listen(process.env.PORT || 8000, () => logger.info(`WhatsApp Engine listening on port ${process.env.PORT || 8000}`));