/**
 * Test script to verify seeder functionality
 * This file can be used to test individual seeders during development
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeder.service';

async function testSeeders() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeederService);

  try {
    console.log('🧪 Testing seeder functionality...');
    
    // Test running all seeders
    await seederService.runSeeders();
    
    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

// Uncomment to run this test
// testSeeders();

export { testSeeders };