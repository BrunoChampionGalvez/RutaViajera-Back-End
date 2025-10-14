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

    const today = new Date();
    const BATCH_SIZE = 500; // Process 500 records at a time to avoid parameter limit
    let totalCreated = 0;
    
    // Process rooms in batches
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];
      const availabilities = [];
      
      // Create availability for this room for the next 90 days
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Make some random days unavailable (10% chance)
        const isAvailable = Math.random() > 0.1;
        
        const startDate = date.toISOString().split('T')[0];
        const endDate = startDate; // Single day availability
        
        availabilities.push({
          startDate: startDate,
          endDate: endDate,
          room: room,
          isAvailable: isAvailable,
          isDeleted: false,
        });
      }
      
      // Save this room's availabilities in batches
      for (let i = 0; i < availabilities.length; i += BATCH_SIZE) {
        const batch = availabilities.slice(i, i + BATCH_SIZE);
        await this.repository.save(batch);
        totalCreated += batch.length;
      }
      
      // Log progress every 50 rooms
      if ((roomIndex + 1) % 50 === 0) {
        await this.log(`Progress: Processed ${roomIndex + 1}/${rooms.length} rooms (${totalCreated} availability records created)`);
      }
    }
    
    await this.log(`Seeded ${totalCreated} room availability record(s) for ${rooms.length} room(s)`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}