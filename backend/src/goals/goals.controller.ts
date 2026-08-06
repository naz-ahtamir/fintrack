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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AddContributionDto } from './dto/add-contribution.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@CurrentUser('id') userId: number, @Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(userId, createGoalDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: number) {
    return this.goalsService.findAll(userId);
  }

  @Get('statistics')
  getStatistics(@CurrentUser('id') userId: number) {
    return this.goalsService.getStatistics(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.findOne(id, userId);
  }

  @Get(':id/progress')
  getProgress(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.getProgress(id, userId);
  }

  @Post(':id/contribute')
  addContribution(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() contributionDto: AddContributionDto
  ) {
    return this.goalsService.addContribution(id, userId, contributionDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() updateGoalDto: UpdateGoalDto
  ) {
    return this.goalsService.update(id, userId, updateGoalDto);
  }

  @Patch(':id/complete')
  markComplete(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.markComplete(id, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.goalsService.remove(id, userId);
  }
}
