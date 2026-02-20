import mongoose from 'mongoose';


const connectDB = async () => {
  try {
   
    const conn = await mongoose.connect(process.env.MONGO_URI, {
     
    });

    // if successful, log the host
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(` MongoDB Connection Error: ${err.message}`);
    process.exit(1); // exit the process if connection fails
  }
};

export default connectDB;
