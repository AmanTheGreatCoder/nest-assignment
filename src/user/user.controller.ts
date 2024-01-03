import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Query('id') id: number) {
    return this.userService.findUserById(id);
  }

  @Patch('update-profile')
  async updateProfile(@Query('id') id: number, @Body() data: Partial<User>) {
    const updateData: Partial<User> = data;

    return this.userService.updateUser(id, updateData);
  }
}
