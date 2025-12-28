import {
  Controller,
  Post,
  Body,
  Patch,
  Req,
  UseGuards,
  Get,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryStorage } from '../config/cloudinary.storage';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.authService.findById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar', { storage: cloudinaryStorage }))
  async updateMe(
    @Req() req,
    @Body() body,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.updateMe(req.user.id, body, file);
  }

  @Get('suggest')
  async suggestUsers(
    @Query('keyword') keyword: string,
    @Query('organizationId') organizationId: string,
    @Query('limit') limit = '5',
  ) {
    return this.authService.suggestUsers(
      keyword,
      organizationId,
      parseInt(limit, 10),
    );
  }
}
