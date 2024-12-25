import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1); // Exit process with failure
  }

  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
  });
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

export default connectDB;
