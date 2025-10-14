import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomsType } from '../../roomstype/roomstype.entity';
import { Hotel } from '../../hotels/hotels.entity';
import { BaseSeeder } from '../base/base.seeder';

@Injectable()
export class RoomsTypeSeeder extends BaseSeeder<RoomsType> {
  constructor(
    @InjectRepository(RoomsType)
    private roomsTypeRepository: Repository<RoomsType>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {
    super(roomsTypeRepository);
  }

  getName(): string {
    return 'RoomsTypeSeeder';
  }

  async seed(): Promise<void> {
    const hotels = await this.hotelRepository.find();
    
    if (hotels.length === 0) {
      await this.log('No hotels found. Skipping room types seeding.');
      return;
    }

    const roomTypeTemplates = [
      {
        name: 'Estándar',
        capacity: 2,
        totalBathrooms: 1,
        totalBeds: 1,
        price: 80000,
        images: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1562790351-d273a961e0c9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
      },
      {
        name: 'Deluxe',
        capacity: 3,
        totalBathrooms: 1,
        totalBeds: 1,
        price: 120000,
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
      },
      {
        name: 'Suite',
        capacity: 4,
        totalBathrooms: 2,
        totalBeds: 2,
        price: 200000,
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
      },
      {
        name: 'Familiar',
        capacity: 6,
        totalBathrooms: 2,
        totalBeds: 3,
        price: 250000,
        images: [
          'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
      },
    ];

    const BATCH_SIZE = 100; // Process 100 room types at a time
    let allRoomTypes = [];
    let totalCreated = 0;

    // Create room types for each hotel
    for (let hotelIndex = 0; hotelIndex < hotels.length; hotelIndex++) {
      const hotel = hotels[hotelIndex];
      
      // Each hotel gets 2-4 room types
      const numRoomTypes = Math.floor(Math.random() * 3) + 2; // 2-4 room types
      const selectedTemplates = roomTypeTemplates.slice(0, numRoomTypes);
      
      for (const template of selectedTemplates) {
        // Adjust price based on hotel base price
        const adjustedPrice = Math.round(template.price * (hotel.price / 150000));
        
        allRoomTypes.push({
          ...template,
          price: adjustedPrice,
          hotel: hotel,
        });
      }
      
      // Save in batches when we reach BATCH_SIZE
      if (allRoomTypes.length >= BATCH_SIZE) {
        await this.repository.save(allRoomTypes);
        totalCreated += allRoomTypes.length;
        allRoomTypes = [];
      }
      
      // Log progress every 20 hotels
      if ((hotelIndex + 1) % 20 === 0) {
        await this.log(`Progress: Processed ${hotelIndex + 1}/${hotels.length} hotels`);
      }
    }
    
    // Save remaining room types
    if (allRoomTypes.length > 0) {
      await this.repository.save(allRoomTypes);
      totalCreated += allRoomTypes.length;
    }
    
    await this.log(`Seeded ${totalCreated} room type(s) across ${hotels.length} hotel(s)`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}