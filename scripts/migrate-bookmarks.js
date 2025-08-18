// Migration script to add bookmarks field to existing videos
const { MongoClient } = require('mongodb');

async function migrateBookmarks() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/social_media';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const videosCollection = db.collection('videos');

    // Add bookmarks field to all videos that don't have it
    const result = await videosCollection.updateMany(
      { bookmarks: { $exists: false } },
      { $set: { bookmarks: [] } }
    );

    console.log(`Updated ${result.modifiedCount} videos with bookmarks field`);

    // Verify the update
    const totalVideos = await videosCollection.countDocuments();
    const videosWithBookmarks = await videosCollection.countDocuments({ bookmarks: { $exists: true } });
    
    console.log(`Total videos: ${totalVideos}`);
    console.log(`Videos with bookmarks field: ${videosWithBookmarks}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

migrateBookmarks();
