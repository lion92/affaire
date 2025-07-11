import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DealService } from './deal.service';
import { Deal } from '../entity/deal.entity';
import { JwtAuthGuard } from '../JwtAuthGuard';
import {AuthGuard} from "@nestjs/passport";

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
  @Get('active')
  async findAllActive(): Promise<Deal[]> {
    console.log(this.dealService.findAllActive())
    return this.dealService.findAllActive();
  }
  @UseGuards(AuthGuard('jwt'))
  @Put('/:id/activate')
  activateDeal(@Param('id') id: number) {
    return this.dealService.activateDeal(id); // Met isActive = true
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Deal> {
    return this.dealService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDealDto: Deal,
  ): Promise<Deal> {
    return this.dealService.update(id, updateDealDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.dealService.remove(id);
  }


  @Post(':id/validate')
  async validateDeal(
      @Param('id') id: number,
      @Body() body: { role: string, validated: boolean }
  ) {
    return this.dealService.setValidation(id, body.role, body.validated);
  }
  @Get('with-likes')
  async findAllWithLikes() {
    return this.dealService.findAllWithLikeCount();
  }

  @Get('active-with-likes')
  async findAllActiveWithLikes() {
    return this.dealService.findAllActiveWithLikeCount();
  }

}
