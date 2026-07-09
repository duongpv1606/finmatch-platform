import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

// Memory storage so the service can read `file.buffer` directly (streamed
// to Cloudinary, never written to local disk). Size capped here at the
// Multer layer too — rejects oversized uploads before they're fully
// buffered into memory, not just after (defense in depth alongside the
// service-level check).
const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly upload: UploadService,
    private readonly users: UsersService,
  ) {}

  // Any logged-in user can upload their own avatar.
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  async uploadAvatar(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: JwtPayload) {
    if (!file) throw new BadRequestException('Thiếu file');
    const result = await this.upload.uploadImage(file, 'avatars');
    await this.users.setAvatarUrl(user.sub, result.url);
    return result;
  }

  // Bank logos/banners are content admins curate — restricted, same as
  // product CRUD.
  @Post(':folder')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BANK)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  @ApiConsumes('multipart/form-data')
  uploadAsset(
    @Param('folder') folder: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Thiếu file');
    if (folder !== 'logos' && folder !== 'banners') {
      throw new BadRequestException('folder phải là "logos" hoặc "banners"');
    }
    return this.upload.uploadImage(file, folder);
  }
}
