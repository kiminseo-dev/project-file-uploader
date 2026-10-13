import { Router } from "express";
const indexRouter = Router();
import * as indexController from "../controllers/indexController.js";

// home page
indexRouter.get("/", indexController.getHomePage);

// sign up page
indexRouter.get(
  "/sign-up",
  indexController.notAuthenticated,
  indexController.getSignUpPage,
);
indexRouter.post(
  "/sign-up",
  indexController.notAuthenticated,
  indexController.createUser,
);

// logging in
indexRouter.get(
  "/log-in",
  indexController.notAuthenticated,
  indexController.getLoginPage,
);
indexRouter.post(
  "/log-in",
  indexController.notAuthenticated,
  indexController.authenticateUser,
);

// logging out
indexRouter.post("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.redirect("/");
  });
});

export { indexRouter };
