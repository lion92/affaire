import {PermissionDTO} from "./permissionDTO";


export class RoleDto {
    id: number;
    name: string;
    permissions: PermissionDTO[];
}