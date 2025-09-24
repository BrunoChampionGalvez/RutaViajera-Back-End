import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from './hotels.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateHotelDto } from './hotels.dtos';
import { HotelAdmins } from 'src/hotel-admins/hotelAdmins.entity';
import { UpdateHotelDto } from './hotels.updateDto';
//import { NaturalLanguageProcessor } from "src/helper/natural-language-processor";
//import { removeAccents } from "src/utils/removeAcceents";
import * as data from '../utils/dataHotels.json';

@Injectable()
export class HotelsRepository {
  constructor(
    //private readonly naturalLanguageProcessor: NaturalLanguageProcessor,
    @InjectRepository(Hotel)
    private readonly hotelDbRepository: Repository<Hotel>,
    @InjectRepository(HotelAdmins)
    private readonly hotelAdminRepository: Repository<HotelAdmins>,
  ) {}

  async getDbHotels(): Promise<Hotel[]> {
    let hotelsList: Hotel[] = await this.hotelDbRepository.find({
      relations: { reviews: { customer: true } },
    }); ///customer :true
    if (hotelsList.length !== 0) {
      hotelsList = hotelsList.filter((eleDel) => eleDel.isDeleted === false);
      return hotelsList;
    } else throw new NotFoundException('there are not hotels');
  }

  async getHotelsByHotelAdminId(hotelAdminId: string): Promise<Hotel[]> {
    const hotels = await this.hotelDbRepository.find({
      where: { hotelAdmin: { id: hotelAdminId } },
    });
    if (hotels.length === 0)
      throw new NotFoundException(
        'No se encontraron hoteles para ese hotel admin.',
      );
    return hotels;
  }

  async getDbHotelById(id: string): Promise<Hotel> {
    const hotelFound: Hotel = await this.hotelDbRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.roomstype', 'roomstype')
      .leftJoinAndSelect('roomstype.rooms', 'room')
      .leftJoinAndSelect('hotel.reviews', 'reviews')
      .leftJoinAndSelect('reviews.customer', 'customer') // Join with the customer related to the review
      .where('hotel.id = :id', { id })
      .andWhere('hotel.isDeleted = false')
      .andWhere(
        new Brackets(qb => {
          qb.where('reviews.isDeleted = false')
            .orWhere('reviews.id IS NULL');
        })
      )
      .getOne();

    if (!hotelFound) {
      throw new NotFoundException('This hotel is not available');
    }

    hotelFound.roomstype = hotelFound.roomstype.filter(
      (roomType) => !roomType.isDeleted,
    );
    hotelFound.roomstype.forEach((roomType) => {
      roomType.rooms = roomType.rooms.filter((room) => !room.isDeleted);
    });

    return hotelFound;
  }

  async createDbHotel(hotelDto: CreateHotelDto): Promise<Hotel> {
    const { hotel_admin_id, name, email, ...hotelData } = hotelDto;
    // Allow reuse of name/email if the previous hotel was soft-deleted (isDeleted = true):
    // If a record exists and isDeleted=false => block creation.
    // If exists and isDeleted=true => "restore" it by updating fields instead of creating a new row (keeps relations history consistent).
    const existingByName = await this.hotelDbRepository.findOne({ where: { name } });
    if (existingByName && !existingByName.isDeleted) {
      throw new BadRequestException('this hotel exists');
    }
    const existingByEmail = await this.hotelDbRepository.findOne({ where: { email } });
    if (existingByEmail && !existingByEmail.isDeleted) {
      throw new BadRequestException('this email exists');
    }

    // If either (or both) exist but soft-deleted, pick one to restore (prefer name match; else email).
    const toRestore = existingByName?.isDeleted ? existingByName : (existingByEmail?.isDeleted ? existingByEmail : null);

    const hoteladminFound = await this.hotelAdminRepository.findOne({
      where: { id: hotel_admin_id },
    });
    if (!hoteladminFound)
      throw new NotFoundException('this Admin is not available');

    if (toRestore) {
      // Merge new data, mark as active again.
      toRestore.name = name; // in case email match path chose this record
      toRestore.email = email;
      Object.assign(toRestore, hotelData);
      toRestore.isDeleted = false;
      toRestore.hotelAdmin = hoteladminFound; // re-associate if needed
      const saved = await this.hotelDbRepository.save(toRestore);
      // IMPORTANT: Al restaurar un hotel (re-uso de name/email) queremos que aparezca vacío
      // en el editor para permitir crear room types nuevos con mismos nombres sin colisión.
      // Los room types antiguos siguen apuntando a este mismo registro (misma PK) y provocarían
      // que la lista se muestre poblada y que crear un nuevo room type con el mismo nombre falle.
      // Estrategia: marcamos TODOS los room types y sus rooms como isDeleted=true en cascada lógica.
      try {
        // Solo seleccionamos las columnas necesarias (id) para minimizar carga.
        const qb = this.hotelDbRepository.createQueryBuilder('hotel')
          .leftJoinAndSelect('hotel.roomstype', 'rt')
          .leftJoinAndSelect('rt.rooms', 'r')
          .where('hotel.id = :id', { id: saved.id });
        const full = await qb.getOne();
        if (full?.roomstype?.length) {
          for (const rt of full.roomstype) {
            if (!rt.isDeleted) {
              await this.hotelDbRepository.manager.createQueryBuilder()
                .update('roomstype')
                .set({ isDeleted: true })
                .where('id = :id', { id: rt.id })
                .execute();
            }
            if (rt.rooms?.length) {
              for (const room of rt.rooms) {
                if (!room.isDeleted) {
                  await this.hotelDbRepository.manager.createQueryBuilder()
                    .update('rooms')
                    .set({ isDeleted: true })
                    .where('id = :id', { id: room.id })
                    .execute();
                }
              }
            }
          }
        }
      } catch (cascadeErr) {
        // No romper creación si falla limpieza; solo loguear.
        console.error('[createDbHotel] Error limpiando room types al restaurar hotel', cascadeErr);
      }
      return saved;
    }
    const newHotel = this.hotelDbRepository.create({
      ...hotelData,
      name,
      email,
      hotelAdmin: hoteladminFound,
    });
    return await this.hotelDbRepository.save(newHotel);
  }

  async searchHotels(query?: string): Promise<Hotel[]> {
    if (!query) {
      return [];
    }
    console.log('buscando hotel...');
    const searchTerm = `%${query.toLowerCase()}%`;

    return await this.hotelDbRepository
      .createQueryBuilder('hotel')
      .where('hotel.isDeleted = false')
      .andWhere(
        new Brackets(qb => {
          qb.where('unaccent(LOWER(hotel.country)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.name)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.email)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.city)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere(
            'unaccent(LOWER(hotel.description)) ILIKE unaccent(:searchTerm)',
            { searchTerm },
          )
        })
      )
      .getMany();
  }

  async searchHotelsByHotelAdminId(hotelAdminId: string, query?: string): Promise<Hotel[]> {
    if (!query) {
      return [];
    }
    console.log('buscando hotel...');
    const searchTerm = `%${query.toLowerCase()}%`;

    return await this.hotelDbRepository
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.hotelAdmin', 'hotelAdmin')
      .where('hotelAdmin.id = :hotelAdminId', { hotelAdminId })
      .andWhere('hotel.isDeleted = false')
      .andWhere(
        new Brackets(qb => {
          qb.where('unaccent(LOWER(hotel.country)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.name)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.email)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere('unaccent(LOWER(hotel.city)) ILIKE unaccent(:searchTerm)', {
            searchTerm,
          })
          .orWhere(
            'unaccent(LOWER(hotel.description)) ILIKE unaccent(:searchTerm)',
            { searchTerm },
          )
        })
      )
      .getMany();
  }

  async getFilteredHotels(
    rating: number,
    country: string,
    city: string,
    minPrice: number,
    maxPrice: number,
  ) {
    const query = this.hotelDbRepository.createQueryBuilder('hotel');

    if (rating) query.andWhere('hotel.rating >= :rating', { rating });
    if (country) query.andWhere('hotel.country = :country', { country });
    if (city) query.andWhere('hotel.city = :city', { city });
    if (minPrice) query.andWhere('hotel.price >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('hotel.price <= :maxPrice', { maxPrice });
    const hotels = await query.getMany();
    if (hotels.length === 0)
      throw new NotFoundException(
        'No se encontró ningún hotel con esas características.',
      );
    return hotels;
  }

  async getFilteredHotelsRange(
    ratingMin: number,
    ratingMax: number,
    country: string,
    city: string,
    minPrice: number,
    maxPrice: number,
  ) {
    const query = this.hotelDbRepository.createQueryBuilder('hotel');
    query.where('hotel.isDeleted = false');
    // Rating is a float (average). The UI slider uses integer "stars" buckets.
    // Users expect selecting max=N to include hotels labeled with N stars (i.e., floor(rating) <= N).
    // That translates to rating < (N + 1), except when N = 5 where we allow rating <= 5.
    if (ratingMin) query.andWhere('hotel.rating >= :ratingMin', { ratingMin });
    if (ratingMax) {
      if (ratingMax < 5) {
        query.andWhere('hotel.rating < :ratingMaxExclusive', { ratingMaxExclusive: ratingMax + 1 });
      } else {
        query.andWhere('hotel.rating <= :ratingMax', { ratingMax: 5 });
      }
    }
  // Accent-insensitive equality without requiring the unaccent extension
  const accentSrc = 'ÁÉÍÓÚáéíóúÑñÜü';
  const accentDst = 'AEIOUaeiouNnUu';
  if (country) query.andWhere(`LOWER(translate(TRIM(hotel.country), '${accentSrc}', '${accentDst}')) LIKE LOWER(translate(:countryPattern, '${accentSrc}', '${accentDst}'))`, { countryPattern: `%${country.trim()}%` });
  if (city) query.andWhere(`LOWER(translate(TRIM(hotel.city), '${accentSrc}', '${accentDst}')) LIKE LOWER(translate(:cityPattern, '${accentSrc}', '${accentDst}'))`, { cityPattern: `%${city.trim()}%` });
    if (minPrice !== undefined) query.andWhere('hotel.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) query.andWhere('hotel.price <= :maxPrice', { maxPrice });
    const hotels = await query.getMany();
    if (hotels.length === 0)
      throw new NotFoundException('No se encontró ningún hotel con esas características.');
    return hotels;
  }

  async updateDbHotel(
    id: string,
    updateHotelDto: Partial<UpdateHotelDto>,
  ): Promise<string> {
    const { ...hotelData } = updateHotelDto;
    const hotel = await this.hotelDbRepository.findOneBy({ id });
    if (!hotel) throw new NotFoundException('Hotel not found');
    await this.hotelDbRepository.update(
      { id },
      {
        ...hotelData,
      },
    );
    return id;
  }

  async deleteDbHotel(id: string): Promise<string> {
    const foundHotel: Hotel = await this.hotelDbRepository.findOne({
      where: { id },
    });
    if (!foundHotel) throw new NotFoundException('Hotel not found');
    if (foundHotel.isDeleted === true)
      throw new BadRequestException('Hotel was eliminated');
    await this.hotelDbRepository.update({id}, { isDeleted: true });
    return id;
  }

  async restoreHotel(id: string): Promise<string> {
    const foundHotel: Hotel = await this.hotelDbRepository.findOne({
      where: { id },
    });
    if (!foundHotel) throw new NotFoundException('Hotel not found');
    if (foundHotel.isDeleted === false)
      throw new BadRequestException('the Hotel is active');
    await this.hotelDbRepository.update(id, { isDeleted: false });
    return id;
  }

  async getDbHotelsDeleted(): Promise<Hotel[]> {
    const listHotel: Hotel[] = await this.hotelDbRepository.find({
      where: { isDeleted: true },
    });
    if (listHotel.length !== 0) {
      return listHotel;
    } else throw new NotFoundException('there are not hotels');
  }

  async addHotels() {
    const hotelAdmins = await this.hotelAdminRepository.find();
    if (hotelAdmins.length === 0)
      throw new BadRequestException(
        'Es necesario que haya al menos 1 hotel admin en la BBDD.',
      );

    await Promise.all(
      data?.map(async (e, index) => {
        const hotels = new Hotel();
        hotels.name = e.name;
        hotels.description = e.description;
        hotels.email = e.email;
        hotels.country = e.country;
        hotels.city = e.city;
        hotels.address = e.address;
        hotels.location = e.location;
        hotels.totalRooms = e.totalRooms;
        hotels.services = e.services;
        hotels.rating = e.rating;
        hotels.images = e.images;
        hotels.price = e.price;
        const i = Math.floor(Math.random() * hotelAdmins.length);
        hotels.hotelAdmin = hotelAdmins[i];
        await this.hotelDbRepository
          .createQueryBuilder()
          .insert()
          .into(Hotel)
          .values(hotels)
          .execute();
      }),
    );

    return 'Added Hotels';
  }
}

// async searchHotels(name: string) {
//     const hotels = await this.hotelDbRepository
//         .createQueryBuilder('hotel')
//         .where('LOWER(hotel.name) LIKE LOWER(:name)', { name: `%${name}%` })
//         .getMany();
//       console.log("hola a todos");

//     return hotels;
// }

// async searchHotels(filter: any): Promise<Hotel[]> {
//   const query = this.hotelDbRepository
//     .createQueryBuilder('hotel')
//     .where('1 = 1'); // condición inicial

//   const conditions: string[] = [];

//   for (const key in filter) {
//     const values = filter[key].split('|');

//     for (const value of values) {
//       const entity = await this.naturalLanguageProcessor.getEntity(value);

//       if (entity) {
//         switch (entity.type) {
//           case 'hotel':
//             conditions.push(`hotel.name ILIKE '%${entity.name}%'`);
//             break;
//           case 'location':
//             if (entity.country) {
//               conditions.push(`hotel.country ILIKE '%${entity.country}%'`);
//             }
//             if (entity.city) {
//               conditions.push(`hotel.city ILIKE '%${entity.city}%'`);
//             }
//             break;
//           case 'service':
//             conditions.push(`hotel.services @> ARRAY['${entity.service}']`);
//             break;
//           case 'room':
//             conditions.push(`hotel.availableRooms @> ARRAY['${entity.room}']`);
//             break;
//           default:
//             break;
//         }
//       } else {
//         // Si no se encuentra entidad, utiliza el texto completo para la búsqueda
//         conditions.push(`hotel.name ILIKE '%${value}%'`);
//       }
//     }
//   }

//   if (conditions.length > 0) {
//     query.andWhere(conditions.join(' AND '));
//   }

//   return query.getMany();
// }
