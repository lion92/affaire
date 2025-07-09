import {Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards} from '@nestjs/common';
import {CategoryService} from './category.service';
import {Category} from '../entity/category.entity';
import {JwtAuthGuard} from "../JwtAuthGuard";

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}


  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body('name') name: string): Promise<Category> {
    return this.categoryService.create(name);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
  @UseGuards(JwtAuthGuard)

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoryService.findOne(id);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
      @Param('id', ParseIntPipe) id: number,
      @Body('name') name: string,
  ): Promise<Category> {
    return this.categoryService.update(id, name);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.remove(id);
  }
}
