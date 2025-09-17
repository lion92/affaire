import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from '../entity/link.entity';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async create(linkData: Partial<Link>): Promise<Link> {
    const link = this.linksRepository.create(linkData);
    return this.linksRepository.save(link);
  }

  async findAll(): Promise<Link[]> {
    return this.linksRepository.find();
  }

  async findActive(): Promise<Link[]> {
    return this.linksRepository.find({ where: { validated: true } });
  }

  async findOne(id: number): Promise<Link> {
    return this.linksRepository.findOne({ where: { id } });
  }

  async update(id: number, linkData: Partial<Link>): Promise<Link> {
    await this.linksRepository.update(id, linkData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.linksRepository.delete(id);
  }

  async validate(id: number): Promise<Link> {
    const link = await this.findOne(id);
    if (!link) {
      throw new Error('Link not found');
    }

    await this.linksRepository.update(id, { validated: true });
    return this.findOne(id);
  }
}