const express = require("express");
const router = express.Router();
const Book = require("../models").Book;

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
      //res.status(500).send(error);
    }
  };
}

//1.Home Route: get / - Should redirect to the /books route
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] }); //findAll takes in an options object //the array createdat and desc will organize books in desired order
    res.render("index", {
      books: books,
      title: "BOOKS LIST!",
    });
  })
);

//2. Books Route
router.get(
  "/books",
  asyncHandler(async (req, res) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] }); //findAll takes in an options object //the array createdat and desc will organize books in desired order
    res.render("books/index", {
      books: books,
      title: "BOOKS LIST!",
    });
  })
);

//3. New Book Route
router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      //if book exists render to books/show else show 404 status
      res.render("books/show", { book: book, title: book.title });
    } else {
      res.sendStatus(404);
    }
  })
);

//4. Create Book Route
router.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      //You can nest try...catch statements inside `try` blocks. Any given exception will be caught only once by the nearest enclosing catch block unless it is re-thrown (which you will do in the next step).
      const book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        res.render("books/new", {
          book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw error; //error caught in the asyncHandler's catch block
      }
    }
    //The Book.build() method used above will return an non-persistent (or unsaved) model instance. The built instance holds the properties / values of the Book being created via req.body. It will get stored in the database by the create() method once the user submits the form with a valid title.
    //The errors property also gets passed into the view. The value is an errors array which Pug iterates over and renders.
  })
);

//5. Book Detail Route
router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("books/show/:id" + article.id, {
        book: book,
        title: book.title,
      });
    } else {
      res.sendStatus(404);
    }
  })
);

//6. Update Book Route
router.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books/" + article.id);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        book.id = req.params.id; //make sure correct book gets updated
        res.render("books/edit", {
          book,
          errors: error.errors,
          title: "Edit Book",
        });
      } else {
        throw error;
      }
    }
  })
);

//7. Delete Book Route
router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      //If article exists, destroy it and redirect to /books. Else, send a 404 status to the client
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
