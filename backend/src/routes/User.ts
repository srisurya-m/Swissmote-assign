import express from "express";
import {
  getAllUsernames,
  getAllUsers,
  getUser,
  getUserByUsername,
  newUser,
} from "../controllers/User";
import { adminOnly } from "../middlewares/auth";

const app = express.Router();

app.post("/new", newUser); // /api/v1/user/new
app.get("/all-usernames", getAllUsernames); // /api/v1/user/all-usernames
app.get("/all", adminOnly, getAllUsers); // /api/v1/user/all
app.post("/get-by-username", getUserByUsername); // /api/v1/user/all
app.get("/:id", getUser); // /api/v1/user/all

export default app;
