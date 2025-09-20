import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SuperAdminSeeder } from './entities/super-admin.seeder';
import { HotelAdminSeeder } from './entities/hotel-admin.seeder';
import { CustomerSeeder } from './entities/customer.seeder';
import { HotelSeeder } from './entities/hotel.seeder';
import { RoomsTypeSeeder } from './entities/rooms-type.seeder';
import { RoomSeeder } from './entities/room.seeder';
import { ReviewSeeder } from './entities/review.seeder';
import { RoomAvailabilitySeeder } from './entities/room-availability.seeder';
import { InitialAdminSeeder } from './entities/initial-admin.seeder';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    private readonly superAdminSeeder: SuperAdminSeeder,
  private readonly hotelAdminSeeder: HotelAdminSeeder,
  private readonly initialAdminSeeder: InitialAdminSeeder,
    private readonly customerSeeder: CustomerSeeder,
    private readonly hotelSeeder: HotelSeeder,
    private readonly roomsTypeSeeder: RoomsTypeSeeder,
    private readonly roomSeeder: RoomSeeder,
    private readonly reviewSeeder: ReviewSeeder,
    private readonly roomAvailabilitySeeder: RoomAvailabilitySeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.runSeeders();
  }

  async runSeeders(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    // Define the order of seeding (important due to foreign key constraints)
    const seeders = [
      this.superAdminSeeder,
  this.hotelAdminSeeder,
  this.initialAdminSeeder,
      this.customerSeeder,
      this.hotelSeeder,
      this.roomsTypeSeeder,
      this.roomSeeder,
      this.reviewSeeder,
      this.roomAvailabilitySeeder,
    ];
    
    for (const seeder of seeders) {
      try {
        const shouldRun = await seeder.shouldRun();
        
        if (shouldRun) {
          console.log(`🚀 Running seeder: ${seeder.getName()}`);
          await seeder.seed();
          console.log(`✅ Completed seeder: ${seeder.getName()}`);
        } else {
          console.log(`⏭️  Skipping seeder: ${seeder.getName()} (data already exists)`);
        }
      } catch (error) {
        console.error(`❌ Error running seeder ${seeder.getName()}:`, error);
        // Don't stop the entire seeding process if one seeder fails
      }
    }
    
    console.log('🌱 Database seeding completed!');
  }

  async runSpecificSeeder(seederName: string): Promise<void> {
    const seederMap = {
      'super-admin': this.superAdminSeeder,
      'hotel-admin': this.hotelAdminSeeder,
      'customer': this.customerSeeder,
      'hotel': this.hotelSeeder,
      'rooms-type': this.roomsTypeSeeder,
      'room': this.roomSeeder,
      'review': this.reviewSeeder,
      'room-availability': this.roomAvailabilitySeeder,
    };

    const seeder = seederMap[seederName];
    if (!seeder) {
      throw new Error(`Seeder ${seederName} not found`);
    }

    console.log(`🚀 Running specific seeder: ${seeder.getName()}`);
    await seeder.seed();
    console.log(`✅ Completed seeder: ${seeder.getName()}`);
  }
}