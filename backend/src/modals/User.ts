import mongoose, { Schema } from "mongoose";
import validator from "validator";

interface IUser extends Document {
  _id?: string | mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter ID"],
    },
    username: {
      type: String,
      unique: [true, "this username is already taken"],
      required: [true, "Please enter Name"],
    },
    email: {
      type: String,
      unique: [true, "this email already exists"],
      required: [true, "Please enter Email"],
      validate: validator.default.isEmail,
    },
    password: {
      type: String,
      required: [true, "Please enter Password"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const SwissmoteUser = mongoose.model<IUser>("SwissmoteUser", schema);
