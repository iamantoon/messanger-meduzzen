import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    CloudinaryModule,
    MulterModule.register({
      dest: './uploads'
    })
  ]
})
export class FileModule {}
