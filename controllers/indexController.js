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
    // hashing password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // adding user to db
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        // adding default root folder
        folders: {
          create: {
            name: "Home",
            isRoot: true,
          }
        }
      },
    });

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
