const pool = require("../lib/pgclient");

const addChat = async (message, username, usertype, roomname, date) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT roomId FROM rooms WHERE name = $1",
      [roomname]
    );
    if(result.rows.length === 0) return false;
    if (result.rows.length > 0) {
      const roomid = result.rows[0].roomid;
      const res = await client.query(
        `INSERT INTO chats ( roomid, username , usertype, message, created_at ) VALUES ($1, $2, $3, $4, $5)`,
        [roomid, username, usertype, message, date]
      );
    }
    return true;
  } catch (err) {
    console.log(err);
  } finally {
    if(client) client.release();
  }
};

async function deleteChat(chatId) {
  let client;
  console.log(chatId);
  try {
    client = await pool.connect();
    await client.query("DELETE FROM chats WHERE chatid = $1", [chatId]);
  } catch (err) {
    console.log(err);
  }
}

const fetchChat = async (roomName) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      "SELECT roomId FROM rooms WHERE name = $1",
      [roomName]
    );
    if (result.rows.length > 0) {
      const roomid = result.rows[0].roomid;
      const results = await client.query(
        "SELECT chatid,roomid,username,usertype,message,created_at FROM chats WHERE roomid = $1",
        [roomid]
      );
      const chats = results.rows.map((item) => {
        const created = item.created_at;
        const dateObject = new Date(created);
        const formattedDate = {
          date: dateObject.toISOString().split("T")[0],
          time: dateObject.toLocaleTimeString("en-US", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
            // second: "2-digit",
          }),
        };
        return {
          chatId: item.chatid,
          roomId: item.roomId,
          username: item.username,
          message: item.message,
          timeStamp: formattedDate,
        };
      });
      return chats;
    }
  } catch (err) {
    throw err;
  } finally {
    if(client) client.release();
  }
};

module.exports = { addChat, fetchChat, deleteChat };
