import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { DealService } from './deal.service';
import { Deal } from '../entity/deal.entity';

@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post()
  create(@Body() createDealDto: Deal): Promise<Deal> {
    return this.dealService.create(createDealDto);
  }

  @Get()
  findAll(): Promise<Deal[]> {
    return this.dealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Deal> {
    return this.dealService.findOne(id);
  }

  @Put(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDealDto: Deal,
  ): Promise<Deal> {
    return this.dealService.update(id, updateDealDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dealService.remove(id);
  }
}
