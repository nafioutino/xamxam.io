// Types pour Evolution API avec Baileys

export interface EvolutionInstance {
  instanceName: string;
  instanceId: string;
  status: 'created' | 'connecting' | 'open' | 'closed';
  webhook_wa_business?: string | null;
  access_token_wa_business?: string;
}

export interface EvolutionInstanceSettings {
  reject_call: boolean;
  msg_call: string;
  groups_ignore: boolean;
  always_online: boolean;
  read_messages: boolean;
  read_status: boolean;
  sync_full_history: boolean;
}

export interface CreateInstanceRequest {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  number?: string;
  integration: 'WHATSAPP-BAILEYS' | 'WHATSAPP-BUSINESS';
  webhook?: string;
  webhook_by_events?: boolean;
  events?: EvolutionWebhookEvent[];
  reject_call?: boolean;
  msg_call?: string;
  groups_ignore?: boolean;
  always_online?: boolean;
  read_messages?: boolean;
  read_status?: boolean;
  websocket_enabled?: boolean;
}

export interface CreateInstanceResponse {
  instance: EvolutionInstance;
  hash: {
    apikey: string;
  };
  settings: EvolutionInstanceSettings;
}

export interface ConnectInstanceResponse {
  pairingCode?: string;
  code: string; // QR code en base64
  count: number;
}

export interface SendTextMessageRequest {
  number: string; // Format: 5585988888888 (country code + number)
  text: string;
  delay?: number;
  linkPreview?: boolean;
  mentionsEveryOne?: boolean;
  mentioned?: string[];
  quoted?: {
    key: {
      id: string;
    };
    message: {
      conversation: string;
    };
  };
}

export interface SendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: any;
  messageTimestamp: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'ERROR';
}

// Webhook Events
export type EvolutionWebhookEvent =
  | 'APPLICATION_STARTUP'
  | 'QRCODE_UPDATED'
  | 'MESSAGES_SET'
  | 'MESSAGES_UPSERT'
  | 'MESSAGES_UPDATE'
  | 'MESSAGES_DELETE'
  | 'SEND_MESSAGE'
  | 'CONTACTS_SET'
  | 'CONTACTS_UPSERT'
  | 'CONTACTS_UPDATE'
  | 'PRESENCE_UPDATE'
  | 'CHATS_SET'
  | 'CHATS_UPSERT'
  | 'CHATS_UPDATE'
  | 'CHATS_DELETE'
  | 'GROUPS_UPSERT'
  | 'GROUP_UPDATE'
  | 'GROUP_PARTICIPANTS_UPDATE'
  | 'CONNECTION_UPDATE'
  | 'CALL'
  | 'NEW_JWT_TOKEN'
  | 'TYPEBOT_START'
  | 'TYPEBOT_CHANGE_STATUS';

export interface WebhookQRCodeUpdated {
  event: 'qrcode.updated';
  instance: string;
  data: {
    qrcode: {
      code: string; // base64
      base64: string;
    };
  };
}

export interface WebhookConnectionUpdate {
  event: 'connection.update';
  instance: string;
  data: {
    state: 'open' | 'close' | 'connecting';
    statusReason?: number;
  };
}

export interface WebhookMessageUpsert {
  event: 'messages.upsert';
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      imageMessage?: {
        url: string;
        mimetype: string;
        caption?: string;
      };
      videoMessage?: {
        url: string;
        mimetype: string;
        caption?: string;
      };
      audioMessage?: {
        url: string;
        mimetype: string;
      };
      documentMessage?: {
        url: string;
        mimetype: string;
        fileName?: string;
      };
      stickerMessage?: {
        url: string;
        mimetype: string;
      };
      locationMessage?: {
        degreesLatitude: number;
        degreesLongitude: number;
      };
      contactMessage?: {
        displayName: string;
        vcard: string;
      };
    };
    messageType: 'conversation' | 'imageMessage' | 'videoMessage' | 'audioMessage' | 'documentMessage' | 'stickerMessage' | 'locationMessage' | 'contactMessage';
    messageTimestamp: number;
    owner: string;
    source: string;
  };
}

export interface WebhookMessageUpdate {
  event: 'messages.update';
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    status: 'ERROR' | 'PENDING' | 'SERVER_ACK' | 'DELIVERY_ACK' | 'READ' | 'PLAYED';
  };
}

export type EvolutionWebhookPayload =
  | WebhookQRCodeUpdated
  | WebhookConnectionUpdate
  | WebhookMessageUpsert
  | WebhookMessageUpdate;

// Instance status check
export interface InstanceStatusResponse {
  instance: {
    instanceName: string;
    owner: string;
    profileName?: string;
    profilePictureUrl?: string;
    profileStatus?: string;
    state: 'open' | 'close' | 'connecting';
  };
}
