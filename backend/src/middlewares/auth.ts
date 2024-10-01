import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class";
import { SwissmoteUser } from "../modals/User";

export const adminOnly = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query; //basically anything written after ?
      if (!id) {
        return next(new ErrorHandler("Please make sure you are logged in", 401));
      }

      const user = await SwissmoteUser.findById(id);
      if (!user) {
        return next(new ErrorHandler("Spam user detected", 401));
      }
      if (user.role !== "admin") {
        return next(
          new ErrorHandler("You are currently unauthorized to proceed", 403)
        );
      }
  
      next(); //proceeds with the next operation
    } catch (error) {
      console.log(error);
    }
  };