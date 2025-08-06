import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixMuseumIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get the museums collection
    const db = mongoose.connection.db;
    const museumsCollection = db.collection('museums');

    // List all indexes
    const indexes = await museumsCollection.indexes();
    console.log('Current indexes:', indexes);

    // Find the problematic index
    const problematicIndex = indexes.find(index => 
      index.key && 
      index.key.internalID === 1 && 
      index.key.slug === 1
    );

    if (problematicIndex) {
      console.log('Found problematic index:', problematicIndex.name);
      
      // Drop the problematic index
      await museumsCollection.dropIndex(problematicIndex.name);
      console.log('Dropped problematic index:', problematicIndex.name);
    } else {
      console.log('No problematic index found');
    }

    // Create new indexes if needed
    try {
      await museumsCollection.createIndex({ internalID: 1 }, { unique: true, sparse: true });
      console.log('Created internalID index');
    } catch (error) {
      console.log('internalID index already exists or error:', error.message);
    }

    try {
      await museumsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('Created slug index');
    } catch (error) {
      console.log('slug index already exists or error:', error.message);
    }

    console.log('Museum index fix completed');
  } catch (error) {
    console.error('Error fixing museum index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixMuseumIndex(); 