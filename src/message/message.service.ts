// src/message/message.service.ts
import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from "../entity/user.entity";
import {Message} from "../entity/message.entity";

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
    }

    async sendMessage(senderId: number, receiverId: number | null, content: string): Promise<Message> {
        const sender = await this.userRepository.findOne({ where: { id: senderId } });
        if (!sender) {
            throw new NotFoundException('Sender not found');
        }

        let receiver = null;
        if (receiverId) {
            receiver = await this.userRepository.findOne({ where: { id: receiverId } });
            if (!receiver) {
                throw new NotFoundException('Receiver not found');
            }
        }

        const message = this.messageRepository.create({
            content,
            sender,
            receiver, // ✅ receiver peut être null pour un message public
        });

        return this.messageRepository.save(message);
    }


    async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
        return this.messageRepository.find({
            where: [
                {sender: {id: user1Id}, receiver: {id: user2Id}},
                {sender: {id: user2Id}, receiver: {id: user1Id}},
            ],
            order: {createdAt: 'ASC'},
            relations: ['sender', 'receiver'],
        });
    }

    async getAllMessages() {
        return this.messageRepository.find({
            order: {createdAt: 'ASC'},
            relations: ['sender'], // 👈 pour pouvoir afficher sender.nom dans React
        });
    }

}
