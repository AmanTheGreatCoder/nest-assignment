import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById(id: number) {
    const user = await this.prismaService.getPrisma().user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateData: UpdateProfileDto) {
    const updatedUser = await this.prismaService.getPrisma().user.update({
      where: { id },
      data: updateData,
    });

    console.log('updatedd user', updatedUser);
    return updatedUser;
  }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.prismaService.getPrisma().user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      return user.otp === otp;
    }

    return false;
  }
}
