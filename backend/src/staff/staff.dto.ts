import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';

export class CreateStaffDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['admin', 'staff', 'attendee'])
  role?: string;

  @IsString()
  authId: Types.ObjectId;

  @IsOptional()
  organizationId: Types.ObjectId;

  @IsOptional()
  @IsEnum(['active', 'kicked'])
  status?: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
