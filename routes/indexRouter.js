import { Router } from "express";
const indexRouter = Router();
import * as indexController from "../controllers/indexController.js"

indexRouter.get("/", indexController.getHomePage);

indexRouter.get("/sign-up", indexController.getSignUpPage);
indexRouter.post("/sign-up", indexController.createUser);

indexRouter.get("/log-in", indexController.getLoginPage);
indexRouter.post("/log-in", indexController.authenticateUser);

indexRouter.post("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.redirect("/");
  });
});

export { indexRouter }