import {RoleDto} from "./roleDTO";

export class UserProfileDto {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    roles: RoleDto[];
}
