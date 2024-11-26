var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var booksRouter = require("./routes/books");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/static", express.static("public")); //set up static middleware

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/books", booksRouter);

const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "library.db",
});

// sync databse w/ async IIFE or Immediately Invoked Function Expression
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection established successfully");
    await sequelize.sync();
    console.log("Connection to the database successful!");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
})();

// create new error()
app.use(function (req, res, next) {
  const error = new Error("Uh-oh looks like this page is not found"); //will render using page-not-found.pug and render onto page
  error.status = 404;
  next(error);
});

//global error handler
app.use(function (error, req, res, next) {
  res.status(error.status || 500); //default to 500 if no status
  if (error.status === 404) {
    res.render("page-not-found", {
      //will render page-not-found.pug
      message: error.message, //locals which should be found inside the page-not-found.pug
      status: error.status,
    });
  } else {
    res.render("error", {
      message: error.message, //locals which should be found inside the error.pug
      status: error.status,
    });
  }
  next(error);
});
module.exports = app;
