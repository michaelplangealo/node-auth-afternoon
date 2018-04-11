require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const strategy = require(`${__dirname}/strategy`);
const students = require("../students.json");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// login endpoint
app.get(
  `/login`,
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

// middleware for students endpoint
function authenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.get(`/students`, authenticated, (req, res, next) => {
  res.status(200).send(students);
});

// listening
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
