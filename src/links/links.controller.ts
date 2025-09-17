import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from '../entity/link.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createLinkDto: Partial<Link>): Promise<Link> {
    return this.linksService.create(createLinkDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(): Promise<Link[]> {
    return this.linksService.findAll();
  }

  @Get('active')
  findActive(): Promise<Link[]> {
    return this.linksService.findActive();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Link> {
    return this.linksService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLinkDto: Partial<Link>,
  ): Promise<Link> {
    return this.linksService.update(id, updateLinkDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.linksService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/validate')
  validate(@Param('id', ParseIntPipe) id: number): Promise<Link> {
    return this.linksService.validate(id);
  }
}