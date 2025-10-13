const database = require('./database');

class DatabaseInitializer {
  static async initializeIndexes() {
    try {
      console.log('Initializing database indexes...');

      // Users collection indexes
      await database.createIndex('users', { email: 1 }, { unique: true });
      await database.createIndex('users', { userType: 1 });
      await database.createIndex('users', { isActive: 1 });
      await database.createIndex('users', { 'therapistProfile.specializations': 1 });
      await database.createIndex('users', { 'therapistProfile.rating': -1 });
      await database.createIndex('users', { 'therapistProfile.consultationFee': 1 });
      await database.createIndex('users', { 'therapistProfile.isApproved': 1 });

  // New therapists collection (separate from users) indexes
  await database.createIndex('therapists', { userId: 1 }, { unique: true });
  await database.createIndex('therapists', { specializations: 1 });
  await database.createIndex('therapists', { rating: -1 });
  await database.createIndex('therapists', { consultationFee: 1 });
  await database.createIndex('therapists', { isApproved: 1 });

      // Bookings collection indexes
      await database.createIndex('bookings', { userId: 1 });
      await database.createIndex('bookings', { therapistId: 1 });
      await database.createIndex('bookings', { status: 1 });
      await database.createIndex('bookings', { appointmentDate: 1 });
  // For reminder lookups (24h window on date and flag)
  await database.createIndex('bookings', { appointmentDate: 1, reminder24hSent: 1, status: 1 });
      await database.createIndex('bookings', { 
        therapistId: 1, 
        appointmentDate: 1, 
        appointmentTime: 1 
      });
      await database.createIndex('bookings', { createdAt: -1 });

      // Reviews collection indexes
      await database.createIndex('reviews', { therapistId: 1 });
      await database.createIndex('reviews', { userId: 1 });
      await database.createIndex('reviews', { bookingId: 1 }, { unique: true });
      await database.createIndex('reviews', { createdAt: -1 });

      // Compound indexes for complex queries
      await database.createIndex('users', {
        userType: 1,
        isActive: 1,
        'therapistProfile.isApproved': 1
      });

      await database.createIndex('bookings', {
        therapistId: 1,
        status: 1,
        appointmentDate: 1
      });

      console.log('Database indexes initialized successfully');
    } catch (error) {
      console.error('Error initializing database indexes:', error);
      throw error;
    }
  }

  static async seedData() {
    try {
      console.log('Seeding initial data...');

      // Check if admin user exists
      const adminExists = await database.findOne('users', {
        email: 'admin@therabook.com'
      });

      if (!adminExists) {
        const AuthUtils = require('./auth');
        const hashedPassword = await AuthUtils.hashPassword('Admin123!');

        const adminUser = {
          name: 'System Administrator',
          email: 'admin@therabook.com',
          password: hashedPassword,
          userType: 'admin',
          phone: '+1234567890',
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await database.insertOne('users', adminUser);
        console.log('Admin user created successfully');
      }

      console.log('Initial data seeded successfully');
    } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
    }
  }

  static async initialize() {
    try {
      await this.initializeIndexes();
      await this.seedData();
      console.log('Database initialization completed');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}

module.exports = DatabaseInitializer;
