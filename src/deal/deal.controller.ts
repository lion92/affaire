import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards} from '@nestjs/common';
import {DealService} from './deal.service';
import {Deal} from '../entity/deal.entity';
import {JwtAuthGuard} from "../JwtAuthGuard";

@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDealDto: Deal): Promise<Deal> {
    return this.dealService.create(createDealDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Deal[]> {
    return this.dealService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Deal> {
    return this.dealService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDealDto: Deal,
  ): Promise<Deal> {
    return this.dealService.update(id, updateDealDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dealService.remove(id);
  }
}
