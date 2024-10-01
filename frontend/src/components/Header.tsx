import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLogIn } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { userNotExist } from "../redux/reducers/userReducer";
import { userReducerInitialState } from "../types/reducerTypes";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const handleLoginClick = () => {
    navigate("/");
  };

  const logOutHandler = async () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      await signOut(auth);
      dispatch(userNotExist());
      toast.success("Logged Out Successfully!");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <nav className={`header ${visible ? "visible" : ""}`}>
      <div className="title">Task Management System</div>
      <div className="greeting">
        {user && <span>Welcome, {user.username}!</span>}
      </div>
      <div className="options">
        <Link to={"/tasks"}>Tasks</Link>
      </div>
      <div className="big-screen-profile-icon">
        {!user && (
          <FiLogIn
            onClick={handleLoginClick}
            style={{
              width: "30px",
              height: "50px",
              color: "white",
              marginTop: "6.5px",
            }}
          />
        )}
      </div>
      {user && (
        <Link to={""}>
          <button disabled={!user} onClick={logOutHandler} className="logout">
            Log Out
          </button>
        </Link>
      )}
    </nav>
  );
};

export default Header;
