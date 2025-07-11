import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Deal} from '../entity/deal.entity';
import {DealService} from './deal.service';
import {DealController} from './deal.controller';
import {Like} from "../entity/Like.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Deal, Like])],
  controllers: [DealController],
  providers: [DealService],
  exports: [DealService], // si tu veux pouvoir l'utiliser ailleurs
})
export class DealModule {}
