import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PermissionModule} from '../permission/permission.module';
import {Role} from "../entity/role.entity";
import RolesController from "./role.controller";
import {RoleService} from "./role.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PermissionModule, // pour accéder aux permissions
  ],
  controllers: [RolesController],
  providers: [RoleService],
})
export class RoleModule {}
