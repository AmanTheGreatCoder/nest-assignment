import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Query('id', new ParseIntPipe()) id: number) {
    if (id <= 0) {
      throw new BadRequestException('ID must be a positive integer');
    }
    return await this.userService.findUserById(id);
  }

  @Patch('update-profile')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async updateProfile(
    @Query('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateProfileDto,
  ) {
    const user = await this.userService.updateUser(id, data);
    if (user) {
      return { message: 'Profile updated successfully.' };
    }
  }
}
