import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {MessageService} from './message.service';

import {Public} from "../public.decorator";
import {AuthGuard} from "@nestjs/passport";


@Public()
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) {
    }

    @Post('send')
    @UseGuards(AuthGuard('jwt'))
    async sendMessage(@Req() req: any, @Body() body: any) {
        const senderId = req.user.id; // ✅ récupéré depuis le JWT
        const {receiverId, content} = body;

        return this.messageService.sendMessage(senderId, receiverId, content);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('conversation/:user1Id/:user2Id')
    async getConversation(
        @Param('user1Id') user1Id: number,
        @Param('user2Id') user2Id: number,
    ) {
        return this.messageService.getConversation(user1Id, user2Id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('all')
    async getAllMessages() {
        return this.messageService.getAllMessages();
    }
}
