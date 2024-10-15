import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { GeminiService } from './gemini.service';
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Asegúrate de que el paquete está instalado correctamente
const qrcode = require('qrcode-terminal'); // Usando require

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;
  private apiKey = 'YOUR_GOOGLE_API_KEY'; // Reemplaza con tu clave API de Google
  private googleAI;

  constructor(private geminiService: GeminiService) {
    // Inicializar el cliente de Google Generative AI
    this.googleAI = new GoogleGenerativeAI({
      apiKey: this.apiKey,
    });

    // Inicializar el cliente de WhatsApp
    this.client = new Client({
      authStrategy: new LocalAuth(), // Usa LocalAuth para guardar sesión
    });

    // Mostrar QR para autorización de WhatsApp Web
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('Escanea el código QR para autorizar el cliente.');
    });

    // Cuando el cliente está listo
    this.client.on('ready', () => {
      console.log('Client is ready!');
    });

    // Escuchar la recepción de mensajes
    this.client.on('message_create', async (message) => {
      console.log('Message received to:', message.from);
      // if (message.body.startsWith('!ia ') || message.from.split('@')[0] == '59168103468') {
      if (message.body.startsWith('!ia ')) {
        const userInput = message.body.slice(5); // Extraer la pregunta
        // this.geminiService.run(userInput)
        try {
          // Obtener respuesta de Google Generative AI
          const response = await this.geminiService.run(userInput)
          message.reply(response); // Responder al usuario en WhatsApp
        } catch (error) {
          console.error('Error generating text:', error);
          message.reply('Lo siento, hubo un error al generar la respuesta.');
        }
      }
    });
  }

  // Método para inicializar el cliente de WhatsApp
  onModuleInit() {
    this.client.initialize();
  }

  // Método para generar texto usando la API de Google Generative AI
  private async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.googleAI.generateMessage({
        model: 'models/text-bison-001',
        prompt: `You are a helpful and informative chatbot. ${prompt}`, // Agregar contexto al prompt
      });

      return response?.candidates[0]?.content || 'No se pudo generar una respuesta.';
    } catch (error) {
      console.error('Error generating text from Google AI:', error);
      return 'Lo siento, hubo un error al obtener una respuesta. Por favor, intenta más tarde.';
    }
  }
}
