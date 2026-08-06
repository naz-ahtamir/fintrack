import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <- Path relatif yang benar

@Module({
  imports: [PrismaModule], // <- Wajib!
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}