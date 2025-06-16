// import mongoose from "mongoose";

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }
//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };
//     cached.promise = mongoose
//       .connect(`${process.env.MONGODB_URI}/quickcart`, opts)
//       .then((mongoose) => {
//         return mongoose;
//       });
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default connectDB;
// config/db.js
import mongoose from "mongoose";
import Product from "@/models/Product";
import Variant from "@/models/Variants";
import Specification from "@/models/Specification";
import Category from "@/models/Category";
import Brand from "@/models/Brand";
import Attribute from "@/models/Attribute";
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/quickcart`) // Loại bỏ opts nếu không cần
      .then((mongoose) => {
        console.log("MongoDB connected successfully via connectDB");
        return mongoose;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
