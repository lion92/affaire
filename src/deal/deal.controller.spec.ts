import { Test, TestingModule } from '@nestjs/testing';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { Deal } from '../entity/deal.entity';
import { AuthGuard } from '@nestjs/passport';

describe('DealController', () => {
  let controller: DealController;
  let service: DealService;

  const mockDeal: Deal = {
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
    category: null,
    likes: [],
  };

  const mockDealService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    activateDeal: jest.fn(),
    setValidation: jest.fn(),
    findAllWithLikeCount: jest.fn(),
    findAllActiveWithLikeCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealController],
      providers: [
        {
          provide: DealService,
          useValue: mockDealService,
        },
      ],
    })
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DealController>(DealController);
    service = module.get<DealService>(DealService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a deal', async () => {
      mockDealService.create.mockResolvedValue(mockDeal);

      const result = await controller.create(mockDeal);

      expect(service.create).toHaveBeenCalledWith(mockDeal);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('findAll', () => {
    it('should return all deals', async () => {
      const deals = [mockDeal];
      mockDealService.findAll.mockResolvedValue(deals);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(deals);
    });
  });

  describe('findAllActive', () => {
    it('should return all active deals', async () => {
      const activeDeals = [mockDeal];
      mockDealService.findAllActive.mockResolvedValue(activeDeals);

      const result = await controller.findAllActive();

      expect(service.findAllActive).toHaveBeenCalled();
      expect(result).toEqual(activeDeals);
    });
  });

  describe('findOne', () => {
    it('should return a deal by id', async () => {
      mockDealService.findOne.mockResolvedValue(mockDeal);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedDeal = { ...mockDeal, ...updateDto };
      mockDealService.update.mockResolvedValue(updatedDeal);

      const result = await controller.update(1, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedDeal);
    });
  });

  describe('remove', () => {
    it('should remove a deal', async () => {
      mockDealService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('activateDeal', () => {
    it('should activate a deal', async () => {
      const activatedDeal = { ...mockDeal, isActive: true };
      mockDealService.activateDeal.mockResolvedValue(activatedDeal);

      const result = await controller.activateDeal(1);

      expect(service.activateDeal).toHaveBeenCalledWith(1);
      expect(result).toEqual(activatedDeal);
    });
  });

  describe('validateDeal', () => {
    it('should validate a deal', async () => {
      const validationBody = { role: 'admin', validated: true };
      const validatedDeal = { ...mockDeal, adminValidated: true };
      mockDealService.setValidation.mockResolvedValue(validatedDeal);

      const result = await controller.validateDeal(1, validationBody);

      expect(service.setValidation).toHaveBeenCalledWith(1, 'admin', true);
      expect(result).toEqual(validatedDeal);
    });
  });

  describe('findAllWithLikes', () => {
    it('should return all deals with like counts', async () => {
      const dealsWithLikes = [{ ...mockDeal, likeCount: 5 }];
      mockDealService.findAllWithLikeCount.mockResolvedValue(dealsWithLikes);

      const result = await controller.findAllWithLikes();

      expect(service.findAllWithLikeCount).toHaveBeenCalled();
      expect(result).toEqual(dealsWithLikes);
    });
  });

  describe('findAllActiveWithLikes', () => {
    it('should return all active deals with like counts', async () => {
      const activeDealsWithLikes = [{ ...mockDeal, likeCount: 3 }];
      mockDealService.findAllActiveWithLikeCount.mockResolvedValue(activeDealsWithLikes);

      const result = await controller.findAllActiveWithLikes();

      expect(service.findAllActiveWithLikeCount).toHaveBeenCalled();
      expect(result).toEqual(activeDealsWithLikes);
    });
  });
});