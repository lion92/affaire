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
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Deal),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
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
      jest.spyOn(likeRepository, 'findOne')
        .mockResolvedValueOnce(null) // First call - existing like check
        .mockResolvedValueOnce(mockLike as Like); // Second call - liked status check
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser as User);
      jest.spyOn(dealRepository, 'findOneBy').mockResolvedValue(mockDeal as Deal);
      jest.spyOn(likeRepository, 'create').mockReturnValue(mockLike as Like);
      jest.spyOn(likeRepository, 'save').mockResolvedValue(mockLike as Like);
      jest.spyOn(likeRepository, 'count').mockResolvedValue(5);

      const result = await service.toggleLike(1, 1);

      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, deal: { id: 1 } },
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(dealRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(likeRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        deal: mockDeal,
      });
      expect(likeRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ liked: true, count: 5 });
    });

    it('should remove like when user has already liked the deal', async () => {
      jest.spyOn(likeRepository, 'findOne')
        .mockResolvedValueOnce(mockLike as Like) // First call - existing like check
        .mockResolvedValueOnce(null); // Second call - liked status check after removal
      jest.spyOn(likeRepository, 'remove').mockResolvedValue(mockLike as Like);
      jest.spyOn(likeRepository, 'count').mockResolvedValue(3);

      const result = await service.toggleLike(1, 1);

      expect(likeRepository.remove).toHaveBeenCalledWith(mockLike);
      expect(result).toEqual({ liked: false, count: 3 });
    });
  });

  describe('hasUserLiked', () => {
    it('should return true if user has liked the deal', async () => {
      jest.spyOn(likeRepository, 'findOne').mockResolvedValue(mockLike as Like);

      const result = await service.hasUserLiked(1, 1);

      expect(likeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 1 }, deal: { id: 1 } },
      });
      expect(result).toBe(true);
    });

    it('should return false if user has not liked the deal', async () => {
      jest.spyOn(likeRepository, 'findOne').mockResolvedValue(null);

      const result = await service.hasUserLiked(1, 1);

      expect(result).toBe(false);
    });
  });

  describe('countLikes', () => {
    it('should return the number of likes for a deal', async () => {
      jest.spyOn(likeRepository, 'count').mockResolvedValue(10);

      const result = await service.countLikes(1);

      expect(likeRepository.count).toHaveBeenCalledWith({
        where: { deal: { id: 1 } },
      });
      expect(result).toBe(10);
    });
  });
});