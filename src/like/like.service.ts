import {InjectRepository} from "@nestjs/typeorm";

import {Deal} from "../entity/deal.entity";
import {User} from "../entity/user.entity";
import {Injectable} from "@nestjs/common";
import {Like} from "../entity/Like.entity";
import {Repository} from "typeorm";

@Injectable()
export class LikeService {
  constructor(
      @InjectRepository(Like)
      private likeRepo: Repository<Like>,
      @InjectRepository(Deal)
      private dealRepo: Repository<Deal>,
      @InjectRepository(User)
      private userRepo: Repository<User>,
  ) {}

  async toggleLike(userId: number, dealId: number): Promise<{ liked: boolean; count: number }> {
    const existing = await this.likeRepo.findOne({
      where: { user: { id: userId }, deal: { id: dealId } },
    });

    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      const user = await this.userRepo.findOneBy({ id: userId });
      const deal = await this.dealRepo.findOneBy({ id: dealId });
      const like = this.likeRepo.create({ user, deal });
      await this.likeRepo.save(like);
    }

    const count = await this.likeRepo.count({ where: { deal: { id: dealId } } });
    const liked = await this.likeRepo.findOne({
      where: { user: { id: userId }, deal: { id: dealId } },
    });

    return { liked: !!liked, count };
  }

  async hasUserLiked(userId: number, dealId: number): Promise<boolean> {
    const existing = await this.likeRepo.findOne({
      where: {
        user: { id: userId },
        deal: { id: dealId },
      },
    });

    return !!existing;
  }



  async countLikes(dealId: number): Promise<number> {
    console.log(this.likeRepo.count({ where: { deal: { id: dealId } } }));
    return this.likeRepo.count({ where: { deal: { id: dealId } } });
  }

}
