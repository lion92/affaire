import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PermissionService} from './permission.service';
import {Permission} from "../entity/permission.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionService],
  exports: [PermissionService, TypeOrmModule], // pour que RoleModule puisse y accéder
})
export class PermissionModule {}
