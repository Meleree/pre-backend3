import mongoose from 'mongoose';

export default async function connectDB() {
  try {
    // Usar MONGODB_URI como variable estándar, y si no existe usar la local
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/Melere";
    console.log("📌 Conectando a MongoDB con URI:", mongoUri);

    await mongoose.connect(mongoUri, {
      dbName: 'Melere',
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}