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
      // COLOMBIA - Bogotá
      {
        name: 'Hotel Palace Bogotá',
        description: 'Elegante hotel ubicado en el corazón de la capital colombiana, perfecto para viajeros de negocios y turistas. Ofrece habitaciones modernas con todas las comodidades.',
        email: 'reservas@hotelpalacebogota.com',
        country: 'Colombia',
        city: 'Bogotá',
        price: 150,
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
        name: 'JW Marriott Bogotá',
        description: 'Hotel de lujo en la zona financiera con espectaculares vistas de la ciudad. Ideal para ejecutivos y eventos de alto nivel.',
        email: 'reservas@jwmarriotbogota.com',
        country: 'Colombia',
        city: 'Bogotá',
        price: 220,
        address: 'Calle 73 #8-60, Chapinero',
        location: [4.6533, -74.0582],
        totalRooms: 0,
        services: ['Spa de lujo', 'Piscina climatizada', 'Restaurante gourmet', 'Bar ejecutivo', 'Gimnasio 24h', 'Salas de reuniones'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[0],
      },
      
      // COLOMBIA - Medellín
      {
        name: 'Gran Hotel Medellín',
        description: 'Moderno hotel en el centro de Medellín con vista panorámica de la ciudad. Ideal para explorar la vibrante cultura paisa y disfrutar de la vida nocturna.',
        email: 'info@granhotelmedellin.com',
        country: 'Colombia',
        city: 'Medellín',
        price: 120,
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
        name: 'Hotel Dann Carlton Medellín',
        description: 'Hotel boutique en El Poblado con diseño contemporáneo. Perfecto para turistas que buscan comodidad y estilo.',
        email: 'reservas@danncarltonmde.com',
        country: 'Colombia',
        city: 'Medellín',
        price: 145,
        address: 'Carrera 43A #7-50, El Poblado',
        location: [6.2077, -75.5658],
        totalRooms: 0,
        services: ['Rooftop bar', 'Piscina infinity', 'Restaurante fusión', 'Spa', 'Concierge', 'Transporte privado'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[1],
      },
      
      // COLOMBIA - Cartagena
      {
        name: 'Coastal Resort Cartagena',
        description: 'Resort frente al mar Caribe con playas privadas y vistas espectaculares. Perfecto para una escapada romántica o vacaciones familiares en la ciudad amurallada.',
        email: 'reservas@coastalresortcartagena.com',
        country: 'Colombia',
        city: 'Cartagena',
        price: 280,
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
        name: 'Casa San Agustín',
        description: 'Hotel boutique colonial en el corazón del centro histórico. Una joya arquitectónica que combina historia y lujo moderno.',
        email: 'info@casasanagustin.com',
        country: 'Colombia',
        city: 'Cartagena',
        price: 350,
        address: 'Calle de la Universidad #36-44, Centro Histórico',
        location: [10.4237, -75.5503],
        totalRooms: 0,
        services: ['Arquitectura colonial', 'Piscina en patio', 'Restaurante gourmet', 'Spa boutique', 'Tours privados', 'Mayordomo personal'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[2],
      },
      
      // COLOMBIA - Manizales & Cali
      {
        name: 'Mountain Lodge Manizales',
        description: 'Acogedor lodge de montaña en el corazón del Eje Cafetero. Perfecto para los amantes del café y la naturaleza, con tours a fincas cafeteras cercanas.',
        email: 'contacto@mountainlodgemanizales.com',
        country: 'Colombia',
        city: 'Manizales',
        price: 85,
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
        price: 110,
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
        hotelAdmin: hotelAdmins[3],
      },
      
      // MÉXICO - Ciudad de México
      {
        name: 'Hotel Reforma CDMX',
        description: 'Icónico hotel sobre Paseo de la Reforma con vistas impresionantes del Ángel de la Independencia. Lujo y tradición mexicana.',
        email: 'reservas@hotelreformacdmx.com',
        country: 'México',
        city: 'Ciudad de México',
        price: 180,
        address: 'Paseo de la Reforma 222, Col. Juárez',
        location: [19.4326, -99.1332],
        totalRooms: 0,
        services: ['Restaurante mexicano', 'Bar en azotea', 'Gimnasio', 'Spa', 'WiFi de alta velocidad', 'Valet parking'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[4],
      },
      {
        name: 'Gran Hotel Ciudad de México',
        description: 'Histórico hotel en el Zócalo con impresionante vitrales art nouveau. Una experiencia única en el corazón del centro histórico.',
        email: 'contacto@granhotelcdmx.com',
        country: 'México',
        city: 'Ciudad de México',
        price: 160,
        address: '16 de Septiembre 82, Centro Histórico',
        location: [19.4340, -99.1311],
        totalRooms: 0,
        services: ['Arquitectura histórica', 'Restaurante tradicional', 'Terraza panorámica', 'WiFi gratuito', 'Tours culturales', 'Concierge'],
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[4],
      },
      
      // MÉXICO - Cancún
      {
        name: 'Cancún Beach Resort & Spa',
        description: 'Resort todo incluido frente al mar Caribe con playas de arena blanca. Paraíso tropical con todas las comodidades.',
        email: 'reservas@cancunbeachresort.com',
        country: 'México',
        city: 'Cancún',
        price: 320,
        address: 'Blvd Kukulcan Km 12.5, Zona Hotelera',
        location: [21.1619, -86.8515],
        totalRooms: 0,
        services: ['Todo incluido', 'Playa privada', '5 restaurantes', 'Spa de clase mundial', 'Actividades acuáticas', 'Animación diaria'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[5],
      },
      {
        name: 'Hyatt Ziva Cancún',
        description: 'Resort de lujo todo incluido en una península privada rodeada de playas. Experiencia premium en el Caribe mexicano.',
        email: 'info@hyattzivacancun.com',
        country: 'México',
        city: 'Cancún',
        price: 380,
        address: 'Blvd Kukulcan Km 9.5, Zona Hotelera',
        location: [21.1333, -86.7466],
        totalRooms: 0,
        services: ['Todo incluido premium', 'Múltiples piscinas', 'Restaurantes de especialidad', 'Club de playa', 'Kids club', 'Spa de lujo'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[5],
      },
      
      // MÉXICO - Guadalajara
      {
        name: 'Hotel Morales Guadalajara',
        description: 'Hotel histórico en el corazón de Guadalajara con elegancia colonial. Tradición tapatía y confort moderno.',
        email: 'reservas@hotelmoralesgdl.com',
        country: 'México',
        city: 'Guadalajara',
        price: 95,
        address: 'Av. Corona 243, Centro',
        location: [20.6767, -103.3475],
        totalRooms: 0,
        services: ['Restaurante típico', 'Bar tradicional', 'WiFi gratuito', 'Estacionamiento', 'Recepción 24h', 'Centro de negocios'],
        rating: 4.4,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[6],
      },
      {
        name: 'Hilton Guadalajara',
        description: 'Moderno hotel de negocios en Expo Guadalajara. Perfecto para congresos y eventos corporativos.',
        email: 'info@hiltongdl.com',
        country: 'México',
        city: 'Guadalajara',
        price: 135,
        address: 'Av. de las Rosas 2933, Rinconada del Bosque',
        location: [20.6597, -103.4003],
        totalRooms: 0,
        services: ['Centro de convenciones', 'Gimnasio completo', 'Piscina', 'Restaurante internacional', 'Salas ejecutivas', 'WiFi de alta velocidad'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[6],
      },
      
      // ARGENTINA - Buenos Aires
      {
        name: 'Alvear Palace Hotel',
        description: 'Emblemático hotel de lujo en Recoleta. El más prestigioso de Buenos Aires con servicio impecable y elegancia francesa.',
        email: 'reservas@alvearpalace.com',
        country: 'Argentina',
        city: 'Buenos Aires',
        address: 'Av. Alvear 1891, Recoleta',
        price: 450,
        location: [-34.5883, -58.3829],
        totalRooms: 0,
        services: ['Mayordomo personal', 'Spa de lujo', 'Restaurante estrella Michelin', 'Piscina climatizada', 'Salón de té', 'Galería de arte'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[7],
      },
      {
        name: 'Faena Hotel Buenos Aires',
        description: 'Hotel boutique de diseño en Puerto Madero. Arte, cultura y sofisticación en cada rincón.',
        email: 'info@faenahotel.com',
        country: 'Argentina',
        city: 'Buenos Aires',
        price: 380,
        address: 'Martha Salotti 445, Puerto Madero',
        location: [-34.6118, -58.3632],
        totalRooms: 0,
        services: ['Diseño Philippe Starck', 'Teatro cabaret', 'Spa holístico', 'Piscina', 'Restaurante de autor', 'Galería de arte'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[7],
      },
      
      // ARGENTINA - Mendoza
      {
        name: 'Park Hyatt Mendoza',
        description: 'Elegante hotel en el corazón de Mendoza, puerta de entrada a la región vitivinícola más importante de Argentina.',
        email: 'reservas@parkhyattmendoza.com',
        country: 'Argentina',
        city: 'Mendoza',
        price: 185,
        address: 'Chile 1124, Centro',
        location: [-32.8895, -68.8458],
        totalRooms: 0,
        services: ['Casino', 'Spa vinoterapia', 'Restaurante gourmet', 'Wine bar', 'Tours a bodegas', 'Piscina'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[8],
      },
      {
        name: 'Cavas Wine Lodge',
        description: 'Lodge boutique entre viñedos con vistas a los Andes. Experiencia enológica de lujo en el Valle de Uco.',
        email: 'info@cavaswine.com',
        country: 'Argentina',
        city: 'Mendoza',
        price: 420,
        address: 'Costa Flores, Valle de Uco',
        location: [-33.5200, -69.1280],
        totalRooms: 0,
        services: ['Viñedo propio', 'Degustaciones privadas', 'Spa con vista a los Andes', 'Gastronomía de autor', 'Cabalgatas', 'Infinity pool'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[8],
      },
      
      // ARGENTINA - Córdoba
      {
        name: 'Sheraton Córdoba Hotel',
        description: 'Moderno hotel en el centro de Córdoba, segunda ciudad de Argentina. Ideal para negocios y turismo.',
        email: 'reservas@sheratoncordoba.com',
        country: 'Argentina',
        city: 'Córdoba',
        price: 125,
        address: 'Duarte Quirós 1300, Nueva Córdoba',
        location: [-31.4201, -64.1888],
        totalRooms: 0,
        services: ['Centro de convenciones', 'Piscina climatizada', 'Gimnasio', 'Restaurante internacional', 'Business center', 'WiFi premium'],
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[9],
      },
      
      // PERÚ - Lima
      {
        name: 'Belmond Miraflores Park',
        description: 'Hotel de lujo frente al océano Pacífico en el exclusivo distrito de Miraflores. Elegancia y vistas espectaculares.',
        email: 'reservas@belmondmiraflores.com',
        country: 'Perú',
        city: 'Lima',
        price: 340,
        address: 'Av. Malecón de la Reserva 1035, Miraflores',
        location: [-12.1196, -77.0301],
        totalRooms: 0,
        services: ['Vista al Pacífico', 'Restaurante gourmet', 'Spa', 'Piscina en azotea', 'Salón de té', 'Mayordomo'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[10],
      },
      {
        name: 'Hotel B',
        description: 'Boutique hotel en mansión de 1914 en Barranco, el barrio bohemio de Lima. Arte, diseño y gastronomía.',
        email: 'info@hotelb.pe',
        country: 'Perú',
        city: 'Lima',
        price: 195,
        address: 'Jr. Sáenz Peña 204, Barranco',
        location: [-12.1465, -77.0207],
        totalRooms: 0,
        services: ['Galería de arte', 'Restaurante de autor', 'Bar de pisco', 'Biblioteca', 'WiFi gratuito', 'Tours culturales'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[10],
      },
      
      // PERÚ - Cusco
      {
        name: 'Belmond Hotel Monasterio',
        description: 'Antiguo monasterio del siglo XVI convertido en hotel de lujo. Experiencia única en el corazón de Cusco.',
        email: 'reservas@monasterio.com',
        country: 'Perú',
        city: 'Cusco',
        price: 380,
        address: 'Calle Palacio 136, Plazoleta Nazarenas',
        location: [-13.5170, -71.9785],
        totalRooms: 0,
        services: ['Arquitectura colonial', 'Capilla del siglo XVII', 'Oxígeno en habitaciones', 'Restaurante gourmet', 'Spa andino', 'Concierge especializado'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[11],
      },
      {
        name: 'Inkaterra La Casona',
        description: 'Casa solariega del siglo XVI restaurada como hotel boutique. Lujo íntimo a pasos de la Plaza de Armas.',
        email: 'info@inkaterracusco.com',
        country: 'Perú',
        city: 'Cusco',
        price: 520,
        address: 'Plazoleta Las Nazarenas 113',
        location: [-13.5165, -71.9786],
        totalRooms: 0,
        services: ['Sólo 11 suites', 'Mayordomo personal', 'Spa privado', 'Comidas gourmet', 'Fogata nocturna', 'Tours exclusivos a Machu Picchu'],
        rating: 5.0,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[11],
      },
      
      // CHILE - Santiago
      {
        name: 'The Ritz-Carlton Santiago',
        description: 'Sofisticación y elegancia en el corazón del barrio El Golf. El hotel más lujoso de Chile con vistas a los Andes.',
        email: 'reservas@ritzcarlton.cl',
        country: 'Chile',
        city: 'Santiago',
        price: 290,
        address: 'El Alcalde 15, Las Condes',
        location: [-33.4172, -70.6040],
        totalRooms: 0,
        services: ['Spa de lujo', 'Piscina en piso 15', 'Restaurante gourmet', 'Club lounge', 'Vista a los Andes', 'Gimnasio premium'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[12],
      },
      {
        name: 'Lastarria Boutique Hotel',
        description: 'Hotel boutique en el bohemio barrio Lastarria. Diseño, arte y cultura en el corazón cultural de Santiago.',
        email: 'info@lastarriaboutique.cl',
        country: 'Chile',
        city: 'Santiago',
        price: 165,
        address: 'Coronel Santiago Bueras 188, Lastarria',
        location: [-33.4378, -70.6398],
        totalRooms: 0,
        services: ['Diseño contemporáneo', 'Terraza panorámica', 'Restaurant fusión', 'Bar de vinos', 'WiFi gratuito', 'Concierge cultural'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[12],
      },
      
      // CHILE - Valparaíso
      {
        name: 'Casa Higueras',
        description: 'Elegante hotel boutique en cerro Alegre con vistas panorámicas de la bahía. Encanto porteño y diseño sofisticado.',
        email: 'reservas@casahigueras.cl',
        country: 'Chile',
        city: 'Valparaíso',
        price: 185,
        address: 'Higuera 133, Cerro Alegre',
        location: [-33.0458, -71.6197],
        totalRooms: 0,
        services: ['Vista a la bahía', 'Piscina infinity', 'Restaurante gourmet', 'Spa', 'Terraza panorámica', 'Tours del puerto'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[13],
      },
      
      // BRASIL - Rio de Janeiro
      {
        name: 'Belmond Copacabana Palace',
        description: 'Icónico hotel de lujo frente a la playa de Copacabana. Símbolo de elegancia carioca desde 1923.',
        email: 'reservas@copacabanapalace.com',
        country: 'Brasil',
        city: 'Rio de Janeiro',
        price: 480,
        address: 'Av. Atlântica 1702, Copacabana',
        location: [-22.9688, -43.1829],
        totalRooms: 0,
        services: ['Playa privada', 'Spa de lujo', 'Piscina olímpica', '3 restaurantes gourmet', 'Piano bar', 'Mayordomo'],
        rating: 4.9,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[14],
      },
      {
        name: 'Fasano Rio de Janeiro',
        description: 'Hotel boutique de diseño en Ipanema. Sofisticación brasileña con estilo Philippe Starck.',
        email: 'info@fasanorio.com',
        country: 'Brasil',
        city: 'Rio de Janeiro',
        price: 420,
        address: 'Av. Vieira Souto 80, Ipanema',
        location: [-22.9838, -43.2096],
        totalRooms: 0,
        services: ['Frente a Ipanema', 'Piscina rooftop', 'Restaurante italiano', 'Spa', 'Beach service', 'Bar panorámico'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[14],
      },
      
      // BRASIL - São Paulo
      {
        name: 'Unique Hotel',
        description: 'Hotel de diseño vanguardista en Jardins. Arquitectura única en forma de sandía con piscina en la azotea.',
        email: 'reservas@uniquehotel.com',
        country: 'Brasil',
        city: 'São Paulo',
        price: 310,
        address: 'Av. Brigadeiro Luís Antônio 4700, Jardim Paulista',
        location: [-23.5815, -46.6728],
        totalRooms: 0,
        services: ['Arquitectura única', 'Rooftop bar', 'Restaurante japonés', 'Spa', 'Piscina con vista 360°', 'Galería de arte'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[15],
      },
      {
        name: 'Hotel Emiliano',
        description: 'Hotel boutique de lujo en Jardins. Diseño minimalista y servicio personalizado de primer nivel.',
        email: 'info@emiliano.com.br',
        country: 'Brasil',
        city: 'São Paulo',
        price: 280,
        address: 'Rua Oscar Freire 384, Jardins',
        location: [-23.5618, -46.6729],
        totalRooms: 0,
        services: ['Mayordomo personal', 'Spa exclusivo', 'Restaurante de autor', 'Rooftop pool', 'Biblioteca', 'Chófer privado'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[15],
      },
      
      // ECUADOR - Quito
      {
        name: 'Casa Gangotena',
        description: 'Mansión restaurada de 1600 en la Plaza San Francisco. Lujo boutique en el centro histórico de Quito.',
        email: 'reservas@casagangotena.com',
        country: 'Ecuador',
        city: 'Quito',
        price: 245,
        address: 'Bolívar OE6-41, Plaza San Francisco',
        location: [-0.2186, -78.5136],
        totalRooms: 0,
        services: ['Arquitectura colonial', 'Restaurante gourmet', 'Bar de cócteles', 'Terraza con vista', 'Spa', 'Biblioteca'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[16],
      },
      {
        name: 'Swissôtel Quito',
        description: 'Moderno hotel de negocios con vistas panorámicas de la ciudad y volcanes. Confort europeo en los Andes.',
        email: 'info@swissotelquito.com',
        country: 'Ecuador',
        city: 'Quito',
        price: 165,
        address: 'Av. 12 de Octubre 1820, La Carolina',
        location: [-0.1865, -78.4851],
        totalRooms: 0,
        services: ['Vista a volcanes', 'Centro de negocios', 'Gimnasio completo', 'Piscina climatizada', 'Restaurante internacional', 'Salas ejecutivas'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[16],
      },
      
      // ECUADOR - Guayaquil
      {
        name: 'Hotel del Parque',
        description: 'Boutique hotel en antigua casa de cacao del siglo XIX. Elegancia histórica en el Parque Histórico.',
        email: 'reservas@hoteldelparque.com',
        country: 'Ecuador',
        city: 'Guayaquil',
        price: 195,
        address: 'Samborondón, Parque Histórico',
        location: [-2.1300, -79.9006],
        totalRooms: 0,
        services: ['Entorno natural', 'Restaurante de autor', 'Spa', 'Piscina', 'Tours históricos', 'Observación de aves'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[17],
      },
      
      // COSTA RICA - San José
      {
        name: 'Hotel Grano de Oro',
        description: 'Hotel boutique de lujo en mansión victoriana restaurada. Elegancia tropical en el corazón de San José.',
        email: 'info@granodeoro.com',
        country: 'Costa Rica',
        city: 'San José',
        price: 175,
        address: 'Calle 30, Avenida 2-4',
        location: [9.9334, -84.0834],
        totalRooms: 0,
        services: ['Arquitectura victoriana', 'Restaurante gourmet', 'Piscina jardín', 'Spa', 'Jacuzzi en azotea', 'WiFi gratuito'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[18],
      },
      
      // COSTA RICA - Tamarindo
      {
        name: 'Tamarindo Beach Resort',
        description: 'Resort frente al mar con ambiente pura vida. Surf, naturaleza y relax en el Pacífico costarricense.',
        email: 'reservas@tamarindobeach.com',
        country: 'Costa Rica',
        city: 'Tamarindo',
        price: 220,
        address: 'Playa Tamarindo, Guanacaste',
        location: [10.2993, -85.8415],
        totalRooms: 0,
        services: ['Frente a la playa', 'Escuela de surf', 'Tours ecológicos', 'Piscina', 'Restaurante orgánico', 'Yoga al amanecer'],
        rating: 4.6,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[19],
      },
      {
        name: 'Nantipa Hotel',
        description: 'Hotel boutique de diseño frente al mar. Lujo sostenible y estilo contemporáneo en Santa Teresa.',
        email: 'info@nantipahotel.com',
        country: 'Costa Rica',
        city: 'Tamarindo',
        price: 285,
        address: 'Santa Teresa Beach',
        location: [9.6525, -85.1705],
        totalRooms: 0,
        services: ['Diseño contemporáneo', 'Infinity pool', 'Restaurante farm-to-table', 'Spa', 'Surf spot', 'Yoga shala'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[19],
      },
      
      // PANAMÁ - Ciudad de Panamá
      {
        name: 'The Bristol Panama',
        description: 'Hotel boutique de lujo con servicio personalizado excepcional. Elegancia europea en el corazón financiero.',
        email: 'reservas@thebristol.com',
        country: 'Panamá',
        city: 'Ciudad de Panamá',
        price: 240,
        address: 'Calle Aquilino de la Guardia, Bella Vista',
        location: [8.9824, -79.5199],
        totalRooms: 0,
        services: ['Mayordomo personal', 'Restaurante de autor', 'Spa', 'Bar de puros', 'Gimnasio', 'Business center'],
        rating: 4.8,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[20],
      },
      {
        name: 'American Trade Hotel',
        description: 'Hotel boutique en edificio histórico de 1917 en Casco Viejo. Historia, arte y diseño en el barrio colonial.',
        email: 'info@americantradehotel.com',
        country: 'Panamá',
        city: 'Ciudad de Panamá',
        price: 195,
        address: 'Plaza Herrera, Casco Antiguo',
        location: [8.9517, -79.5346],
        totalRooms: 0,
        services: ['Arquitectura art decó', 'Rooftop bar', 'Restaurante gourmet', 'Jazz club', 'Galería de arte', 'Piscina'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[20],
      },
      
      // URUGUAY - Montevideo
      {
        name: 'Sofitel Montevideo Casino Carrasco',
        description: 'Icónico hotel de lujo en edificio histórico frente al mar. Elegancia francesa en la Rambla.',
        email: 'reservas@sofitelmontevideo.com',
        country: 'Uruguay',
        city: 'Montevideo',
        price: 215,
        address: 'Rambla República de México 6451, Carrasco',
        location: [-34.8667, -56.0500],
        totalRooms: 0,
        services: ['Casino', 'Spa So', 'Restaurante gourmet', 'Vista al Río de la Plata', 'Piscina', 'Beach club'],
        rating: 4.7,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[21],
      },
      {
        name: 'Cottage Puerto Buceo',
        description: 'Hotel boutique moderno en Puerto Buceo. Diseño contemporáneo junto al puerto deportivo.',
        email: 'info@cottagepuertobuceo.com',
        country: 'Uruguay',
        city: 'Montevideo',
        price: 145,
        address: 'Av. Bolivia 2157, Puerto Buceo',
        location: [-34.9061, -56.1258],
        totalRooms: 0,
        services: ['Vista al puerto', 'Restaurante', 'Gimnasio', 'Sauna', 'WiFi premium', 'Estacionamiento'],
        rating: 4.5,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
        ],
        isDeleted: false,
        hotelAdmin: hotelAdmins[21],
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