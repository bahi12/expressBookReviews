const express = require("express");
let books = require("./booksdb.js");
let { isValid } = require("./auth_users.js");
let { users } = require("./auth_users.js");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({
        status: "success",
        "message": "User Registered. You can log in.",
      });
    } else {
      return res
        .status(400)
        .json({ status: "error", "message": "User already exists." });
    }
  } else {
    return res.status(404).json({ message: "Unable to register user." });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Handle the case when the /isbn/ route is accessed without a specific ISBN value
public_users.get("/isbn/", function (req, res) {
  res.status(400).json({ error: "ISBN parameter is missing" });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn || isbn.trim() === "") {
    return res.status(400).json({ error: "ISBN parameter is missing" });
  }
  const book = Object.values(books).find((b) => b.isbn === isbn);

  if (book) {
    res.send(book);
  } else {
    res.send(`The isbn:${isbn} not found`);
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.values(books).filter((b) => b.author === author);

  if (matchingBooks.length > 0) {
    res.send(matchingBooks);
  } else {
    res.send(`The author: <span><b>${author}</b></span> not found`);
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingTitles = Object.values(books).filter((b) => b.title === title);

  if (matchingTitles.length > 0) {
    res.send(matchingTitles);
  } else {
    res.send(`The title: <span><b>${title}</b></span> not found`);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = Object.values(books).find((b) => b.isbn === isbn);

  if (book) {
    const reviews = book.reviews;
    res.send(JSON.stringify(reviews));
  } else {
    res.send(`No book found for ISBN: ${isbn}`);
  }
});

module.exports.general = public_users;
