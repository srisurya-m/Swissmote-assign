import { FC, useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Task } from "../types/types";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import axios from "axios";
import toast from "react-hot-toast";

interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onDelete?: () => void;
}

const TaskCard: FC<TaskCardProps> = ({ task, onComplete, onDelete }) => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );

  const [username, setUsername] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleUpdate = (taskId: string) => {
    navigate(`/update-task/${taskId}`);
  };

  useEffect(() => {
    const fetchUsername = async () => {
      if (task.assignedUser) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER}/api/v1/user/${task.assignedUser}`
          );
          setUsername(response.data.user.username);
        } catch (err) {
          toast.error("Failed to fetch the username");
        }
      } else {
        setUsername("Unassigned");
      }
    };

    fetchUsername();
  }, [task.assignedUser]);

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <p>Due: {new Date(task.duedate).toLocaleDateString()}</p>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>

      {user?.role === "admin" && (
        <p>Assigned User: {username || "Unassigned"}</p>
      )}

      <div className="task-actions">
        {task.status === "toDo" && (
          <button onClick={onComplete} className="icon complete-icon">
            Start Doing
          </button>
        )}
        {task.status === "inProgress" && (
          <button onClick={onComplete} className="icon complete-icon">
            Mark as Complete
          </button>
        )}

        <FaEdit
          title="Edit Task"
          onClick={() => handleUpdate(task._id)}
          className="icon update-icon"
        />

        <FaTrashAlt
          title="Delete Task"
          onClick={onDelete}
          className="icon delete-icon"
        />
      </div>
    </div>
  );
};

export default TaskCard;
