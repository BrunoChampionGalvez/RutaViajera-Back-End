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

    const BATCH_SIZE = 500; // Process 500 rooms at a time
    let totalCreated = 0;
    let allRooms = [];

    // Create rooms for each room type
    for (let typeIndex = 0; typeIndex < roomTypes.length; typeIndex++) {
      const roomType = roomTypes[typeIndex];
      
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
      
      // Save in batches when we reach BATCH_SIZE
      if (allRooms.length >= BATCH_SIZE) {
        await this.repository.save(allRooms);
        totalCreated += allRooms.length;
        allRooms = [];
      }
      
      // Log progress every 100 room types
      if ((typeIndex + 1) % 100 === 0) {
        await this.log(`Progress: Processed ${typeIndex + 1}/${roomTypes.length} room types`);
      }
    }
    
    // Save remaining rooms
    if (allRooms.length > 0) {
      await this.repository.save(allRooms);
      totalCreated += allRooms.length;
    }
    
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
    
    await this.log(`Seeded ${totalCreated} room(s) and updated hotel room counts`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}