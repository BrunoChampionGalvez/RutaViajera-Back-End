import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../reviews/reviews.entity';
import { Hotel } from '../../hotels/hotels.entity';
import { Customers } from '../../customers/customers.entity';
import { BaseSeeder } from '../base/base.seeder';

@Injectable()
export class ReviewSeeder extends BaseSeeder<Review> {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Customers)
    private customerRepository: Repository<Customers>,
  ) {
    super(reviewRepository);
  }

  getName(): string {
    return 'ReviewSeeder';
  }

  async seed(): Promise<void> {
    const hotels = await this.hotelRepository.find();
    const customers = await this.customerRepository.find();
    
    if (hotels.length === 0 || customers.length === 0) {
      await this.log('No hotels or customers found. Skipping reviews seeding.');
      return;
    }

    const reviewComments = [
      'Excelente servicio y ubicación perfecta. Las habitaciones están muy limpias y el personal es muy amable.',
      'Hotel increíble con vistas espectaculares. La comida del restaurante es deliciosa y el spa es relajante.',
      'Muy buena relación calidad-precio. Las instalaciones están en perfecto estado y el desayuno es variado.',
      'Lugar perfecto para descansar. El ambiente es tranquilo y las habitaciones son muy cómodas.',
      'Experiencia fantástica. El servicio al cliente es excepcional y las amenidades son de primera.',
      'Hotel familiar ideal. Los niños se divirtieron mucho y los adultos pudimos relajarnos.',
      'Ubicación estratégica para conocer la ciudad. El personal nos ayudó con todas las recomendaciones.',
      'Limpieza impecable y atención personalizada. Sin duda regresaríamos en futuras visitas.',
      'Las habitaciones son amplias y bien equipadas. El wifi funciona perfecto para trabajo remoto.',
      'Ambiente acogedor y servicio profesional. El hotel superó nuestras expectativas.',
      'Instalaciones modernas y bien mantenidas. La piscina y el gimnasio están excelentes.',
      'Personal muy atento y servicial. Nos sentimos como en casa durante toda la estadía.',
      'Desayuno buffet con gran variedad. La terraza tiene una vista hermosa de la ciudad.',
      'Habitaciones confortables con aire acondicionado eficiente. Perfecto para el clima local.',
      'Excelente para viajes de negocios. Las salas de conferencias están bien equipadas.',
    ];

    const allReviews = [];
    
    // Create 2-5 reviews for each hotel
    for (const hotel of hotels) {
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews per hotel
      
      for (let i = 0; i < numReviews; i++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // Rating between 3.0 and 5.0
        
        // Generate random date within last 6 months
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
        
        allReviews.push({
          comment: randomComment,
          date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          rating: rating,
          isDeleted: false,
          hotel: hotel,
          customer: randomCustomer,
        });
      }
    }

    const createdReviews = await this.repository.save(allReviews);
    
    // Update hotel ratings based on reviews
    for (const hotel of hotels) {
      const hotelReviews = await this.reviewRepository.find({
        where: { hotel: { id: hotel.id }, isDeleted: false },
      });
      
      if (hotelReviews.length > 0) {
        const totalRating = hotelReviews.reduce((sum, review) => sum + review.rating, 0);
        hotel.rating = Math.round((totalRating / hotelReviews.length) * 10) / 10;
        await this.hotelRepository.save(hotel);
      }
    }
    
    await this.log(`Seeded ${createdReviews.length} review(s) and updated hotel ratings`);
  }

  async shouldRun(): Promise<boolean> {
    const count = await this.repository.count();
    return count === 0;
  }
}