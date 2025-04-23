// scripts/migrate.ts
import { runMigrations } from '@/lib/db';
import { UserRepository } from '@/lib/repositories/userRepository';

async function seed() {
  const userRepo = new UserRepository();
  
  try {
    // Run migrations first
    await runMigrations();
    console.log('Migrations completed');
    
    // Create test users
    const johnId = await userRepo.createUser('John Doe', '0612345678', 'john.doe@example.com'); // Added third argument
    console.log(`Created user John Doe with ID: ${johnId}`);
    
    const janeId = await userRepo.createUser('Jane Smith', '0698765432', 'jane.smith@example.com'); // Added third argument
    console.log(`Created user Jane Smith with ID: ${janeId}`);
    
    // Add orders for John
    await userRepo.addOrder(johnId, 'Unlimited 5G', 'Active', 'Active', new Date('2025-04-01'), new Date('2026-04-01'));
    await userRepo.addOrder(johnId, 'Basic 4G', 'Expired', 'Expired', new Date('2023-04-01'), new Date('2024-04-01'));
    
    // Add orders for Jane
    await userRepo.addOrder(janeId, 'Premium 5G', 'Pending', 'Pending', new Date('2025-05-01'));
    
    // Add incidents for John
    await userRepo.addIncident(johnId, 'No network coverage in Amsterdam', 'Resolved');
    await userRepo.addIncident(johnId, 'Overcharged on last bill', 'Pending');
    await userRepo.addIncident(johnId, 'SIM card not delivered', 'Open');
    
    // Add incidents for Jane
    await userRepo.addIncident(janeId, 'Slow internet speed at home', 'Open');
    await userRepo.addIncident(janeId, 'Unable to make international calls', 'Open');
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during migration/seeding:', error);
  }
}

// Run the migration and seeding
seed().catch(console.error);