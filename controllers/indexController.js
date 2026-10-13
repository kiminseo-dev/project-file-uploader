import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import passport from "passport";

// get home page
export function getHomePage(req, res) {
  res.render("index", { user: req.user });
}

export function notAuthenticated(req, res, next) {
  // user cant be logged int
  if (req.isAuthenticated()) {
    return res.status(403).send("Must log out first");
  }

  next();
}

// get sign up page
export function getSignUpPage(req, res) {
  res.render("sign-up");
}

// creating a user
export async function createUser(req, res) {
  try {
    const user = req.body;
    // hashing password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // adding user to db
    await prisma.user.create({
      data: {
        name: user.name,
        username: user.username,
        password: hashedPassword,
      },
    });

    console.log(await prisma.user.findMany());

    res.redirect("/");
  } catch (err) {
    console.error(err);
    // server error
    //Todo: add proper error handling
    res.status(500).send("Something went wrong");
  }
}

// get log in page
export function getLoginPage(req, res) {
  res.render("log-in");
}

// authenticate user
export function authenticateUser(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })(req, res, next);
}
