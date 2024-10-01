import mongoose from "mongoose";
import { SwissmoteUser } from "./User";

// Title
// Description
// Due Date
// Status (To Do, In Progress, Completed)
// Assigned User
// Priority (Low, Medium, High)

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter Title"],
    },
    description: {
      type: String,
      required: [true, "Please add Descrition"],
    },
    duedate: {
      type: Date,
      required: [true, "Please add Due Date"],
    },
    status: {
      type: String,
      enum: ["toDo", "inProgress", "completed"],
      default: "toDo",
    },
    assignedUser: {
      type: String,
      ref: "SwissmoteUser",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
  },
  {
    timestamps: true,
  }
);

export const SwissmoteTask = mongoose.model("SwissmoteTask", schema);
