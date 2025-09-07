// src/server.ts
import { PrismaClient } from './generated/prisma/index.js';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import qrcode from 'qrcode';
import pino from 'pino';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } }); // Adaptez CORS en production

const sessions = new Map<string, any>(); // Map pour stocker les instances de socket Baileys actives

async function connectToWhatsApp(shopId: string) {
  if (sessions.has(shopId)) {
    return sessions.get(shopId);
  }

  const { state, saveCreds } = await useMultiFileAuthState(`sessions/${shopId}`);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // On ne veut pas le QR dans le terminal
    logger: pino({ level: 'silent' })
  });

  sessions.set(shopId, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      const qrCodeUrl = await qrcode.toDataURL(qr);
      io.to(shopId).emit('qr', { qr: qrCodeUrl });
      console.log(`[${shopId}] QR Code generated`);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`[${shopId}] Connection closed due to`, lastDisconnect?.error, ', reconnecting', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp(shopId);
      } else {
        sessions.delete(shopId);
        // Supprimer la session du dossier /sessions
      }
    } else if (connection === 'open') {
      io.to(shopId).emit('connected', { status: 'Connected', jid: sock.user?.id });
      console.log(`[${shopId}] Connection opened`);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg?.message) return;

    const senderJid = msg.key.remoteJid;
    const messageContent = JSON.stringify(msg.message);
    
    // Logique pour stocker le message dans la DB via Prisma
    console.log(`[${shopId}] Message received from ${senderJid}:`, messageContent);
    // TODO: Utiliser Prisma pour trouver la conversation et créer le message
    // await prisma.message.create(...)
  });

  return sock;
}

// Socket.IO pour la communication temps réel avec le frontend
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('start-session', (data: { shopId: string }) => {
    console.log(`Client requested to start session for shop: ${data.shopId}`);
    socket.join(data.shopId); // Le client rejoint une "room" spécifique à sa boutique
    connectToWhatsApp(data.shopId);
  });
});

// API Express pour l'envoi de messages (appelée par Next.js)
app.use(express.json());
app.post('/send-message', async (req, res) => {
  const { shopId, to, text } = req.body;
  const sock = sessions.get(shopId);
  if (!sock) {
    return res.status(404).json({ error: 'Session not found' });
  }
  try {
    await sock.sendMessage(to, { text });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`WhatsApp Engine listening on port ${PORT}`));