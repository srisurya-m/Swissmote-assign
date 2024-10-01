import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import TaskCard from "../components/TaskCard";
import { Task } from "../types/types";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [username, setUsername] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserIdByUsername = async (name: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER}/api/v1/user/get-by-username`,
        { username: name }
      );
      console.log(response.data.user._id);
      setAssignedUserId(response.data.user._id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch user ID");
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/task/mytask/${user?._id}`,
        {
          params: {
            page,
            priority,
            status,
            title: search,
          },
        }
      );
      setTasks(response.data.myTasks);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch the tasks");
    }
  };

  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/task/all?id=${user?._id}`,
        {
          params: {
            page,
            priority,
            status,
            title: search,
            ...(username && { assignedUser: assignedUserId }),
          },
        }
      );
      setTasks(response.data.allTasks);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("Failed to fetch the tasks");
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
    if (user?.role === "admin") {
      fetchUsernames();

      if (username) {
        if (assignedUserId) {
          fetchAllTasks();
        } else {
          fetchUserIdByUsername(username);
        }
      } else {
        fetchAllTasks();
      }
    } else {
      fetchTasks();
    }
  }, [page, priority, status, search, assignedUserId, username]);

  useEffect(() => {
    if (username) {
      fetchUserIdByUsername(username);
    } else {
      setAssignedUserId("");
    }
  }, [username]);

  const completeTaskHandler = async (taskId: string, status: string) => {
    try {
      if (status === "toDo") {
        await axios.put(
          `${import.meta.env.VITE_SERVER}/api/v1/task/update/${taskId}`,
          { status: "inProgress" }
        );
        toast.success("Task marked as in progress");
        if (user?.role == "admin") {
          fetchAllTasks();
        } else {
          fetchTasks();
        }
      } else if (status === "inProgress") {
        await axios.put(
          `${import.meta.env.VITE_SERVER}/api/v1/task/update/${taskId}`,
          { status: "completed" }
        );
        toast.success("Task marked as complete");
        if (user?.role == "admin") {
          fetchAllTasks();
        } else {
          fetchTasks();
        }
      }
    } catch (err) {
      toast.error("Failed to mark task as complete");
    }
  };

  const deleteTaskHandler = async (taskId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER}/api/v1/task/delete/${taskId}`
      );
      toast.success("Task deleted successfully");
      if (user?.role == "admin") {
        fetchAllTasks();
      } else {
        fetchTasks();
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const downloadCSVReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER}/api/v1/task/task-summaries`,
        {
          params: {
            status,
            userId: assignedUserId, 
            priority,
          },
          responseType: "blob", 
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tasks-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setLoading(false);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      setLoading(false);
      toast.error("Error downloading the report");
    }
  };

  const isNextPage = page < totalPages;
  const isPrevPage = page > 1;

  const isFiltersSelected = priority || status || username;

  return (
    <div className="task-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Priority</h4>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <h4>Status</h4>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="toDo">To Do</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {user?.role === "admin" && (
          <div>
            <h4>Assigned Users</h4>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            >
              <option value="">All</option>
              {!loading &&
                usernames?.map((u, index) => (
                  <option key={index} value={u}>
                    {u}
                  </option>
                ))}
            </select>
          </div>
        )}
        <button 
          onClick={downloadCSVReport} 
          disabled={!isFiltersSelected}
        >
          Download CSV Report
        </button>
      </aside>

      <main>
        <div className="task-header">
          <h1>Tasks</h1>
          <FaPlus
            className="create-task-icon"
            title="Create Task"
            onClick={() => navigate("/create-task")}
          />
        </div>

        <input
          type="text"
          placeholder="Search by Title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <Loader />
        ) : (
          <div className="task-list">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={() => completeTaskHandler(task._id, task.status)}
                  onDelete={() => deleteTaskHandler(task._id)}
                />
              ))
            ) : (
              <p>No tasks found</p>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              {page} of {totalPages}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
};

export default Tasks;
