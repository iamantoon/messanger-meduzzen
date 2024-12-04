import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  recipientUsername: string;

  @IsString()
  @MaxLength(500, { message: 'Message content must not exceed 500 characters.' })
  content: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  fileUrls?: string[];
}