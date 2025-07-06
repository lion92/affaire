import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from '../entity/deal.entity';

@Injectable()
export class DealService {
  constructor(
      @InjectRepository(Deal)
      private readonly dealRepository: Repository<Deal>,
  ) {}

  async create(createDealDto: Deal): Promise<Deal> {
    const deal = this.dealRepository.create(createDealDto);
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

  async update(id: number, updateDealDto: Deal): Promise<Deal> {
    const deal = await this.findOne(id);
    const updated = Object.assign(deal, updateDealDto);
    return this.dealRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const deal = await this.findOne(id);
    await this.dealRepository.remove(deal);
  }
}
