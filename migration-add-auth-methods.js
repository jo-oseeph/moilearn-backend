import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';

/**
 * Migration Script: Add authMethods to existing users
 * 
 * Run this ONCE after deploying the new User model
 * Usage: node migration-add-auth-methods.js
 */

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users without authMethods field
    const usersToUpdate = await User.find({
      $or: [
        { authMethods: { $exists: false } },
        { authMethods: { $size: 0 } }
      ]
    });

    console.log(`📊 Found ${usersToUpdate.length} users to migrate`);

    let updatedCount = 0;

    for (const user of usersToUpdate) {
      // Determine auth method based on existing data
      const authMethods = [];

      // If user has a password, they use email auth
      if (user.password) {
        authMethods.push('email');
      }

      // If user has old 'provider' field set to 'google' or has googleId
      if (user.provider === 'google' || user.googleId) {
        authMethods.push('google');
      }

      // Default to email if no method detected
      if (authMethods.length === 0) {
        authMethods.push('email');
      }

      // Update user
      user.authMethods = authMethods;
      await user.save();
      updatedCount++;

      console.log(`✅ Updated user: ${user.email} → authMethods: [${authMethods.join(', ')}]`);
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} users.`);
    
    // Show summary
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$authMethods',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 User Auth Methods Distribution:');
    stats.forEach(stat => {
      console.log(`   ${stat._id.join(' + ')}: ${stat.count} users`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run migration
migrateUsers();