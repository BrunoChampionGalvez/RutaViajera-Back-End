import {
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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RoomsTypeService } from './roomstype.service';
import { CreateRoomTypeDto } from './roomstype.dtos';
import { UpdateRoomsTypeDto } from './romstype.udpateDto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/guards/roles.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { RoomsType } from './roomstype.entity';

@ApiTags('Roomstype')
@Controller('roomstype')
export class RoomsTypeController {
  constructor(private readonly roomstypeDbService: RoomsTypeService) {}

  @ApiOperation({summary: 'List all typerooms'})
  @ApiResponse({ status: 200, description: 'List of typerooms :)'})
  @ApiResponse({ status: 404, description: 'There are not typerooms :('})
  @Get()
  getDbRoomsType() {
    return this.roomstypeDbService.getDbRoomsType();
  }

  @ApiOperation({ summary: 'Lista de room types de un hotel.' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true, description: 'Hotel ID', example: '1121qwewasd-qw54wqeqwe-45121' })
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(200)
  @Get('/hotel/:id')
  async getRoomTypesByHotelId(@Param('id', ParseUUIDPipe) hotelId: string) {
    return await this.roomstypeDbService.getRoomTypesByHotelId(hotelId)
  }

  @ApiOperation({summary: 'Create a new Roomtype'})
    @ApiBody({type: CreateRoomTypeDto,
        examples: {
            example:{
                summary:"Example of registering a new roomtype",
                value:{
                    "name": 'familiar',
                    "capacity": 10,
                    "totalBathrooms": 3,
                    "totalBeds": 5,
                    "price": 150,
                    "hotelId": "4b71e7e7-1dda-468f-a432-d2200e2e6d6d"  
                }
            }
        }
    })
  @ApiResponse({ status: 200, description: 'Roomtype created successfully :)'})
  @ApiResponse({ status: 400, description: 'The format used is incorrect :('})
  @ApiResponse({ status: 404, description: 'Roomtype not created :('})
  @ApiBearerAuth()
  @Post()
  @Roles(Role.Admin,Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  createDbRoomtype(@Body() roomtypeDto: CreateRoomTypeDto) {
    return this.roomstypeDbService.createDbRoomtype(roomtypeDto);
  }

  @ApiOperation({summary: 'List all typerooms deleted'})
  @ApiResponse({ status: 200, description: 'List of typerooms deleted :)'})
  @ApiResponse({ status: 404, description: 'There are not typerooms deleted :('})
  @ApiBearerAuth()
  @Get('deleted')
  @Roles(Role.Admin,Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  getDbRoomstypeDeleted() {
    return this.roomstypeDbService.getDbRoomstypeDeleted();
  }

  @ApiOperation({ summary: 'Lista todos los room types de un hotel con base en una search query y el id del hotel.' })
  @ApiQuery({ name: 'search', required: true, description: 'buscar...', example: 'Deluxe' })
  @ApiResponse({ status: 206, description: 'List of room types matches :)' })
  @ApiResponse({ status: 404, description: 'There are no room types :(' })
  @Get('search')
  async searchRoomTypes(@Query('hotelId') hotelId: string, @Query('search') query?: string): Promise<RoomsType[]> {
    console.log('Received search term:', query);
    return await this.roomstypeDbService.searchRoomTypes(hotelId, query);
  }

  @ApiOperation({summary: 'List only one roomtype by ID'})
  @ApiParam({ name: 'id', required: true, description: 'ID Roomtype', example: '1121qwewasd-qw54wqeqwe-45121' })
  @ApiResponse({ status: 200, description: 'Roomtype found successfuly :)'})
  @ApiResponse({ status: 404, description: 'Roomtype not found :('})
  @Get(':id')
  getDbRoomTypeById(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomstypeDbService.getDbRoomTypeById(id);
  }

  @ApiOperation({summary: 'Restore a Roomtype'})
  @ApiParam({ name: 'id', required: true, description: 'ID Roomtype', example: '1121qwewasd-qw54wqeqwe-45121' })
  @ApiResponse({ status: 200, description: 'Roomtype updated successfully :)'})
  @ApiResponse({ status: 400, description: 'The format used is incorrect :('})
  @ApiResponse({ status: 404, description: 'Roomtype not was updated :('})
  @ApiBearerAuth()
  @Put('restore/:id')
  @Roles(Role.Admin,Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  restoreRoomstype(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomstypeDbService.restoreRoomstype(id);
  }


  @ApiOperation({summary: 'Edit data of Roomtype'})
  @ApiParam({ name: 'id', required: true, description: 'ID Roomtype', example: '1121qwewasd-qw54wqeqwe-45121' })
    @ApiBody({type: UpdateRoomsTypeDto,
        examples: {
            example:{
                summary:"Example of editing a roomtype",
                value:{
                    "name": 'matrimonial',
                    "capacity": 2,
                    "totalBathrooms": 1,
                    "totalBeds": 1,
                    "price": 250,
                    "hotelId": "4b71e7e7-1dda-468f-a432-d2200e2e6d6d"  
                }
            }
        }
    })
  @ApiResponse({ status: 200, description: 'Roomtype updated successfully :)'})
  @ApiResponse({ status: 400, description: 'The format used is incorrect :('})
  @ApiResponse({ status: 404, description: 'Roomtype not was updated :('})
  @ApiBearerAuth()
  @Put(':id')
  @Roles(Role.Admin,Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  updateDbRoomstype(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomstypeDto: Partial<UpdateRoomsTypeDto>,
  ) {
    return this.roomstypeDbService.updateDbRoomstype(id, updateRoomstypeDto);
  }

  @ApiOperation({summary: 'Delete a roomtype'})
  @ApiParam({ name: 'id', required: true, description: 'ID Roomtype', example: '1121qwewasd-qw54wqeqwe-45121' })
  @ApiResponse({ status: 200, description: 'Roomtype deleted successfully :)'})
  @ApiResponse({ status: 404, description: 'Roomtype not was eliminated  :('})
  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin,Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  deleteDbRoomtype(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomstypeDbService.deleteDbRoomtype(id);
  }

  // --- Image upload (disk) for room types ---
  @ApiOperation({ summary: 'Subir imágenes para room types (dev: guarda en disco)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @Post('images')
  @Roles(Role.Admin, Role.SuperAdmin)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', 'roomtypes');
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
      // Simple whitelist of common image mime types
      if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
      else cb(null, false);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
  }))
  uploadRoomTypeImages(@UploadedFiles() files: Express.Multer.File[]) {
    const basePath = '/uploads/roomtypes';
    const list = (files || []).map(f => `${basePath}/${f.filename}`);
    return { files: list };
  }
}
