import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

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

app.listen(3000, () => {
  console.log("Sever is listening at 3000");
});
