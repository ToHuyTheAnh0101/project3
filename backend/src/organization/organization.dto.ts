import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsNumber()
  currentBudget?: number;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
