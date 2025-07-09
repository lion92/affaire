import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Deal} from '../entity/deal.entity';
import {DealService} from './deal.service';
import {NotFoundException} from '@nestjs/common';

const mockDeal = {
  id: 1,
  title: 'Bon plan test',
  description: 'Description test',
  imageUrl: 'http://example.com/image.jpg',
  price: 100.0,
  dealUrl: 'http://example.com/deal',
  isActive: true,
  createdAt: new Date(),
  category: 'Test',
};

describe('DealService', () => {
  let service: DealService;
  let repository: Repository<Deal>;

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(mockDeal),
    find: jest.fn().mockResolvedValue([mockDeal]),
    findOne: jest.fn().mockResolvedValue(mockDeal),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealService,
        {
          provide: getRepositoryToken(Deal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DealService>(DealService);
    repository = module.get<Repository<Deal>>(getRepositoryToken(Deal));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a deal', async () => {
      const dto = { ...mockDeal };
      const result = await service.create(dto as Deal);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('findAll', () => {
    it('should return all deals', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('findOne', () => {
    it('should return a deal by id', async () => {
      const result = await service.findOne(1);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException if deal not found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updatedDeal = { ...mockDeal, title: 'Updated title' };
      repository.save = jest.fn().mockResolvedValue(updatedDeal);

      const result = await service.update(1, updatedDeal as Deal);
      expect(result).toEqual(updatedDeal);
    });
  });

  describe('remove', () => {
    it('should remove a deal', async () => {
      const result = await service.remove(1);
      expect(repository.remove).toHaveBeenCalledWith(mockDeal);
      expect(result).toBeUndefined();
    });
  });
});
