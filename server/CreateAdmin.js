import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

mongoose.connect("mongodb://127.0.0.1:27017/offfly");

const createAdmin = async () => {

    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = new User({
        name: "Admin",
        email: "admin@offfly.com",
        password: hashedPassword,
        role: "admin"
    });

    await admin.save();

    console.log("Admin Created ✅");

    process.exit();
};

createAdmin();