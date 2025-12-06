// ------------------- Importing Modules -------------------
const pool = require("../lib/pgclient");

const addUser = async (name, username, hashedPassword) => {
  let client;
  try {
    client = await pool.connect();
    const existingUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      return false;
    }
    // const hashedPassword = await bcrypt.hash(password,10);
    await client.query(
      "INSERT INTO users (name,username,roomid,password) VALUES ($1,$2,$3,$4)",
      [name, username, null, hashedPassword]
    );
    return true;
  } catch (error) {
    throw error;
  } finally {
    if (client) client.release();
  }
};
const loginUser = async (username) => {
  let client;
  try {
    client = await pool.connect();
    const currentUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (currentUser.rows.length == 0) {
      return false;
    }
    return currentUser;
  } catch (error) {
    throw error;
  } finally {
    if (client) client.release();
  }
};

module.exports = { addUser, loginUser };
