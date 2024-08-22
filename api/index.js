import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to Mongodb successfully`);
  })
  .catch((err) => {
    console.log(`Some error occured connecting to Mongodb`, err);
    console.log(err);
  });
const app = express();

app.use(express.json()); //used to stringify the json data

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.listen(3000, () => {
  console.log("Sever is listening at 3000");
});
