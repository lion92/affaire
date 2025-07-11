import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Category} from '../entity/category.entity';
import {CategoryService} from './category.service';
import {CategoryController} from './category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], // si tu veux utiliser CategoryService ailleurs
})
export class CategoryModule {}
