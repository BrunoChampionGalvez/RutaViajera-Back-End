import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateHotelDto } from './hotels.dtos';
import { Hotel } from './hotels.entity';
import { UpdateHotelDto } from './hotels.updateDto';
import { HotelsService } from './hotels.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/auth/guards/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiConsumes } from '@nestjs/swagger';
import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelDbService: HotelsService) {}

  @ApiOperation({ summary: 'List all hotels' })
  @ApiResponse({ status: 200, description: 'List of hotels :)' })
  @ApiResponse({ status: 404, description: 'There are not hotels :(' })
  @Get()
  getDbHotels() {
    return this.hotelDbService.getDbHotels();
  }

  @ApiOperation({ summary: 'Create a new Hotel' })
  @ApiBody({
    type: CreateHotelDto,
    examples: {
      example: {
        summary: 'Example of registering a new Hotel',
        value: {
          name: 'Hotel Aurora',
          email: 'hotelaurora@mail.com',
          country: 'España',
          city: 'Santiago de Compostela',
          location: [42.8751694, -8.5474774],
          totalRooms: 10,
          address: 'Rua Doutor Teixeiro, 15, 15701',
          description:
            'Disfruta de la magia de Santiago de Compostela en el Hotel Aurora, donde la historia y la modernidad se unen en un ambiente acogedor. Nuestro hotel es el lugar perfecto para explorar la ciudad y descubrir sus secretos.',
          services: ['Restaurante', 'Bar', 'Gimnasio', 'Spa', 'Wi-Fi gratuito'],
          hotel_admin_id: 'd15b72e9-5316-4e7f-977c-2c7898a951f0',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Hotel created successfully :)' })
  @ApiResponse({ status: 400, description: 'The format used is incorrect :(' })
  @ApiResponse({ status: 404, description: 'Hotel not created :(' })
  @ApiBearerAuth()
  @Post()
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  createDbHotel(@Body() hotelDto: CreateHotelDto) {
    return this.hotelDbService.createDbHotel(hotelDto);
  }

  @ApiOperation({
    summary: 'Lista de hoteles del hotel admin cuyo id es enviado.',
  })
  @ApiBearerAuth()
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  @Get('hotelAdmin/:id')
  async getHotelsByHotelAdminId(
    @Param('id', ParseUUIDPipe) hotelAdminId: string,
  ) {
    return await this.hotelDbService.getHotelsByHotelAdminId(hotelAdminId);
  }


    
  @ApiOperation({summary: 'List all Hotels matches for the requested word'})
  @ApiQuery({ name: 'search', required: true, description: 'buscar...', example: 'Peru' })
  @ApiResponse({ status: 206, description: 'List of Hotels matches :)'})
  @ApiResponse({ status: 404, description: 'There are not hotels :('})
  @Get('search')
  async searchHotels(@Query('search') query?: string): Promise<Hotel[]> {
    console.log('Received search term:', query);
    return await this.hotelDbService.searchHotels(query);
  }

  @ApiOperation({summary: 'List all Hotels matches for the requested word'})
  @ApiQuery({ name: 'hotelAdminId', required: true, description: 'Id del hotel admin' })
  @ApiQuery({ name: 'search', required: true, description: 'buscar...', example: 'Peru' })
  @ApiResponse({ status: 206, description: 'List of Hotels matches :)'})
  @ApiResponse({ status: 404, description: 'There are not hotels :('})
  @Get('search/hotelAdmin')
  async searchHotelsByHotelAdminId(@Query('hotelAdminId') hotelAdminId: string, @Query('search') query?: string): Promise<Hotel[]> {
    console.log('Received search term:', query);
    return await this.hotelDbService.searchHotelsByHotelAdminId(hotelAdminId, query);
  }

  @ApiOperation({ summary: 'List all Hotels deleted' })
  @ApiResponse({ status: 200, description: 'List of hotels deleted :)' })
  @ApiResponse({ status: 404, description: 'There are not hotels deleted :(' })
  @ApiBearerAuth()
  @Get('deleted')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  getDbHotelsDeleted() {
    return this.hotelDbService.getDbHotelsDeleted();
  }

  @ApiOperation({ summary: 'Seeder for a list of Hotels' })
  @ApiResponse({ status: 200, description: 'List of Hotels load... :)' })
  @ApiResponse({ status: 404, description: 'Fail to hotel seeder :(' })
  //@ApiBearerAuth()
  //@Roles(Role.Admin)
  //@UseGuards(AuthGuard, RolesGuard)
  @Get('seeder')
  addHotels() {
    return this.hotelDbService.addHotels();
  }

  @Get('filters')
  async getFilteredHotels(
    @Query('rating') rating: string, // deprecated single rating (minimum)
    @Query('ratingMin') ratingMin: string,
    @Query('ratingMax') ratingMax: string,
    @Query('country') country: string,
    @Query('city') city: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
  ) {
    // Backwards compatibility: if ratingMin/Max not provided but rating is, treat rating as min
    const rMin = ratingMin || rating;
    const rMax = ratingMax || '5';
    const minP = minPrice || '0';
    const maxP = maxPrice || '500';
    const rMinNum = Number(rMin);
    const rMaxNum = Number(rMax);
    const minPriceNum = Number(minP);
    const maxPriceNum = Number(maxP);
    if (maxPriceNum < 0 || maxPriceNum > 500 || minPriceNum < 0 || minPriceNum > 500 || minPriceNum > maxPriceNum)
      throw new BadRequestException('Los precios deben estar entre 0 y 500 y minPrice <= maxPrice');
    if (rMinNum < 1 || rMinNum > 5 || rMaxNum < 1 || rMaxNum > 5 || rMinNum > rMaxNum)
      throw new BadRequestException('Las calificaciones deben estar entre 1 y 5 y ratingMin <= ratingMax');
    return await this.hotelDbService.getFilteredHotelsRange(
      rMinNum,
      rMaxNum,
      country,
      city,
      minPriceNum,
      maxPriceNum,
    );
  }

  @ApiOperation({ summary: 'List only one hotel by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID Hotel',
    example: '1121qwewasd-qw54wqeqwe-45121',
  })
  @ApiResponse({ status: 200, description: 'Hotel found successfuly :)' })
  @ApiResponse({ status: 404, description: 'Hotel not found :(' })
  @Get(':id')
  getDbHotelById(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelDbService.getDbHotelById(id);
  }

  @ApiOperation({ summary: 'Restore a Hotel' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID Hotel',
    example: '1121qwewasd-qw54wqeqwe-45121',
  })
  @ApiResponse({ status: 200, description: 'Hotel updated successfully :)' })
  @ApiResponse({ status: 400, description: 'The format used is incorrect :(' })
  @ApiResponse({ status: 404, description: 'Hotel not was updated :(' })
  @ApiBearerAuth()
  @Put('restore/:id')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  restoreHotel(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelDbService.restoreHotel(id);
  }

  @ApiOperation({ summary: 'Edit data of Hotel' })
  @ApiBody({
    type: CreateHotelDto,
    examples: {
      example: {
        summary: 'Example of editing a Hotel',
        value: {
          name: 'Hotel Sun Paradise',
          email: 'hotelsunparadise@mail.com',
          country: 'México',
          city: 'Cancún',
          location: [21.1378937, -86.7541472],
          totalRooms: 20,
          images: [
            'https://content.r9cdn.net/rimg/himg/ca/92/12/ice-55339-73817713_3XL-651930.jpg',
          ],
          address: 'Blvd. Kukulcan 9, Punta Cancun',
          description:
            'Disfruta del sol y la playa en el Hotel Sun Paradise, donde la relajación y la diversión se unen en un ambiente tropical. Nuestro hotel es el lugar perfecto para escapar de la rutina y disfrutar de la belleza de Cancún.',
          services: [
            'Restaurante',
            'Bar',
            'Piscina',
            'Spa',
            'Wi-Fi gratuito',
            'Servicio de habitaciones',
          ],
          hoteladminId: 'df40fc42-257e-4e2f-8c68-057092e15839',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Hotel udpated successfully :)' })
  @ApiResponse({ status: 400, description: 'The format used is incorrect :(' })
  @ApiResponse({ status: 404, description: 'Hotel not was updated :(' })
  @ApiBearerAuth()
  @Put(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  updateDbHotel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHotelDto: Partial<UpdateHotelDto>,
  ) {
    if (!Object.keys(updateHotelDto).length) {
      throw new BadRequestException('The body cannot be empty');
    }
    return this.hotelDbService.updateDbHotel(id, updateHotelDto);
  }

  @ApiOperation({ summary: 'Delete a Hotel' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID Hotel',
    example: '1121qwewasd-qw54wqeqwe-45121',
  })
  @ApiResponse({ status: 200, description: 'Hotel deleted successfully :)' })
  @ApiResponse({ status: 404, description: 'Hotel not was eliminated  :(' })
  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  deleteDbHotel(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelDbService.deleteDbHotel(id);
  }

  // --- Image upload (disk) for hotels ---
  @ApiOperation({ summary: 'Subir imágenes para hoteles (guarda en disco)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @Post('images')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', 'hotels');
        if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname) || '.jpg';
        cb(null, unique + ext);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
      else cb(null, false);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  }))
  uploadHotelImages(@UploadedFiles() files: Express.Multer.File[]) {
    const basePath = '/uploads/hotels';
    const list = (files || []).map(f => `${basePath}/${f.filename}`);
    return { files: list };
  }
}

// @Get('search')
// async searchHotels(
//     @Query('name') name?: string,
//     @Query('country') country?: string,
//     @Query('city') city?: string,
//     @Query('service') service?: string,
//     @Query('room') room?: string
// ) {
//     const hotels = await this.hotelDbService.searchHotels(name, country, city, service, room);
//     return hotels;
// }
