import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import passport from "passport";

export function getHomePage(req, res) {
  console.log(req.user);
  res.render("index", { user: req.user });
}

export function getSignUpPage(req, res) {
  if (req.user) {
    return res.status(403).send("Log out first");
  }

  res.render("sign-up");
}

export async function createUser(req, res) {
  if (req.user) {
    return res.status(403).send("Log out first");
  }

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
    res.status(500).send("Something went wrong");
  }
}

export function getLoginPage(req, res) {
  if (req.user) {
    return res.status(403).send("Log out first");
  }
  res.render("log-in");
}

export function authenticateUser(req, res, next) {
  if (req.user) {
    return res.status(403).send("Log out first");
  }
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  })(req, res, next);
}
