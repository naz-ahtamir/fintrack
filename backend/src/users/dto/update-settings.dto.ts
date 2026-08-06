import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export enum NotificationFrequency {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  NEVER = 'NEVER',
}

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  transactionAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  budgetAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  goalUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  monthlyReports?: boolean;

  @IsEnum(NotificationFrequency)
  @IsOptional()
  notificationFrequency?: NotificationFrequency;
}
