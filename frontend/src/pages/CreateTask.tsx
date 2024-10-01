import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duedate, setDuedate] = useState("");
  const [status, setStatus] = useState("toDo");
  const [priority, setPriority] = useState("low");
  const [assignedUser, setAssignedUser] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsernames = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/user/all-usernames`
      );
      setUsernames(response.data.usernames);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch usernames");
    }
  };

  const fetchUserIdByUsername = async (name: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/user/get-by-username`,
        { username: name }
      );
      console.log(response.data.user._id);
      setAssignedUserId(response.data.user._id);
    } catch (err) {
      toast.error("Failed to fetch user ID");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !duedate) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const newTask = {
        title,
        description,
        duedate: new Date(duedate).toISOString(),
        status,
        priority,
        assignedUser: user?.role === "user" ? user._id : assignedUserId,
      };

      await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/task/new`,
        newTask
      );
      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      setDuedate("");
      setPriority("low");
      setStatus("toDo");
      setAssignedUser("");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to create the task");
    }
  };

  useEffect(() => {
    if (assignedUser) {
      fetchUserIdByUsername(assignedUser);
    }
  }, [assignedUser]);

  useEffect(() => {
    if (user?.role == "admin") fetchUsernames();
  }, []);

  return (
    <div className="create-task-page">
      <h1>Create New Task</h1>
      <form onSubmit={handleSubmit} className="create-task-form">
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
            {loading ? (
              <select id="assignedUser" disabled>
                <option>Loading...</option>
              </select>
            ) : (
              <select
                id="assignedUser"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
              >
                <option value="">Select a user</option>
                {usernames.map((username, index) => (
                  <option key={index} value={username}>
                    {username}
                  </option>
                ))}
              </select>
            )}
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

        <button type="submit">Create Task</button>
      </form>
    </div>
  );
};

export default CreateTask;
