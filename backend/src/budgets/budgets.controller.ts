import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '@/auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('api/budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget', description: 'Creates a new budget for a specific category and time period' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  create(@CurrentUser('id') userId: number, @Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(userId, createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets', description: 'Retrieves all budgets for the authenticated user, optionally filtered by month and year' })
  @ApiQuery({ name: 'month', required: false, description: 'Filter by month (1-12)', example: 6 })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year', example: 2026 })
  @ApiResponse({ status: 200, description: 'List of budgets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  findAll(
    @CurrentUser('id') userId: number,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const monthNum = month ? parseInt(month) : undefined;
    const yearNum = year ? parseInt(year) : undefined;
    return this.budgetsService.findAll(userId, monthNum, yearNum);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary', description: 'Retrieves a summary of budgets with spending information for a specific period' })
  @ApiQuery({ name: 'month', required: false, description: 'Filter by month (1-12)', example: 6 })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year', example: 2026 })
  @ApiResponse({ status: 200, description: 'Budget summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  getSummary(
    @CurrentUser('id') userId: number,
    @Query('month') month?: string,
    @Query('year') year?: string
  ) {
    const monthNum = month ? parseInt(month) : undefined;
    const yearNum = year ? parseInt(year) : undefined;
    return this.budgetsService.getBudgetSummary(userId, monthNum, yearNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID', description: 'Retrieves a specific budget by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Budget ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Budget retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.budgetsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget', description: 'Updates an existing budget for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Budget ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateBudgetDto: UpdateBudgetDto
  ) {
    return this.budgetsService.update(id, userId, updateBudgetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget', description: 'Deletes a budget for the authenticated user' })
  @ApiParam({ name: 'id', description: 'Budget ID', type: 'integer', example: 1 })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Budget not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.budgetsService.remove(id, userId);
  }
}
