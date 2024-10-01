import express from "express";
import {
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByUser,
  newTask,
  newTaskByAdmin,
  taskSummaries,
  updateTask,
} from "../controllers/Task";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

app.post("/new", newTask); // /api/v1/task/new
app.post("/new-task-admin", adminOnly, newTaskByAdmin); // /api/v1/task/new-task-admin
app.get("/all", adminOnly, getAllTasks); // /api/v1/task/all
app.get("/mytask/:id", getTasksByUser); // /api/v1/task/mytask/:id
app.put("/update/:id", updateTask); // /api/v1/task/update/:id
app.delete("/delete/:id", deleteTask); // /api/v1/task/delete/:id
app.get("/task-summaries", taskSummaries); // /api/v1/task/task-summaries
app.get("/:id", getTaskById); // /api/v1/task/:id

export default app;
