const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  if (usersWithSameName.length > 0) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in!" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json("User successfully logged in!");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let filtered_book = books[isbn];
  if (filtered_book) {
    let review = req.body.review;
    let reviewer = req.session.authorization["username"];
    if (review) {
      filtered_book["reviews"][reviewer] = review;
      books[isbn] = filtered_book;
    }
    res.send(
      `The review for the book with the ISBN: ${isbn} has been added/updated successfuly!`
    );
  } else {
    res.send(`The book with the ISBN: ${isbn} was not found!`);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];

  if (!isbn || !username) {
    return res.status(400).json({ message: "Missing ISBN or username!" });
  }

  let filtered_book = books[isbn];
  if (filtered_book) {
    let reviews = filtered_book.reviews;
    if (reviews.hasOwnProperty(username)) {
      delete reviews[username];
      books[isbn] = filtered_book;
      return res.json({ message: "Review deleted successfully!" });
    } else {
      return res.status(404).json({ message: "Review not found!" });
    }
  } else {
    return res.status(404).json({ message: "Book not found!" });
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
