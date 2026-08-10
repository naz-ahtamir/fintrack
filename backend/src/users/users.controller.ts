import { Controller, Get, Param, UseGuards, Req, Put, Body, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin/Moderator only)', description: 'Retrieves all users - requires ADMIN or MODERATOR role' })
  @ApiResponse({ status: 200, description: 'List of users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or MODERATOR role' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  findAll() {
    return this.usersService.findAll(); 
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieves the authenticated user profile information' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.findOne(userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics', description: 'Retrieves statistical information about the user (accounts, transactions, budgets, etc.)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.getUserStatistics(userId);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get user settings', description: 'Retrieves the authenticated user settings and preferences' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @UseGuards(JwtAuthGuard)
  async getSettings(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.getUserSettings(userId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update user settings', description: 'Updates the authenticated user settings and preferences' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @Req() req: Request,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    const userId = (req.user as any).id;
    return this.usersService.updateUserSettings(userId, updateSettingsDto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password', description: 'Changes the authenticated user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or new password does not meet requirements' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = (req.user as any).id;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin/Moderator only)', description: 'Retrieves a specific user by ID - requires ADMIN or MODERATOR role' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires ADMIN or MODERATOR role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}