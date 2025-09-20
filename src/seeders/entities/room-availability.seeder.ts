import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomAvailability } from '../../availabilities/availability.entity';
import { Room } from '../../rooms/rooms.entity';
import { BaseSeeder } from '../base/base.seeder';

@Injectable()
export class RoomAvailabilitySeeder extends BaseSeeder<RoomAvailability> {
  constructor(
    @InjectRepository(RoomAvailability)
    private roomAvailabilityRepository: Repository<RoomAvailability>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {
    super(roomAvailabilityRepository);
  }

  getName(): string {
    return 'RoomAvailabilitySeeder';
  }

  async seed(): Promise<void> {
    const rooms = await this.roomRepository.find();
    
    if (rooms.length === 0) {
      await this.log('No rooms found. Skipping room availability seeding.');
      return;
    }

    const allAvailabilities = [];
    const today = new Date();
    
    // Create availability for each room for the next 90 days
    for (const room of rooms) {
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Make some random days unavailable (10% chance)
        const isAvailable = Math.random() > 0.1;
        
        const startDate = date.toISOString().split('T')[0];
        const endDate = startDate; // Single day availability
        
        allAvailabilities.push({
          startDate: startDate,
          endDate: endDate,
          room: room,
          isAvailable: isAvailable,
          isDeleted: false,
        });
      }
    }

    const createdAvailabilities = await this.repository.save(allAvailabilities);
    await this.log(`Seeded ${createdAvailabilities.length} room availability record(s) for ${rooms.length} room(s)`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}