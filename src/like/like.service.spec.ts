import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikeService } from './like.service';
import { Like } from '../entity/Like.entity';
import { Deal } from '../entity/deal.entity';
import { User } from '../entity/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('LikeService', () => {
  let service: LikeService;
  let likeRepository: Repository<Like>;
  let dealRepository: Repository<Deal>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    nom: 'Doe',
    prenom: 'John',
  };

  const mockDeal = {
    id: 1,
    title: 'Test Deal',
    description: 'Test Description',
    price: 99.99,
    isActive: true,
  };

  const mockLike = {
    id: 1,
    user: mockUser,
    deal: mockDeal,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: getRepositoryToken(Like),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Deal),
          useValue: {
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

    service = module.get<LikeService>(LikeService);
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
    dealRepository = module.get<Repository<Deal>>(getRepositoryToken(Deal));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleLike', () => {
    it('should add like when user has not liked the deal', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(mockDeal as Deal);
      jest.spyOn(likeRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(likeRepository, 'create').mockReturnValue(mockLike as Like);
      jest.spyOn(likeRepository, 'save').mockResolvedValue(mockLike as Like);

      const result = await service.toggleLike(1, 1);

      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, deal: { id: 1 } },
      });
      expect(likeRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        deal: mockDeal,
      });
      expect(likeRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ liked: true, message: 'Like ajouté' });
    });

    it('should remove like when user has already liked the deal', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(mockDeal as Deal);
      jest.spyOn(likeRepository, 'findOne').mockResolvedValue(mockLike as Like);
      jest.spyOn(likeRepository, 'remove').mockResolvedValue(mockLike as Like);

      const result = await service.toggleLike(1, 1);

      expect(likeRepository.remove).toHaveBeenCalledWith(mockLike);
      expect(result).toEqual({ liked: false, message: 'Like retiré' });
    });

    it('should throw BadRequestException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.toggleLike(999, 1))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deal not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(null);

      await expect(service.toggleLike(1, 999))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserLikes', () => {
    it('should return user likes', async () => {
      const likes = [mockLike];
      jest.spyOn(likeRepository, 'find').mockResolvedValue(likes as Like[]);

      const result = await service.getUserLikes(1);

      expect(likeRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['deal'],
      });
      expect(result).toEqual(likes);
    });
  });
});