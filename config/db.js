// import mongoose library
import mongoose from 'mongoose';

// declare an async function to connect to DB
const connectDB = async () => {
  try {
    // use mongoose to connect using MONGO_URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // if successful, log the host
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(` MongoDB Connection Error: ${err.message}`);
    process.exit(1); // exit the process if connection fails
  }
};

// export the function as default so it can be imported elsewhere
export default connectDB;
