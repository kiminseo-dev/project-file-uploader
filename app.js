import express from "express";
import { prisma } from "./lib/prisma.js";
// Creates and manages user sessions
import session from "express-session";
// Manages authentication, checking who the user is and remembering them
import passport from "passport";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import "dotenv/config";

const PORT = process.env.PORT || 3000;

const app = express();
import { indexRouter } from "./routes/indexRouter.js";

app.use(express.json()); // body convert to json
app.use(express.urlencoded({ extended: true })); // allows extended data

app.set("view engine", "ejs");

//* this uses dependency "express-session"
//* session() is the middleware used with app.use()
// the object are configurations 
app.use(
  session({
    //* PrismaSessionStore dependency used here
    //? Lets express-session store session records in your database using Prisma.
    // store tells where you should save the session data
    // new session store that uses Prisma to interact with db
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // every 2 minutes check for expired sessions and cleans it up
      dbRecordIdIsSessionId: true, // db id is sid
    }),

    // sign the sid
    secret: process.env.SESSION_SECRET,

    // avoids saving unchanged sessions
    resave: false,
    
    // avoids saving new sessions that haven't been modified
    saveUninitialized: false,
  }),
);

//* this part uses dependency "passport"
app.use(passport.initialize()); // sets up passport functions
app.use(passport.session()); // remembers who is logged in from the different requests

//* LocalStrategy is used here
// provides the way to authenticate a user with username and password 
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // no need for .rows[0] it findUnique returns object or null
      const user = await prisma.user.findUnique({
        // because usernames are unique
        where: {
          // WHERE ...
          username: username,
        },
      });

      // if user does not exist (no error, no user, message)
      if (!user) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      //compare typed in password (password) to stored password (user.password)
      const match = await bcrypt.compare(password, user.password);

      // if incorrect password (no error, no user, message)
      if (!match) {
        return done(null, false, { message: "Incorrect username or password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

//* passport is used
// user -> user id
// user logs in -> user id is saved in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// user request -> cookie sent -> connect.sid -> user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    done(null, user);
  } catch (err) {
    return done(err);
  }
});

app.use("/", indexRouter);

app.listen(PORT, () => {
  console.log("app is on", `http://localhost:${PORT}/`);
});
