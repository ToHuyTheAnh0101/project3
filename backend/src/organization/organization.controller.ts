import { Resource } from '../resource/resource.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './organization.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryStorage } from 'src/config/cloudinary.storage';

@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    @InjectModel(Resource.name) private resourceModel: Model<Resource>,
  ) {}

  @Get('info/:id')
  async getOrganization(@Param('id') id: string) {
    return this.organizationService.getOverview(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', { storage: cloudinaryStorage }))
  @Post()
  async create(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    const authUser = req.user;
    const avatarUrl = file ? file.path : null;
    return this.organizationService.create(
      { ...createOrganizationDto, avatarUrl },
      authUser,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('staff', 'finance', 'admin')
  @Get()
  findAll(@Req() req) {
    const authUser = req.user;
    return this.organizationService.getOrganizations(authUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
