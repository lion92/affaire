import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import {Deal} from "../entity/deal.entity";
import {User} from "../entity/user.entity";
import {Like} from "../entity/Like.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Like, Deal, User])],
  providers: [LikeService],
  controllers: [LikeController],
})
export class LikeModule {}
