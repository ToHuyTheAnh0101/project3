import {
  IsString,
  IsOptional,
  IsDate,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  eventId: Types.ObjectId;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsDate()
  endTime?: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  staffIds?: any[];

  @IsOptional()
  resources?: { resourceId: Types.ObjectId; quantity: number }[];

  @IsOptional()
  @IsEnum(['planning', 'doing', 'done', 'cancelled'])
  status?: string;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}
