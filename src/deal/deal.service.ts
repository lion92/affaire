import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Deal} from '../entity/deal.entity';
import {DealDTO} from '../dto/DealDTO';

@Injectable()
export class DealService {
  constructor(
      @InjectRepository(Deal)
      private readonly dealRepository: Repository<Deal>,
  ) {}

  async create(createDealDto: DealDTO): Promise<Deal> {
    const deal = this.dealRepository.create({
      title: createDealDto.title,
      description: createDealDto.description,
      imageUrl: createDealDto.imageUrl,
      price: createDealDto.price,
      dealUrl: createDealDto.dealUrl,
      isActive: createDealDto.isActive ?? true,
      categoryId: createDealDto.categoryId,
    });

    return this.dealRepository.save(deal);
  }

  async findAll(): Promise<Deal[]> {
    return this.dealRepository.find();
  }

  async findOne(id: number): Promise<Deal> {
    const deal = await this.dealRepository.findOne({ where: { id } });
    if (!deal) {
      throw new NotFoundException(`Deal #${id} not found`);
    }
    return deal;
  }

  async update(id: number, updateDealDto: DealDTO): Promise<Deal> {
    const deal = await this.findOne(id);

    deal.title = updateDealDto.title ?? deal.title;
    deal.description = updateDealDto.description ?? deal.description;
    deal.imageUrl = updateDealDto.imageUrl ?? deal.imageUrl;
    deal.price = updateDealDto.price ?? deal.price;
    deal.dealUrl = updateDealDto.dealUrl ?? deal.dealUrl;
    deal.isActive = updateDealDto.isActive ?? deal.isActive;

    if (updateDealDto.categoryId !== undefined) {
      deal.categoryId = updateDealDto.categoryId;
    }

    return this.dealRepository.save(deal);
  }

  async remove(id: number): Promise<void> {
    const deal = await this.findOne(id);
    await this.dealRepository.remove(deal);
  }
}
