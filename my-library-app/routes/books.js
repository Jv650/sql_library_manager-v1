const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const seq = require("sequelize").Op;

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
  asyncHandler(async (req, res, next) => {
    const books = await Book.findAll({ order: [["createdAt", "DESC"]] }); //findAll takes in an options object //the array createdat and desc will organize books in desired order
    res.render("index", {
      books: books,
      title: "BOOKS",
    });
  })
);

//3. View Books & New Book Route
router.get("/new", function (req, res) {
  res.render("new-book", { title: "New Book" });
});

// router.get(
//   "/new",
//   asyncHandler(async (req, res, next) => {
//     const book = await Book.findByPk(req.params.id);
//     if (book) {
//       //if book exists render to books/show else show 404 status
//       res.render("new-book", {
//         //extend new-book.pug layout here??
//         book: book,
//         title: book.title,
//         id: book.id,
//         name: book.title,
//       });
//     } else {
//       res.sendStatus(404);
//     }
//   })
// );

//4. Create Book Route
router.post(
  "/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      //You can nest try...catch statements inside `try` blocks. Any given exception will be caught only once by the nearest enclosing catch block unless it is re-thrown (which you will do in the next step).
      const book = await Book.create(req.body);
      res.redirect("/books"); //"/books/" + book.id //update-book
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        //book.id = req.params.id;
        res.render("new-book", {
          //extend new-book.pug layout here??
          book: book,
          errors: error.errors,
          title: "New Book",
        });
      } else {
        throw err; //error caught in the asyncHandler's catch block
      }
    }
    //The Book.build() method used above will return an non-persistent (or unsaved) model instance. The built instance holds the properties / values of the Book being created via req.body. It will get stored in the database by the create() method once the user submits the form with a valid title.
    //The errors property also gets passed into the view. The value is an errors array which Pug iterates over and renders.
  })
);

//5. Book Detail Route
// router.get("/:id", function (req, res, next) {
//   res.render("update-book", { title: "Update Book" });
// });

router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", {
        book: book,
        title: "Update Book",
      });
    } else {
      next(); //res.sendStatus(404);
    }
  })
);

//6. Update Book Route
router.post(
  "/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
        //if book exists, update it in database and redirect to updated book else show 404 status
        await book.update(req.body);
        res.redirect("/books"); //"/books/" + book.id
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        // checking the error
        book = await Book.build(req.body);
        book.id = req.params.id; //make sure correct book gets updated
        res.render("update-book", {
          book: book,
          errors: error.errors,
          title: book.title,
        });
      } else {
        throw error;
      }
    }
    // asyncHandler(async (req, res, next) => {
    //   const book = await Book.findByPk(req.params.id);
    //   if (book) {
    //     await book.update(req.body);
    //     res.redirect("/books"); //+ book.id)
    //   } else {
    //     next();
    //   }
    // } catch (error) {
    //   if (error.name === "SequelizeValidationError") {
    //     // checking the error
    //     book = await Book.build(req.body);
    //     book.id = req.params.id; //make sure correct book gets updated
    //     res.render("update-book", {
    //       //extend new-book.pug layout here??
    //       book: book,
    //       errors: error.errors,
    //       title: book.title,
    //     });
    //   } else {
    //     throw error;
    //   }
    // }
  })
);

//7. Delete Book Route
router.post(
  "/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      //If book exists, destroy it and redirect to /books. Else, send a 404 status to the client
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;
