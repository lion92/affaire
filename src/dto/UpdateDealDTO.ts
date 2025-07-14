// src/deals/dto/update-deal.dto.ts
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateDealDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsString()
    dealUrl?: string;

    @IsOptional()
    @IsNumber()
    categoryId?: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}
