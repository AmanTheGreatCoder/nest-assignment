import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class VerifyOTPDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: 'Invalid email',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otp: string;
}
