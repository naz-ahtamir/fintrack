import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AddContributionDto } from './dto/add-contribution.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('api/goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal', description: 'Creates a new financial goal for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  create(@CurrentUser('id') userId: number, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(userId, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals', description: 'Retrieves all financial goals for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of goals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  findAll(@CurrentUser('id') userId: number) {
    return this.goalsService.findAll(userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get goals statistics', description: 'Retrieves statistical information about user goals (total, completed, progress, etc.)' })
  @ApiResponse({ status: 200, description: 'Goal statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  getStatistics(@CurrentUser('id') userId: number) {
    return this.goalsService.getStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID', description: 'Retrieves a specific goal by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.findOne(id, userId);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get goal progress', description: 'Retrieves detailed progress information for a specific goal' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Goal progress retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  getProgress(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.getProgress(id, userId);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add contribution to goal', description: 'Adds a financial contribution to a specific goal' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Contribution added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  addContribution(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() contributionDto: AddContributionDto
  ) {
    return this.goalsService.addContribution(id, userId, contributionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal', description: 'Updates an existing goal for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateGoalDto: UpdateGoalDto
  ) {
    return this.goalsService.update(id, userId, updateGoalDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark goal as complete', description: 'Marks a goal as completed' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Goal marked as complete successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  markComplete(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.markComplete(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal', description: 'Deletes a goal for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Goal ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.remove(id, userId);
  }
}
