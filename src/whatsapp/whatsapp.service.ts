import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { GeminiService } from './gemini.service';
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Asegúrate de que el paquete está instalado correctamente
const qrcode = require('qrcode-terminal'); // Usando require

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;


  constructor(private geminiService: GeminiService) {

    // Inicializar el cliente de WhatsApp
    this.client = new Client({
      authStrategy: new LocalAuth(), puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Añadir opciones aquí
      }, // Usa LocalAuth para guardar sesión
    },);

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
}
