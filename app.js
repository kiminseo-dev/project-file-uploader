import express from "express";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;

const app = express();
import { indexRouter } from "./routes/indexRouter.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use("/", indexRouter);

app.listen(PORT, () => {
  console.log("app is on", "http://localhost:3000/");
});
