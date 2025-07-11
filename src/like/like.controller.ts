import {Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {LikeService} from './like.service';
import {AuthGuard} from "@nestjs/passport";
import {Public} from "../public.decorator";

@Controller('likes')
export class LikeController {
  constructor(private likeService: LikeService) {}
  @Post(':dealId/like')
  @UseGuards(AuthGuard('jwt'))
  async likeDeal(@Param('dealId') dealId: number, @Req() req) {
    const userId = req.user.id;
    return this.likeService.toggleLike(userId, dealId);
  }

  @Get('has-liked/:dealId')
  @UseGuards(AuthGuard('jwt'))
  async hasLiked(@Param('dealId') dealId: number, @Req() req) {
    const userId = req.user.id;
    const liked = await this.likeService.hasUserLiked(userId, dealId);
    return { liked }; // 👈 Doit retourner { liked: true } ou false
  }

  @Public()
  @Get('count/:dealId')
  async getLikeCount(@Param('dealId') dealId: string) {
    const count = await this.likeService.countLikes(+dealId);
    console.log(1)
    console.log(count)
    return { count };
  }



}
