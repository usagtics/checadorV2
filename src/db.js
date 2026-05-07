import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

export const connectDB = async () => {
  try {
    const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/checadorDB_test';
    
    await mongoose.connect(URI);
    
    console.log("==========================================");
    console.log(`>>> DB CONECTADA A: ${URI}`);
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Error de conexión a la BD:", error);
  }
};