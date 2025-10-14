import axios, { AxiosInstance } from 'axios';
import type {
  CreateInstanceRequest,
  CreateInstanceResponse,
  ConnectInstanceResponse,
  SendTextMessageRequest,
  SendMessageResponse,
  InstanceStatusResponse,
} from '@/types/evolution-api';

class EvolutionApiService {
  private apiClient: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.EVOLUTION_API_URL || '';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';

    console.log('Evolution API Service initialized:', {
      apiUrl: this.apiUrl ? `${this.apiUrl.substring(0, 30)}...` : 'NOT SET',
      apiKeySet: !!this.apiKey,
    });

    if (!this.apiUrl || !this.apiKey) {
      throw new Error('Evolution API URL and KEY must be configured in environment variables');
    }

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      timeout: 60000, // 60 secondes au lieu de 30
    });
  }

  async createInstance(data: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    try {
      console.log('Creating Evolution instance:', {
        instanceName: data.instanceName,
        integration: data.integration,
        webhook: data.webhook,
      });

      const response = await this.apiClient.post<CreateInstanceResponse>('/instance/create', {
        instanceName: data.instanceName,
        token: data.token,
        qrcode: data.qrcode ?? true,
        integration: data.integration || 'WHATSAPP-BAILEYS',
        webhook: data.webhook,
        webhook_by_events: data.webhook_by_events ?? false,
        events: data.events || [
          'QRCODE_UPDATED',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'CONNECTION_UPDATE',
          'SEND_MESSAGE',
        ],
        reject_call: data.reject_call ?? false,
        msg_call: data.msg_call ?? '',
        groups_ignore: data.groups_ignore ?? true,
        always_online: data.always_online ?? false,
        read_messages: data.read_messages ?? false,
        read_status: data.read_status ?? false,
      });

      console.log('Evolution instance created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating Evolution API instance:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Evolution API timeout - Le serveur met trop de temps à répondre');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  }

  async connectInstance(instanceName: string): Promise<ConnectInstanceResponse> {
    try {
      const response = await this.apiClient.get<ConnectInstanceResponse>(
        `/instance/connect/${instanceName}`
      );
      return response.data;
    } catch (error) {
      console.error('Error connecting to instance:', error);
      throw error;
    }
  }

  async getInstanceStatus(instanceName: string): Promise<InstanceStatusResponse> {
    try {
      const response = await this.apiClient.get<InstanceStatusResponse>(
        `/instance/connectionState/${instanceName}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching instance status:', error);
      throw error;
    }
  }

  async restartInstance(instanceName: string): Promise<void> {
    try {
      await this.apiClient.put(`/instance/restart/${instanceName}`);
    } catch (error) {
      console.error('Error restarting instance:', error);
      throw error;
    }
  }

  async logoutInstance(instanceName: string): Promise<void> {
    try {
      await this.apiClient.delete(`/instance/logout/${instanceName}`);
    } catch (error) {
      console.error('Error logging out instance:', error);
      throw error;
    }
  }

  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await this.apiClient.delete(`/instance/delete/${instanceName}`);
    } catch (error) {
      console.error('Error deleting instance:', error);
      throw error;
    }
  }

  async sendTextMessage(
    instanceName: string,
    data: SendTextMessageRequest
  ): Promise<SendMessageResponse> {
    try {
      const response = await this.apiClient.post<SendMessageResponse>(
        `/message/sendText/${instanceName}`,
        {
          number: data.number,
          text: data.text,
          delay: data.delay,
          linkPreview: data.linkPreview ?? true,
          mentionsEveryOne: data.mentionsEveryOne ?? false,
          mentioned: data.mentioned,
          quoted: data.quoted,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  async sendImageMessage(
    instanceName: string,
    data: { number: string; image: string; caption?: string }
  ): Promise<SendMessageResponse> {
    try {
      const response = await this.apiClient.post<SendMessageResponse>(
        `/message/sendMedia/${instanceName}`,
        {
          number: data.number,
          mediatype: 'image',
          media: data.image,
          caption: data.caption,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending image message:', error);
      throw error;
    }
  }

  async markMessageAsRead(
    instanceName: string,
    data: { key: { remoteJid: string; fromMe: boolean; id: string } }
  ): Promise<void> {
    try {
      await this.apiClient.post(`/chat/markMessageAsRead/${instanceName}`, data);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}

export const evolutionApiService = new EvolutionApiService();
