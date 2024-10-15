import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { GeminiService } from './gemini.service';

@Module({
  providers: [WhatsappService,GeminiService],
})
export class WhatsappModule {}
