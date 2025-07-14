import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common';
import {MessageService} from './message.service';

import {Public} from "../public.decorator";
import {SendMessageDto} from "../dto/SendMessageDTO";
import {JwtAuthGuard} from "../JwtAuthGuard";


@Public()
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {
    }

    @Post('send')
    @UseGuards(JwtAuthGuard)
    async sendMessage({req, body}: { req: any, body: any }) {
        const senderId = req.user.id; // ✅ récupéré depuis le token JWT
        const { receiverId, content } = body;

        return this.messageService.sendMessage(senderId, receiverId, content);
    }

    @UseGuards(JwtAuthGuard)
    @Get('conversation/:user1Id/:user2Id')
    async getConversation(
        @Param('user1Id') user1Id: number,
        @Param('user2Id') user2Id: number,
    ) {
        return this.messageService.getConversation(user1Id, user2Id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getAllMessages() {
        return this.messageService.getAllMessages();
    }
}
