// src/role/role.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { PermissionModule } from '../permission/permission.module';
import {Permission} from "../entity/permission.entity";
import {Role} from "../entity/role.entity";
import RoleController from "./role.controller"; // 👈 import

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]), // 👈 injecte aussi Permission ici
    PermissionModule, // 👈 très important
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
