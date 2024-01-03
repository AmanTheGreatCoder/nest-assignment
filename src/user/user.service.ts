import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async updateUser(id: number, updateData: any) {
    const updatedUser = await this.prismaService.getPrisma().user.update({
      where: { id },
      data: updateData,
    });

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
