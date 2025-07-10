import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {Role} from "../entity/role.entity";
import {Permission} from "../entity/permission.entity";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepo: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
    ) {
    }

    async createRole(name: string, permissionNames: string[]) {
        const permissions = await Promise.all(
            permissionNames.map(async (name) => {
                let perm = await this.permissionRepo.findOne({where: {name}});
                if (!perm) {
                    perm = this.permissionRepo.create({name});
                    await this.permissionRepo.save(perm);
                }
                return perm;
            }),
        );

        const role = this.roleRepo.create({name, permissions});
        return this.roleRepo.save(role);
    }


    async addPermissionToRole(roleId: number, permissionName: string) {
        const role = await this.roleRepo.findOne({
            where: {id: roleId},
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException('Rôle non trouvé');
        }

        let permission = await this.permissionRepo.findOne({where: {name: permissionName}});

        if (!permission) {
            permission = this.permissionRepo.create({name: permissionName});
            await this.permissionRepo.save(permission);
        }

        const alreadyAssigned = role.permissions.some(p => p.name === permissionName);
        if (alreadyAssigned) {
            throw new BadRequestException('La permission est déjà assignée à ce rôle.');
        }

        role.permissions.push(permission);
        return this.roleRepo.save(role);
    }

    async findAllRoles() {
        return this.roleRepo.find({relations: ['permissions']});
    }

    async updatePermissions(roleId: number, permissionIds: number[]) {
        const role = await this.roleRepo.findOne({
            where: {id: roleId},
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException('Rôle non trouvé');
        }

        const permissions = await this.permissionRepo.find({
            where: {id: In(permissionIds)},
        });


        role.permissions = permissions;

        return this.roleRepo.save(role);
    }


}
