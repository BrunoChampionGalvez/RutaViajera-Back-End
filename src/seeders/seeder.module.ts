import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';

// Entities
import { SuperAdmins } from '../super-admin/superAdmin.entity';
import { HotelAdmins } from '../hotel-admins/hotelAdmins.entity';
import { Customers } from '../customers/customers.entity';
import { Hotel } from '../hotels/hotels.entity';
import { RoomsType } from '../roomstype/roomstype.entity';
import { Room } from '../rooms/rooms.entity';
import { Review } from '../reviews/reviews.entity';
import { Booking } from '../bookings/booking.entity';
import { BookingDetails } from '../bookingDetails/booking-detail.entity';
import { RoomAvailability } from '../availabilities/availability.entity';

// Seeders
import { SuperAdminSeeder } from './entities/super-admin.seeder';
import { HotelAdminSeeder } from './entities/hotel-admin.seeder';
import { CustomerSeeder } from './entities/customer.seeder';
import { HotelSeeder } from './entities/hotel.seeder';
import { RoomsTypeSeeder } from './entities/rooms-type.seeder';
import { RoomSeeder } from './entities/room.seeder';
import { RoomAvailabilitySeeder } from './entities/room-availability.seeder';
import { InitialAdminSeeder } from './entities/initial-admin.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SuperAdmins,
      HotelAdmins,
      Customers,
      Hotel,
      RoomsType,
      Room,
      Review,
      Booking,
      BookingDetails,
      RoomAvailability,
    ]),
  ],
  providers: [
    SeederService,
    SuperAdminSeeder,
  InitialAdminSeeder,
    HotelAdminSeeder,
    CustomerSeeder,
    HotelSeeder,
    RoomsTypeSeeder,
    RoomSeeder,
    RoomAvailabilitySeeder,
  ],
  exports: [SeederService],
})
export class SeederModule {}