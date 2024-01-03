import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserService } from 'src/user/user.service';
import { VerifyOTPDto } from './dtos/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('refresh-token')
  async refreshToken(@Body() data: { refreshToken: string }) {
    const { refreshToken } = data;

    const userId = await this.authService.verifyRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    return this.authService.generateAccessToken(userId);
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    const { email, password } = registrationData;
    const existingUser = await this.prisma.getPrisma().user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already Exists');
    }
    const otp = await this.authService.generateAndSendOTP(email);

    const saltOrRounds = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    await this.prisma.getPrisma().user.create({
      data: { email, otp, password: hashedPassword },
    });

    return { message: 'OTP sent to email for verification' };
  }

  @Post('verify-otp')
  async verifyOTP(@Body() data: VerifyOTPDto) {
    const { email, otp } = data;
    const isOTPVerified = await this.userService.verifyOTP(email, otp);

    if (isOTPVerified) {
      await this.prisma.getPrisma().user.update({
        where: {
          email,
        },
        data: { isVerified: true },
      });
      return {
        message: 'Email verified successfully.',
      };
    } else {
      throw new BadRequestException('Invalid OTP');
    }
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    const user = await this.prisma.getPrisma().user.findUnique({
      where: { email: loginData.email },
    });

    if (!user || user.password !== loginData.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.getTokens(
      user.id,
    );

    return { accessToken, refreshToken };
  }
}
