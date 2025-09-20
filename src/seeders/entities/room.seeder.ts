import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../rooms/rooms.entity';
import { RoomsType } from '../../roomstype/roomstype.entity';
import { Hotel } from '../../hotels/hotels.entity';
import { BaseSeeder } from '../base/base.seeder';

@Injectable()
export class RoomSeeder extends BaseSeeder<Room> {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomsType)
    private roomsTypeRepository: Repository<RoomsType>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {
    super(roomRepository);
  }

  getName(): string {
    return 'RoomSeeder';
  }

  async seed(): Promise<void> {
    const roomTypes = await this.roomsTypeRepository.find({
      relations: ['hotel'],
    });
    
    if (roomTypes.length === 0) {
      await this.log('No room types found. Skipping rooms seeding.');
      return;
    }

    const allRooms = [];

    // Create rooms for each room type
    for (const roomType of roomTypes) {
      // Each room type gets 3-8 actual rooms
      const numRooms = Math.floor(Math.random() * 6) + 3; // 3-8 rooms per type
      
      for (let i = 1; i <= numRooms; i++) {
        // Generate room numbers like 101, 102, 201, 202, etc.
        const floor = Math.floor((i - 1) / 10) + 1;
        const roomOnFloor = ((i - 1) % 10) + 1;
        const roomNumber = `${floor}${roomOnFloor.toString().padStart(2, '0')}`;
        
        allRooms.push({
          roomNumber: roomNumber,
          isDeleted: false,
          isAvailable: true,
          roomtype: roomType,
        });
      }
    }

    const createdRooms = await this.repository.save(allRooms);
    
    // Update total rooms count for each hotel
    const hotels = await this.hotelRepository.find({
      relations: ['roomstype', 'roomstype.rooms'],
    });
    
    for (const hotel of hotels) {
      let totalRooms = 0;
      for (const roomType of hotel.roomstype) {
        if (roomType.rooms) {
          totalRooms += roomType.rooms.length;
        }
      }
      
      hotel.totalRooms = totalRooms;
      await this.hotelRepository.save(hotel);
    }
    
    await this.log(`Seeded ${createdRooms.length} room(s) and updated hotel room counts`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}