import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import toast from "react-hot-toast";

const UpdateTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duedate, setDuedate] = useState("");
  const [status, setStatus] = useState("toDo");
  const [priority, setPriority] = useState("low");
  const [assignedUser, setAssignedUser] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/task/${taskId}`
      );
      const task = response.data.task;
      setTitle(task.title);
      setDescription(task.description);
      setDuedate(new Date(task.duedate).toISOString().split("T")[0]);
      setStatus(task.status);
      setPriority(task.priority);
      setAssignedUser(task.assignedUser!._id);
    } catch (error) {
      toast.error("Failed to load task details");
    }
  };

  const fetchUserIdByUsername = async (name: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/user/get-by-username`,
        { username: name }
      );
      setAssignedUserId(response.data.user._id);
    } catch (err) {
      toast.error("Failed to fetch user ID");
    }
  };

  const fetchUsernames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/user/all-usernames`
      );
      setUsernames(response.data.usernames);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch the usernames");
    }
  };

  useEffect(() => {
    fetchTaskDetails();
    if (user?.role === "admin") {
      fetchUsernames();
    }
  }, []);

  useEffect(() => {
    if (assignedUser) {
      fetchUserIdByUsername(assignedUser);
    }
  }, [assignedUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !duedate) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const updatedTask = {
        title,
        description,
        duedate,
        status,
        priority,
        assignedUser: user!.role === "user" ? user?._id : assignedUserId,
      };

      await axios.put(
        `${import.meta.env.VITE_SERVER}/api/v1/task/update/${taskId}`,
        updatedTask
      );
      toast.success("Task updated successfully");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to update the task");
    }
  };

  return (
    <div className="update-task-page">
      <h1>Update Task</h1>
      <form onSubmit={handleSubmit} className="update-task-form">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label htmlFor="duedate">Due Date *</label>
        <input
          type="date"
          id="duedate"
          value={duedate}
          onChange={(e) => setDuedate(e.target.value)}
          required
        />

        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="toDo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {user?.role === "admin" && (
          <>
            <label htmlFor="assignedUser">Assign to</label>
            <select
              id="assignedUser"
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a user</option>
              {!loading &&
                usernames.map((u, index) => (
                  <option key={index} value={u}>
                    {u}
                  </option>
                ))}
            </select>
          </>
        )}

        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit">Update Task</button>
      </form>
    </div>
  );
};

export default UpdateTask;
