import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '../../hotels/hotels.entity';
import { HotelAdmins } from '../../hotel-admins/hotelAdmins.entity';
import { BaseSeeder } from '../base/base.seeder';

@Injectable()
export class HotelSeeder extends BaseSeeder<Hotel> {
  constructor(
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(HotelAdmins)
    private hotelAdminRepository: Repository<HotelAdmins>,
  ) {
    super(hotelRepository);
  }

  getName(): string {
    return 'HotelSeeder';
  }

  async seed(): Promise<void> {
    // Get all hotel admins to assign hotels to them
    const hotelAdmins = await this.hotelAdminRepository.find();
    
    if (hotelAdmins.length === 0) {
      await this.log('No hotel admins found. Skipping hotel seeding.');
      return;
    }

    const hotels = [
      {
        name: 'Hotel Palace Bogotá',
        description: 'Elegante hotel ubicado en el corazón de la capital colombiana, perfecto para viajeros de negocios y turistas. Ofrece habitaciones modernas con todas las comodidades.',
        email: 'reservas@hotelpalacebogota.com',
        country: 'Colombia',
        city: 'Bogotá',
        price: 150000,
        address: 'Carrera 13 #26-62, La Candelaria',
        location: [4.5981, -74.0758],
        totalRooms: 0,
        services: ['WiFi gratuito', 'Restaurante', 'Gimnasio', 'Centro de negocios', 'Servicio a la habitación', 'Estacionamiento'],
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[0],
      },
      {
        name: 'Gran Hotel Medellín',
        description: 'Moderno hotel en el centro de Medellín con vista panorámica de la ciudad. Ideal para explorar la vibrante cultura paisa y disfrutar de la vida nocturna.',
        email: 'info@granhotelmedellin.com',
        country: 'Colombia',
        city: 'Medellín',
        price: 120000,
        address: 'Carrera 70 #52-20, El Poblado',
        location: [6.2442, -75.5812],
        totalRooms: 0,
        services: ['WiFi gratuito', 'Piscina', 'Spa', 'Bar en la azotea', 'Aire acondicionado', 'Recepción 24h'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[1],
      },
      {
        name: 'Coastal Resort Cartagena',
        description: 'Resort frente al mar Caribe con playas privadas y vistas espectaculares. Perfecto para una escapada romántica o vacaciones familiares en la ciudad amurallada.',
        email: 'reservas@coastalresortcartagena.com',
        country: 'Colombia',
        city: 'Cartagena',
        price: 200000,
        address: 'Avenida San Martín #45-12, Bocagrande',
        location: [10.3997, -75.5144],
        totalRooms: 0,
        services: ['Playa privada', 'Todo incluido', 'Actividades acuáticas', 'Múltiples restaurantes', 'Kids club', 'Spa'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[2],
      },
      {
        name: 'Mountain Lodge Manizales',
        description: 'Acogedor lodge de montaña en el corazón del Eje Cafetero. Perfecto para los amantes del café y la naturaleza, con tours a fincas cafeteras cercanas.',
        email: 'contacto@mountainlodgemanizales.com',
        country: 'Colombia',
        city: 'Manizales',
        price: 90000,
        address: 'Carrera 25 #64-30, Centro',
        location: [5.0670, -75.5174],
        totalRooms: 0,
        services: ['Tours cafeteros', 'Chimenea', 'Vista a las montañas', 'Desayuno incluido', 'Senderismo', 'WiFi'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[3],
      },
      {
        name: 'Business Hotel Cali',
        description: 'Hotel ejecutivo en el distrito financiero de Cali, ideal para viajeros de negocios. Cuenta con modernas instalaciones y facilidades para eventos corporativos.',
        email: 'reservas@businesshotelcali.com',
        country: 'Colombia',
        city: 'Cali',
        price: 110000,
        address: 'Avenida 6N #28-45, Norte',
        location: [3.4516, -76.5320],
        totalRooms: 0,
        services: ['Centro de negocios', 'Salas de conferencias', 'Transporte aeropuerto', 'Concierge', 'Lavandería', 'Bar ejecutivo'],
        rating: 4.4,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[0], // Assigning a second hotel to the first admin
      },
    ];

    await this.createIfNotExists(hotels, 'email');
    
    // Update hotel admin numberOfHotels
    for (const admin of hotelAdmins) {
      const hotelCount = await this.hotelRepository.count({ 
        where: { hotelAdmin: { id: admin.id } } 
      });
      admin.numberOfHotels = hotelCount;
      await this.hotelAdminRepository.save(admin);
    }
    
    await this.log(`Seeded ${hotels.length} hotel(s) and updated admin hotel counts`);
  }
}