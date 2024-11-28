import mongoose, { Document, Schema } from "mongoose";

export interface UserModel extends Document {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  avatarImage: string;
  position: string;
  phoneNumber: string;
  status: "active" | "inactive" | "suspended" | "deactivated" | "archived";
  type: "admin" | "user" | "viewer" | "supplier";
  lastActive?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  bio: string;
  skills: string[];
  hobbies: string[];
  company: string;
  hireDate: string;
}

// User Schema
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    firstname: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    lastname: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    email: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 255,
    },
    phoneNumber: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 20,
    },
    avatarImage: {
      type: String,
    },
    position: {
      type: String,
      minLength: 1,
      maxLength: 50,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deactivated", "archived"],
      default: "active",
    },
    type: {
      type: String,
      enum: ["admin", "user", "viewer", "supplier"],
      default: "user",
    },
    lastActive: {
      type: Date,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String},
      country: { type: String },
    },
    bio: {
      type: String,
      maxLength: 500,
    },
    skills: {
      type: [String],
      default: [],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    company: {
      type: String
    },
    hireDate: {
      type: String, 
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  username: "text",
  firstname: "text",
  lastname: "text",
  email: "text",
});

export default mongoose.model<UserModel>("User", userSchema);
