import { IsArray, IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateUserProfileDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    nom?: string;

    @IsOptional()
    @IsString()
    prenom?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    roleIds?: number[]; // tableau d'IDs de rôles à assigner
}
