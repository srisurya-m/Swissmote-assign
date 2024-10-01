import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { connectDB } from "./utils/features";

//importing routes
import userRoute from "./routes/User";
import taskRoute from "./routes/Task";

config({
  path: "./.env",
});

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

connectDB(process.env.MONGO_URI as string);

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/task", taskRoute);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
