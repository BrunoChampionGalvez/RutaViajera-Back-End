# Database Seeders

This directory contains the seeding system for the RutaViajera backend application.

## Overview

The seeding system automatically populates the database with sample data when the application starts. It only runs when the database is empty to prevent duplicate data.

## Architecture

- **BaseSeeder**: Abstract class that provides common functionality for all seeders
- **ISeeder**: Interface that defines the contract for all seeders
- **SeederService**: Manages the execution of all seeders in the correct order
- **Individual Seeders**: Specific implementations for each entity

## Seeding Order

The seeders run in the following order to respect foreign key constraints:

1. **SuperAdminSeeder** - Creates system administrators
1.b **InitialAdminSeeder** - (Conditional) Ensures presence of default admin (admin@mail.com)
2. **HotelAdminSeeder** - Creates hotel administrators
3. **CustomerSeeder** - Creates customer accounts
4. **HotelSeeder** - Creates hotels and assigns them to hotel admins
5. **RoomsTypeSeeder** - Creates room types for each hotel
6. **RoomSeeder** - Creates individual rooms for each room type
7. **ReviewSeeder** - Creates reviews from customers for hotels
8. **RoomAvailabilitySeeder** - Creates availability schedules for rooms

## Sample Data

### SuperAdmins
- System Administrator (admin@rutaviajera.com)
- Main Administrator (superadmin@rutaviajera.com)
- Password: `SuperAdmin123!`

### Initial Admin (Ensured)
- Primary Admin (admin@mail.com)
- Password: `Test*1234!`
- Only created if that exact email does not already exist.

### Hotel Admins
- 4 hotel administrators across different Colombian cities
- Password: `HotelAdmin123!`

### Customers
- 5 sample customers across different Colombian cities
- Password: `Customer123!`

### Hotels
- 5 hotels across Colombian cities (Bogotá, Medellín, Cartagena, Manizales, Cali)
- Complete with descriptions, services, locations, and images

### Room Types
- Standard, Deluxe, Suite, and Family room types
- Different capacities, prices, and amenities

### Rooms
- 3-8 rooms per room type
- Properly numbered (101, 102, 201, etc.)

### Reviews
- 2-5 reviews per hotel
- Realistic comments and ratings (3.0-5.0)

### Room Availability
- 90 days of availability for each room
- 90% availability rate (10% randomly unavailable)

## How It Works

1. **Automatic Execution**: Seeders run automatically when the application starts
2. **Idempotent**: Seeders check if data exists before running to prevent duplicates
3. **Error Handling**: If one seeder fails, others continue to run
4. **Logging**: Detailed console logs show the seeding progress

## Manual Execution

You can also run specific seeders manually by using the SeederService:

\`\`\`typescript
// Run all seeders
await seederService.runSeeders();

// Run a specific seeder
await seederService.runSpecificSeeder('hotel');
\`\`\`

## Environment Considerations

- **Development**: Seeders run automatically to provide sample data
- **Production**: Seeders should be disabled or run manually with production-appropriate data

## Customization

To add new seeders:

1. Create a new seeder class extending `BaseSeeder`
2. Implement the required methods (`seed()`, `getName()`)
3. Add it to the `SeederModule`
4. Add it to the `SeederService` in the correct order

## Files Structure

\`\`\`
seeders/
├── base/
│   └── base.seeder.ts          # Base class for all seeders
├── entities/
│   ├── super-admin.seeder.ts   # SuperAdmin entity seeder
│   ├── initial-admin.seeder.ts # Ensures default primary admin (admin@mail.com)
│   ├── hotel-admin.seeder.ts   # HotelAdmin entity seeder
│   ├── customer.seeder.ts      # Customer entity seeder
│   ├── hotel.seeder.ts         # Hotel entity seeder
│   ├── rooms-type.seeder.ts    # RoomsType entity seeder
│   ├── room.seeder.ts          # Room entity seeder
│   ├── review.seeder.ts        # Review entity seeder
│   └── room-availability.seeder.ts # RoomAvailability entity seeder
├── interfaces/
│   └── seeder.interface.ts     # Seeder interface
├── seeder.module.ts            # Seeder module
└── seeder.service.ts           # Main seeder service
\`\`\`