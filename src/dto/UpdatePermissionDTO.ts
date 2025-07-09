import {PartialType} from '@nestjs/mapped-types';
import {AddPermissionDto} from "./AddPermissionDto";

export class UpdatePermissionDTO extends PartialType(AddPermissionDto) {}
