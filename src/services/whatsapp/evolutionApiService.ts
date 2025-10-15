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

    if (!this.apiUrl || !this.apiKey) {
      throw new Error('Evolution API URL and KEY must be configured in environment variables');
    }

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
      timeout: 60000, // 60 secondes
      validateStatus: (status) => status < 500, // Ne pas throw sur 4xx pour mieux gérer les erreurs
    });
  }

  async createInstance(data: CreateInstanceRequest): Promise<CreateInstanceResponse> {
    try {
      const response = await this.apiClient.post<CreateInstanceResponse>('/instance/create', {
        instanceName: data.instanceName,
        token: data.token,
        qrcode: data.qrcode ?? true,
        integration: data.integration || 'WHATSAPP-BAILEYS',
        webhook: data.webhook,
        reject_call: data.reject_call ?? false,
        msg_call: data.msg_call ?? '',
        groups_ignore: data.groups_ignore ?? true,
        always_online: data.always_online ?? false,
        read_messages: data.read_messages ?? false,
        read_status: data.read_status ?? false,
      });

      // Vérifier si la réponse est une erreur 401
      if (response.status === 401) {
        console.error('Evolution API Authentication Failed');
        throw new Error('Evolution API Authentication Failed - Vérifiez votre EVOLUTION_API_KEY');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error creating Evolution API instance:', error.message || error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Evolution API timeout - Le serveur met trop de temps à répondre');
      }
      
      // Extraire le message d'erreur d'Evolution API
      const evolutionError = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.response?.data;
      
      if (evolutionError) {
        const errorMsg = typeof evolutionError === 'string' 
          ? evolutionError 
          : JSON.stringify(evolutionError);
        throw new Error(`Evolution API Error: ${errorMsg}`);
      }
      
      throw error;
    }
  }

  async connectInstance(instanceName: string): Promise<ConnectInstanceResponse> {
    try {
      const response = await this.apiClient.get<ConnectInstanceResponse>(
        `/instance/connect/${instanceName}`
      );
      
      // Vérifier si c'est une erreur 404
      if (response.status === 404) {
        throw new Error('Instance not found - Please create the instance first');
      }
      
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
      
      // Vérifier si c'est une erreur 404
      if (response.status === 404) {
        throw new Error('Instance not found');
      }
      
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

  async sendMediaMessage(
    instanceName: string,
    data: {
      number: string;
      mediaType: 'image' | 'video' | 'audio' | 'document';
      media: string; // URL ou base64
      caption?: string;
      fileName?: string;
    }
  ): Promise<SendMessageResponse> {
    try {
      const response = await this.apiClient.post<SendMessageResponse>(
        `/message/sendMedia/${instanceName}`,
        {
          number: data.number,
          mediaMessage: {
            mediaType: data.mediaType,
            media: data.media,
            caption: data.caption,
            fileName: data.fileName,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending media message:', error);
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
