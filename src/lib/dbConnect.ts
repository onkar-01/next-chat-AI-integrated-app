import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Using existing connection");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI as string || '', {});
    connection.isConnected = db.connections[0].readyState;

    console.log("New db connection created Successfully");
  } catch (err) {
    console.error("Error connecting to database", err);
    process.exit(1);
  }
}

export default dbConnect;
