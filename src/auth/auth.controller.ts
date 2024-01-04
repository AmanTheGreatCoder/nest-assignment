import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { VerifyOTPDto } from './dtos/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('refresh-token')
  async refreshToken(
    @Body() data: { refreshToken: string },
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = data;

    const userId = await this.authService.verifyRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const accessToken = this.authService.generateAccessToken(userId);
    return { accessToken };
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

    const otp = await this.authService.sendOTP(email);
    const saltOrRounds = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    await this.prisma.getPrisma().user.create({
      data: { email, password: hashedPassword, otp },
    });

    return { message: 'OTP sent to email for verification', otp };
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
  async login(@Body() loginData: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginData;
    const user = await this.prisma.getPrisma().user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Email does not exists');
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return await this.authService.getTokens(user.id);
    } else {
      throw new UnauthorizedException('Invalid Credentials');
    }
  }
}
