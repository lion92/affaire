import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Deal} from '../entity/deal.entity';
import {DealDTO} from '../dto/DealDTO';

@Injectable()
export class DealService {
  constructor(
      @InjectRepository(Deal)
      private readonly dealRepository: Repository<Deal>,
  ) {
  }

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

  async findAllActive(): Promise<Deal[]> {
    return this.dealRepository.find({
      where: {
        isActive: true,
      },
    });
  }

  async findOne(id: number): Promise<Deal> {
    const deal = await this.dealRepository.findOne({where: {id}});
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

  async validateDeal(dealId: number, role: string, validate: boolean): Promise<Deal> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException('Affaire non trouvée');
    }

    if (role === 'manager') {
      deal.managerValidated = validate;
    } else if (role === 'admin') {
      deal.adminValidated = validate;
    } else {
      throw new BadRequestException('Rôle invalide');
    }

    // Met à jour isActive : true seulement si admin ET manager ont validé
    deal.isActive = deal.managerValidated && deal.adminValidated;

    return this.dealRepository.save(deal);
  }

  async activateDeal(dealId: number): Promise<Deal> {
    const deal = await this.dealRepository.findOne({ where: { id: dealId } });
    if (!deal) {
      throw new NotFoundException('Affaire non trouvée');
    }

    // Par exemple, on vérifie que les validations sont faites
    if (!deal.managerValidated || !deal.adminValidated) {
      throw new BadRequestException('L\'affaire doit être validée par le manager et l\'admin avant activation');
    }

    deal.isActive = true;

    return this.dealRepository.save(deal);
  }

  async setValidation(id: number, role: string, validated: boolean) {
    const deal = await this.dealRepository.findOne({ where: { id: id } });
    if (!deal) {
      throw new BadRequestException('invaldie');
    }
    if (role === 'admin') {
      deal.adminValidated = validated;
    } else if (role === 'manager') {
      deal.managerValidated = validated;
    } else {
      throw new BadRequestException('Rôle invalide');
    }

    // Active l'affaire si validée par admin ou manager
    deal.isActive = deal.adminValidated || deal.managerValidated;


    await this.dealRepository.save(deal);
    return deal;
  }



}
