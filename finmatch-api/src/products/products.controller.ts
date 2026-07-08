import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { ProductCategory } from './product.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'category', required: false, enum: ProductCategory })
  findAll(@Query('category') category?: ProductCategory) {
    return this.service.findAll(category);
  }

  // Dedicated search endpoint — real DB-side search/filter/sort/pagination
  // for the Compare page, separate from the simple findAll() above so
  // other callers (rate chart, recommendation engine, AI grounding, admin
  // list) keep their existing "just give me everything" behavior.
  @Get('search')
  search(@Query() query: SearchProductsDto) {
    return this.service.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/rate-history')
  @ApiQuery({ name: 'months', required: false, type: Number })
  rateHistory(@Param('id') id: string, @Query('months') months?: string) {
    return this.service.rateHistory(id, months ? Number(months) : 12);
  }

  // Write endpoints are restricted to CMS operators — this is how the
  // admin dashboard (or a crawler service account) updates rates without
  // hardcoding data on the frontend.
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BANK)
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BANK)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
