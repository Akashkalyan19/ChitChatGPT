// ------------------- Importing Modules -------------------
const express = require("express");
const { addUser, loginUser } = require("../controllers/auth");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ------------- Configuration ------------------

const router = express.Router();
dotenv.config();

// -------------- End of Configuration -------------

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await loginUser(username);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = result.rows[0].password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const tok = { username: username, name: result.rows[0].name };
    const token = jwt.sign(tok, process.env.PASSWORD);
    res.status(200).json({ message: "Sign-In Successful", token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { name, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await addUser(name, username, hashedPassword);
    if (!result) {
      return res.status(400).json({ message: "User already exist" });
    }
    res.status(201).json({ message: "User Created Successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
