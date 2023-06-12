import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  productImageUpload(image: Express.Multer.File) {
    return image;
  }
}
