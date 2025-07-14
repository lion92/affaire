import {Body, Controller, Delete, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {PermissionService} from './permission.service';
import {UpdatePermissionDTO} from "../dto/UpdatePermissionDTO";
import {CreatePermissionDto} from "../dto/CreatePermissionDto";
import {JwtAuthGuard} from "../JwtAuthGuard";
import {AuthGuard} from "@nestjs/passport";

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPermissionDto:  CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDTO) {
    return this.permissionService.update(+id, updatePermissionDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
