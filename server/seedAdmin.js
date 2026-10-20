import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding");

    const adminExists = await User.findOne({ email: "admin@company.com" });

    if (adminExists) {
      console.log("Admin user already exists. Email: admin@company.com");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new User({
      name: "System Admin",
      email: "admin@company.com",
      password: hashedPassword,
      role: "admin"
    });

    await adminUser.save();
    console.log("Admin user successfully created!");
    console.log("Email: admin@company.com");
    console.log("Password: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();
