import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/utility-class";
import { SwissmoteUser } from "../modals/User";
import { SwissmoteTask } from "../modals/Task";
const { parse } = require("json2csv");
import mongoose from "mongoose";

export const newTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, duedate, status, assignedUser, priority } =
      req.body;

    if (!title || !description || !duedate) {
      return next(new ErrorHandler("Please fill in all required fields", 400));
    }

    const task = new SwissmoteTask({
      title,
      description,
      duedate,
      status,
      assignedUser,
      priority,
    });

    await task.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = req.params.id;
    const { title, description, duedate, status, assignedUser, priority } =
      req.body;

    const updatedTask = await SwissmoteTask.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        duedate,
        status,
        assignedUser,
        priority,
      },
      { new: true }
    );

    if (!updatedTask) {
      return next(new ErrorHandler("Task not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await SwissmoteTask.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return next(new ErrorHandler("Task not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = req.params.id;

    const task = await SwissmoteTask.findById(taskId);
    if (!task) {
      return next(new ErrorHandler("Task not found", 404));
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getTasksByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignedUser = req.params.id;
    const { page = 1, priority, status, title } = req.query;
    const limit = 8;
    const skip = (Number(page) - 1) * limit;

    let filter: any = { assignedUser };

    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (title) filter.title = { $regex: title, $options: "i" };

    const totalTasks = await SwissmoteTask.countDocuments(filter);

    const myTasks = await SwissmoteTask.find(filter).skip(skip).limit(limit);

    const totalPages = Math.ceil(totalTasks / limit);

    return res.status(200).json({
      success: true,
      page: Number(page),
      totalPages,
      limit,
      totalTasks,
      myTasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export const newTaskByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, duedate, status, assignedUser, priority } =
      req.body;

    if (!title || !description || !duedate) {
      return next(new ErrorHandler("Please fill in all required fields", 400));
    }

    const idAssignedUser = await SwissmoteUser.findOne({
      username: assignedUser,
    });
    if (!idAssignedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const task = new SwissmoteTask({
      title,
      description,
      duedate,
      status,
      assignedUser: idAssignedUser?._id,
      priority,
    });

    await task.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const { status, priority, assignedUser, title } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedUser) {
      query.assignedUser = assignedUser;
    }

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    const allTasks = await SwissmoteTask.find(query).skip(skip).limit(limit);

    const totalTasks = await SwissmoteTask.countDocuments(query);

    return res.status(200).json({
      success: true,
      allTasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

export const taskSummaries = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, userId ,priority } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (userId) query.assignedUser = userId;
    if (priority) query.priority = priority;

    const tasks = await SwissmoteTask.find(query);
    const csv = parse(tasks);
    res.header("Content-Type", "text/csv");
    res.attachment("tasks-report.csv");
    res.send(csv);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Error generating report" });
  }
};
