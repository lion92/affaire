import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Permission} from '../entity/permission.entity';
import {CreatePermissionDto} from "../dto/CreatePermissionDto";
import {UpdatePermissionDTO} from "../dto/UpdatePermissionDTO";


@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {
    }

    async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const permission = this.permissionRepository.create(createPermissionDto);
        return this.permissionRepository.save(permission);
    }

    async findAll(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async findOne(id: number): Promise<Permission> {
        const permission = await this.permissionRepository.findOne({where: {id}});
        if (!permission) throw new NotFoundException('Permission not found');
        return permission;
    }

    async update(id: number, updateDto: UpdatePermissionDTO): Promise<Permission> {
        const permission = await this.findOne(id);
        Object.assign(permission, updateDto);
        return this.permissionRepository.save(permission);
    }

    async remove(id: number): Promise<void> {
        const permission = await this.findOne(id);
        await this.permissionRepository.remove(permission);
    }

    async findOrCreate(name: string): Promise<Permission> {
        let permission = await this.permissionRepository.findOne({where: {name}});
        if (!permission) {
            permission = this.permissionRepository.create({name});
            await this.permissionRepository.save(permission);
        }
        return permission;
    }
}
