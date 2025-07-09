import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {RoleService} from "./role.service";
import {CreateRoleDTO} from "../dto/createRoleDTO";
import {AddPermissionDto} from "../dto/AddPermissionDto";
import {JwtAuthGuard} from "../JwtAuthGuard";

@Controller('roles')
export default class RoleController {
  constructor(private readonly rolesService: RoleService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  createRole(@Body() dto: CreateRoleDTO) {
    return this.rolesService.createRole(dto.name, dto.permissions);
  }
  @UseGuards(JwtAuthGuard)
  @Post('add-permission')
  addPermission(@Body() dto: AddPermissionDto) {
    return this.rolesService.addPermissionToRole(dto.roleId, dto.permission);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllRoles() {
    return this.rolesService.findAllRoles();
  }
}
