import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealService } from './deal.service';
import { Deal } from '../entity/deal.entity';
import { Like } from '../entity/Like.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DealService', () => {
  let service: DealService;
  let dealRepository: Repository<Deal>;
  let likeRepository: Repository<Like>;

  const mockDeal = {
    id: 1,
    title: 'Test Deal',
    description: 'Test Description',
    price: 99.99,
    imageUrl: 'test.jpg',
    dealUrl: 'https://test.com',
    isActive: true,
    categoryId: 1,
    managerValidated: false,
    adminValidated: false,
    published: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        {
          provide: getRepositoryToken(Deal),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Like),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DealService>(DealService);
    dealRepository = module.get<Repository<Deal>>(getRepositoryToken(Deal));
    likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new deal', async () => {
      const createDealDto = {
        title: 'New Deal',
        description: 'New Description',
        price: 50.00,
        imageUrl: 'new.jpg',
        dealUrl: 'https://newdeal.com',
        categoryId: 1,
        isActive: true,
      };

      jest.spyOn(dealRepository, 'create').mockReturnValue(mockDeal as Deal);
      jest.spyOn(dealRepository, 'save').mockResolvedValue(mockDeal as Deal);

      const result = await service.create(createDealDto);

      expect(dealRepository.create).toHaveBeenCalledWith({
        title: createDealDto.title,
        description: createDealDto.description,
        imageUrl: createDealDto.imageUrl,
        price: createDealDto.price,
        dealUrl: createDealDto.dealUrl,
        isActive: true,
        categoryId: createDealDto.categoryId,
      });
      expect(dealRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDeal);
    });
  });

  describe('findAll', () => {
    it('should return all deals', async () => {
      const deals = [mockDeal];
      jest.spyOn(dealRepository, 'find').mockResolvedValue(deals as Deal[]);

      const result = await service.findAll();

      expect(dealRepository.find).toHaveBeenCalled();
      expect(result).toEqual(deals);
    });
  });

  describe('findAllActive', () => {
    it('should return only active deals', async () => {
      const activeDeals = [mockDeal];
      jest.spyOn(dealRepository, 'find').mockResolvedValue(activeDeals as Deal[]);

      const result = await service.findAllActive();

      expect(dealRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual(activeDeals);
    });
  });

  describe('findOne', () => {
    it('should return a deal by id', async () => {
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(mockDeal as Deal);

      const result = await service.findOne(1);

      expect(dealRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when deal not found', async () => {
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updateDto = { title: 'Updated Title', price: 75.00 };
      const updatedDeal = { ...mockDeal, ...updateDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockDeal as Deal);
      jest.spyOn(dealRepository, 'save').mockResolvedValue(updatedDeal as Deal);

      const result = await service.update(1, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(dealRepository.save).toHaveBeenCalled();
      expect(result.title).toBe(updateDto.title);
      expect(result.price).toBe(updateDto.price);
    });
  });

  describe('remove', () => {
    it('should remove a deal', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockDeal as Deal);
      jest.spyOn(dealRepository, 'remove').mockResolvedValue(mockDeal as Deal);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(dealRepository.remove).toHaveBeenCalledWith(mockDeal);
    });
  });

  describe('setValidation', () => {
    it('should validate deal as admin', async () => {
      const deal = { ...mockDeal, adminValidated: false, isActive: false };
      const validatedDeal = { ...deal, adminValidated: true, isActive: true };

      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(deal as Deal);
      jest.spyOn(dealRepository, 'save').mockResolvedValue(validatedDeal as Deal);

      const result = await service.setValidation(1, 'admin', true);

      expect(dealRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(dealRepository.save).toHaveBeenCalled();
      expect(result.adminValidated).toBe(true);
      expect(result.isActive).toBe(true);
    });

    it('should validate deal as manager', async () => {
      const deal = { ...mockDeal, managerValidated: false, isActive: false };
      const validatedDeal = { ...deal, managerValidated: true, isActive: true };

      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(deal as Deal);
      jest.spyOn(dealRepository, 'save').mockResolvedValue(validatedDeal as Deal);

      const result = await service.setValidation(1, 'manager', true);

      expect(result.managerValidated).toBe(true);
      expect(result.isActive).toBe(true);
    });

    it('should throw BadRequestException for invalid role', async () => {
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(mockDeal as Deal);

      await expect(service.setValidation(1, 'invalid', true))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deal not found', async () => {
      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(null);

      await expect(service.setValidation(999, 'admin', true))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('activateDeal', () => {
    it('should activate deal when validations are complete', async () => {
      const validatedDeal = {
        ...mockDeal,
        managerValidated: true,
        adminValidated: true,
        isActive: false,
      };
      const activatedDeal = { ...validatedDeal, isActive: true };

      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(validatedDeal as Deal);
      jest.spyOn(dealRepository, 'save').mockResolvedValue(activatedDeal as Deal);

      const result = await service.activateDeal(1);

      expect(result.isActive).toBe(true);
    });

    it('should throw BadRequestException when validations incomplete', async () => {
      const invalidDeal = {
        ...mockDeal,
        managerValidated: false,
        adminValidated: false,
      };

      jest.spyOn(dealRepository, 'findOne').mockResolvedValue(invalidDeal as Deal);

      await expect(service.activateDeal(1))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllWithLikeCount', () => {
    it('should return deals with like count', async () => {
      const deals = [mockDeal];
      jest.spyOn(dealRepository, 'find').mockResolvedValue(deals as Deal[]);
      jest.spyOn(likeRepository, 'count').mockResolvedValue(5);

      const result = await service.findAllWithLikeCount();

      expect(dealRepository.find).toHaveBeenCalled();
      expect(likeRepository.count).toHaveBeenCalledWith({
        where: { deal: { id: mockDeal.id } }
      });
      expect(result[0]).toEqual({ ...mockDeal, likeCount: 5 });
    });
  });

  describe('findAllActiveWithLikeCount', () => {
    it('should return active deals with like count', async () => {
      const activeDeals = [mockDeal];
      jest.spyOn(dealRepository, 'find').mockResolvedValue(activeDeals as Deal[]);
      jest.spyOn(likeRepository, 'count').mockResolvedValue(3);

      const result = await service.findAllActiveWithLikeCount();

      expect(dealRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(likeRepository.count).toHaveBeenCalledWith({
        where: { deal: { id: mockDeal.id } }
      });
      expect(result[0]).toEqual({ ...mockDeal, likeCount: 3 });
    });
  });
});