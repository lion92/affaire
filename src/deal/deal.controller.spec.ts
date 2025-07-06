import { Test, TestingModule } from '@nestjs/testing';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { Deal } from '../entity/deal.entity';

const mockDeal: Deal = {
  id: 1,
  title: 'Bon plan test',
  description: 'Description test',
  imageUrl: 'http://example.com/image.jpg',
  price: 99.99,
  dealUrl: 'http://example.com/deal',
  isActive: true,
  createdAt: new Date(),
  category: 'Test',
};

describe('DealController', () => {
  let controller: DealController;
  let service: DealService;

  const mockDealService = {
    create: jest.fn().mockResolvedValue(mockDeal),
    findAll: jest.fn().mockResolvedValue([mockDeal]),
    findOne: jest.fn().mockResolvedValue(mockDeal),
    update: jest.fn().mockResolvedValue({ ...mockDeal, title: 'Updated Title' }),
    remove: jest.fn().mockResolvedValue(undefined),
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
    }).compile();

    controller = module.get<DealController>(DealController);
    service = module.get<DealService>(DealService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a deal', async () => {
      const dto = { ...mockDeal };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('findAll', () => {
    it('should return an array of deals', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockDeal]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a deal by id', async () => {
      const result = await controller.findOne(1);
      expect(result).toEqual(mockDeal);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const dto = { ...mockDeal, title: 'Updated Title' };
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.title).toEqual('Updated Title');
    });
  });

  describe('remove', () => {
    it('should remove a deal', async () => {
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
