import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  private ensureConfigured() {
    if (this.configured) return;
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET) — ' +
          'tạo tài khoản miễn phí tại https://cloudinary.com/users/register/free để lấy thông tin.',
      );
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    this.configured = true;
  }

  async uploadImage(
    file: { buffer: Buffer; mimetype: string; size: number },
    folder: 'logos' | 'avatars' | 'banners',
  ): Promise<{ url: string }> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Định dạng không hỗ trợ (${file.mimetype}) — chỉ nhận JPEG, PNG, WEBP, SVG`,
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File quá lớn — tối đa 5MB');
    }

    this.ensureConfigured();

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `finmatch/${folder}`, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(new InternalServerErrorException(`Upload thất bại: ${error?.message}`));
            return;
          }
          resolve({ url: result.secure_url });
        },
      );
      stream.end(file.buffer);
    });
  }
}
