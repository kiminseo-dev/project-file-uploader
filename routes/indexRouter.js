import { Router } from "express";
const indexRouter = Router();
import * as indexController from "../controllers/indexController.js"

indexRouter.get("/", indexController.getHomePage);

indexRouter.get("/sign-up", indexController.getSignUpPage);
indexRouter.post("/sign-up", indexController.createUser);

export { indexRouter }