import { IsArray, IsEmail, IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';

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
    @IsUrl()
    youtube_profile?: string;

    @IsOptional()
    @IsUrl()
    linkedin_profile?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    roleIds?: number[]; // tableau d'IDs de rôles à assigner
}
