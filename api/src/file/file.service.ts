import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FileService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  public async uploadToCloudinary(files: Express.Multer.File[]) {
    const uploadPromises = files.map(file =>
      this.cloudinaryService.uploadFile(file.path),
    );
  
    return await Promise.all(uploadPromises);
  }
}
