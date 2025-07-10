import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { JwtAuthGuard } from '../JwtAuthGuard';
import { UpdateUserProfileDto } from '../dto/updateProfileDTO';

@Controller('user-profile')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  // 🔍 Obtenir son propre profil
  @Get('me')
  async getProfile(@Req() req) {
    return this.userProfileService.getUserProfile(req.user.id);
  }

  // 🔍 Récupérer tous les utilisateurs sauf les admins (admin uniquement)
  @Get()
  async getAllUsers(@Req() req) {
    const requester = await this.userProfileService.getUserProfile(req.user.id);

    const isAdmin = requester.roles.some((r) => r.name === 'admin');
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut voir tous les utilisateurs.');
    }

    return this.userProfileService.getAllNonAdminUsers();
  }

  // 🔧 Mettre à jour les rôles d'un utilisateur (admin uniquement)
  @Put(':id/roles')
  async updateUserRoles(
      @Req() req,
      @Param('id', ParseIntPipe) userId: number,
      @Body() body: UpdateUserProfileDto,
  ) {
    const requester = await this.userProfileService.getUserProfile(req.user.id);

    const isAdmin = requester.roles.some((r) => r.name === 'admin');
    if (!isAdmin) {
      throw new ForbiddenException('Seul un administrateur peut attribuer des rôles.');
    }

    return this.userProfileService.updateUserRoles(userId, body.roleIds, requester);
  }
}
