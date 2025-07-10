import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entity/user.entity';
import { Role } from '../entity/role.entity';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) {}

    // 🧠 Profil du user connecté
    async getUserProfile(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles', 'roles.permissions'],
        });

        if (!user) throw new NotFoundException('Utilisateur introuvable');

        return user;
    }

    // 🔒 MAJ des rôles - réservé aux admins
    async updateUserRoles(userId: number, roleIds: number[], requester: User): Promise<User> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        const isTargetAdmin = user.roles.some((r) => r.name === 'admin');
        const isSameUser = user.id === requester.id;

        if (isTargetAdmin && !isSameUser) {
            throw new ForbiddenException("Impossible de modifier un autre administrateur.");
        }

        const roles = await this.roleRepo.find({
            where: roleIds.map((id) => ({ id })),
            relations: ['permissions'],
        });

        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Un ou plusieurs rôles sont introuvables');
        }

        user.roles = roles;
        return this.userRepo.save(user);
    }

    async getAllNonAdminUsers(): Promise<User[]> {
        const users = await this.userRepo.find({
            relations: ['roles', 'roles.permissions'],
        });

        return users.filter((user) => {
            if (!user.roles || user.roles.length === 0) {
                // Inclure les utilisateurs sans rôle
                return true;
            }
            // Exclure uniquement ceux ayant le rôle "admin"
            return !user.roles.some((role) => role.name === 'admin');
        });
    }



}
