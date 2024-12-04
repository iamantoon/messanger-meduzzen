import { BadRequestException, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5))
  public async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded.');
    }
  
    files.forEach(file => {
      if (!file || !file.path || file.size === 0) {
        throw new BadRequestException(`File ${file.originalname} is empty.`);
      }
    });
  
    return await this.fileService.uploadToCloudinary(files);
  }
}
