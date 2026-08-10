import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user', 
    description: 'Creates a new user account with email, password, and name. Password must meet security requirements.' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully. Returns JWT access token and user information.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data or email already exists' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many registration attempts. Maximum 3 attempts per minute allowed.' 
  })
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registration attempts per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'Login user', 
    description: 'Authenticates a user with email and password. Returns JWT access token on success.' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged in successfully. Returns JWT access token and user information.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials - incorrect email or password' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many login attempts. Maximum 5 attempts per minute allowed.' 
  })
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}