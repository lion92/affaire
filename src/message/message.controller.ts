import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessageService } from './message.service';

import {Public} from "../public.decorator";
import {SendMessageDto} from "../dto/SendMessageDTO";


@Public()
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto) {
    console.log('Message reçu :', dto); // 👈 pour vérifier que ça arrive
    return this.messageService.sendMessage(dto.senderId, dto.receiverId, dto.content);
  }
@Public()
  @Get('conversation/:user1Id/:user2Id')
  async getConversation(
      @Param('user1Id') user1Id: number,
      @Param('user2Id') user2Id: number,
  ) {
    return this.messageService.getConversation(user1Id, user2Id);
  }
}
