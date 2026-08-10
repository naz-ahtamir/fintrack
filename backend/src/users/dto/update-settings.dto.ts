import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationFrequency {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  NEVER = 'NEVER',
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'User interface language',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Preferred currency code',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'America/New_York',
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    example: 'dark',
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiPropertyOptional({
    description: 'Enable email notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Enable push notifications',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Enable transaction alerts',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  transactionAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Enable budget alerts',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  budgetAlerts?: boolean;

  @ApiPropertyOptional({
    description: 'Enable goal updates',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  goalUpdates?: boolean;

  @ApiPropertyOptional({
    description: 'Enable monthly reports',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  monthlyReports?: boolean;

  @ApiPropertyOptional({
    enum: NotificationFrequency,
    description: 'Notification frequency preference',
    example: NotificationFrequency.DAILY,
  })
  @IsEnum(NotificationFrequency)
  @IsOptional()
  notificationFrequency?: NotificationFrequency;
}
