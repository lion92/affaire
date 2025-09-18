import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageService } from './message.service';
import { Message } from '../entity/message.entity';
import { User } from '../entity/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: Repository<Message>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 1,
    email: 'sender@example.com',
    nom: 'Sender',
    prenom: 'User',
  };

  const mockReceiver = {
    id: 2,
    email: 'receiver@example.com',
    nom: 'Receiver',
    prenom: 'User',
  };

  const mockMessage = {
    id: 1,
    content: 'Test message',
    sender: mockUser,
    receiver: mockReceiver,
    sentAt: new Date(),
    isRead: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const messageDto = {
        content: 'Test message',
        receiverId: 2,
      };

      jest.spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser as User)
        .mockResolvedValueOnce(mockReceiver as User);
      jest.spyOn(messageRepository, 'create').mockReturnValue(mockMessage as Message);
      jest.spyOn(messageRepository, 'save').mockResolvedValue(mockMessage as Message);

      const result = await service.sendMessage(1, messageDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(messageRepository.create).toHaveBeenCalledWith({
        content: messageDto.content,
        sender: mockUser,
        receiver: mockReceiver,
      });
      expect(messageRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should throw NotFoundException when sender not found', async () => {
      const messageDto = { content: 'Test', receiverId: 2 };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.sendMessage(999, messageDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when receiver not found', async () => {
      const messageDto = { content: 'Test', receiverId: 999 };

      jest.spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser as User)
        .mockResolvedValueOnce(null);

      await expect(service.sendMessage(1, messageDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversation', () => {
    it('should return conversation between two users', async () => {
      const messages = [mockMessage];
      jest.spyOn(messageRepository, 'find').mockResolvedValue(messages as Message[]);

      const result = await service.getConversation(1, 2);

      expect(messageRepository.find).toHaveBeenCalledWith({
        where: [
          { sender: { id: 1 }, receiver: { id: 2 } },
          { sender: { id: 2 }, receiver: { id: 1 } },
        ],
        relations: ['sender', 'receiver'],
        order: { sentAt: 'ASC' },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('getUserMessages', () => {
    it('should return all messages for a user', async () => {
      const messages = [mockMessage];
      jest.spyOn(messageRepository, 'find').mockResolvedValue(messages as Message[]);

      const result = await service.getUserMessages(1);

      expect(messageRepository.find).toHaveBeenCalledWith({
        where: [
          { sender: { id: 1 } },
          { receiver: { id: 1 } },
        ],
        relations: ['sender', 'receiver'],
        order: { sentAt: 'DESC' },
      });
      expect(result).toEqual(messages);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const unreadMessage = { ...mockMessage, isRead: false };
      const readMessage = { ...mockMessage, isRead: true };

      jest.spyOn(messageRepository, 'findOne').mockResolvedValue(unreadMessage as Message);
      jest.spyOn(messageRepository, 'save').mockResolvedValue(readMessage as Message);

      const result = await service.markAsRead(1);

      expect(messageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(messageRepository.save).toHaveBeenCalledWith({
        ...unreadMessage,
        isRead: true,
      });
      expect(result).toEqual(readMessage);
    });

    it('should throw NotFoundException when message not found', async () => {
      jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);

      await expect(service.markAsRead(999))
        .rejects.toThrow(NotFoundException);
    });
  });
});