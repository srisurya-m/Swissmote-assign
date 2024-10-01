import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { SwissmoteUser } from "../modals/User";
import ErrorHandler from "../utils/utility-class";

export const newUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, _id } = req.body;
    let user = await SwissmoteUser.findOne({ email });

    if (user) {
      if (user.username !== username) {
        return res.status(200).json({
          success: false,
          message:
            "Invalid credentials or maybe you used a different method to sign in",
        });
      }

      const data = {
        user: {
          username: user.username,
          _id: user._id,
          role: user.role,
          email: user.email,
        },
      };
      const token = jwt.sign(data, process.env.JWT_SECRET!);

      return res.status(200).json({
        success: true,
        message: `Welcome ${user.username}`,
        user,
        token,
      });
    }

    if (!username || !email || !password) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await SwissmoteUser.create({
      username,
      email,
      password: hashedPassword,
      _id: _id || new mongoose.Types.ObjectId(),
    });

    const data = {
      user: {
        username: user.username,
        _id: user._id,
        role: user.role,
        email: user.email,
      },
    };
    const token = jwt.sign(data, process.env.JWT_SECRET!);
    return res.status(201).json({
      success: true,
      message: `Welcome ${user.username}`,
      user,
      token,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await SwissmoteUser.find({});
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await SwissmoteUser.findById(id);
    if (!user) return next(new ErrorHandler("Invalid Id", 400));
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsernames = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let usernames;
  usernames = await SwissmoteUser.distinct("username");
  return res.status(200).json({
    success: true,
    usernames,
  });
};

export const getUserByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username } = req.body;
  const user = await SwissmoteUser.findOne({ username });
  return res.status(200).json({
    success: true,
    user,
  });
};
