import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                // Exclude password
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async getUserStatistics(userId: number) {
        // Get total transactions count
        const totalTransactions = await this.prisma.transaction.count({
            where: { userId },
        });

        // Get active accounts count (only active accounts)
        const activeAccounts = await this.prisma.account.count({
            where: {
                userId,
                isActive: true,
            },
        });

        // Get days active (days since account creation)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const createdAt = new Date(user.createdAt);
        const now = new Date();
        const daysActive = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            totalTransactions,
            activeAccounts,
            daysActive,
        };
    }

    async getUserSettings(userId: number) {
        // Get or create user settings
        let settings = await this.prisma.userSetting.findUnique({
            where: { userId },
        });

        // If no settings exist, create default settings
        if (!settings) {
            settings = await this.prisma.userSetting.create({
                data: {
                    userId,
                    currency: 'IDR',
                    language: 'id',
                    timeZone: 'Asia/Jakarta',
                    theme: 'dark',
                },
            });
        }

        return settings;
    }

    async updateUserSettings(userId: number, updateSettingsDto: UpdateSettingsDto) {
        // Check if settings exist
        const existingSettings = await this.prisma.userSetting.findUnique({
            where: { userId },
        });

        if (existingSettings) {
            // Update existing settings
            return this.prisma.userSetting.update({
                where: { userId },
                data: {
                    ...updateSettingsDto,
                },
            });
        } else {
            // Create new settings
            return this.prisma.userSetting.create({
                data: {
                    userId,
                    ...updateSettingsDto,
                },
            });
        }
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
        // Get user with password
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            changePasswordDto.currentPassword,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        // Update password
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: 'Password changed successfully' };
    }
}
