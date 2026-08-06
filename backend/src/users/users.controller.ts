import { Controller, Get, Param, UseGuards, Req, Put, Body, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll(); 
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.findOne(userId);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.getUserStatistics(userId);
  }

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.getUserSettings(userId);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @Req() req: Request,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const userId = (req.user as any).id;
    return this.usersService.updateUserSettings(userId, updateSettingsDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = (req.user as any).id;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}