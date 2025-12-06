const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
      const token = req.headers.authorization.substring(7);
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
    }
    const auth = jwt.verify(token, process.env.PASSWORD);
    next();
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: "Invalid Token" });
  }
};

module.exports = { authenticate };
