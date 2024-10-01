import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { userReducerInitialState, UserResponse } from "./types/reducerTypes";
import { userExist, userNotExist } from "./redux/reducers/userReducer";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { auth } from "./firebase";
import { jwtDecode } from "jwt-decode";
import { DecodedJwtPayload } from "./types/types";
import ProtectedRoute from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import CreateTask from "./pages/CreateTask";
import UpdateTask from "./pages/UpdateTask";
import PageNotFound from "./pages/PageNotFound";

//lazy loading
const Home = lazy(() => import("./pages/Home"));

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  useEffect(() => {
    const checkAuthState = async () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("user");

      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedJwtPayload>(token);
          const localUser = decodedToken.user;

          if (localUser) {
            dispatch(userExist(localUser));
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("authToken");
        }
      } else if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          dispatch(userExist(parsedUser));
        } catch (error) {
          console.error("Error parsing local user:", error);
          localStorage.removeItem("user");
        }
      } else {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const { data }: { data: UserResponse } = await axios.get(
                `${import.meta.env.VITE_SERVER}/api/v1/user/${user.uid}`
              );

              dispatch(userExist(data.user));
              localStorage.setItem("user", JSON.stringify(data.user));
            } catch (error) {
              console.error("Error fetching user:", error);
              dispatch(userNotExist());
              localStorage.removeItem("user");
            }
          } else {
            dispatch(userNotExist());
            localStorage.removeItem("user");
          }
        });
      }
    };

    checkAuthState();
  }, [dispatch]);

  return (
    <>
      <Router>
        <Header />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={user ? false : true}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute
                  isAuthenticated={user ? true : false}
                  redirect="/"
                >
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-task"
              element={
                <ProtectedRoute
                  isAuthenticated={user ? true : false}
                  redirect="/"
                >
                  <CreateTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-task/:taskId"
              element={
                <ProtectedRoute
                  isAuthenticated={user ? true : false}
                  redirect="/"
                >
                  <UpdateTask />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PageNotFound/>}/>
          </Routes>
          <Toaster position="top-center" />
        </Suspense>
      </Router>
    </>
  );
}

export default App;
