const express = require("express");
const { checkRoom, createRoom, joinRoom } = require("../controllers/room");
const { getResponseFromGPT } = require("../controllers/gpt");
const { fetchChat, addChat, deleteChat } = require("../controllers/chat");

const router = express.Router();

router.post("/create", async (req, res) => {
  const { username, roomName } = req.body;
  try {
    const result = await checkRoom(roomName);
    if (result) {
      return res.status(403).json({ message: "Room name Already Exists" });
    }
    await createRoom(roomName);
    await joinRoom(username, roomName);
    return res.status(200).json({ message: "Room created Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/join", async (req, res) => {
  const { username, roomName } = req.body;
  try {
    const result = await checkRoom(roomName);
    if (!result) {
      return res.status(404).json({ message: "Room doesn't exist" });
    }
    const res2 = await joinRoom(username, roomName);
    if (res2) {
      return res.status(200).json({ message: "Successful" });
    }
    res.status(400).json({ message: "error joining room" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/add-chat", async (req, res) => {
  try {
    const { message, username, roomName, date } = req.body;
    const res2 = await addChat(message, username, "1", roomName, date);
    if(res2) return res.status(200).json({ message: "Chat added successfully" });
    res.status(400).json({ message: "Error adding chat" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-chat", async (req, res) => {
  try {
    const { chatId } = req.query;
    if (!chatId) {
      return res.status(400).json({ message: "Chat ID is required" });
    }
    await deleteChat(chatId);
    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/fetch-chats", async (req, res) => {
  try {
    const { roomName } = req.query;
    const chats = await fetchChat(roomName);
    res.status(200).json({ chats });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/user-gpt-chat', async (req, res) => {
  try {
    const { message, username, roomName, date } = req.body;
    const res2 = await addChat(message, username, "1",roomName, date);
    if(res2) return res.status(200).json({ message: "Chat added successfully" });
    res.status(400).json({ message: "Error adding chat" });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
})

router.post('/add-gpt-chat', async (req, res) => {
  try {
    const { message, roomName, date } = req.body;
    const response = await getResponseFromGPT(message);
    const formattedResponse = '{GPT}' + response;
    const res3 = await addChat(formattedResponse, "GPT", "0", roomName, date);
    if(res3) return res.status(200).json({ message: "Chat added successfully", response: formattedResponse });
    res.status(400).json({ message: "Error adding chat" });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
})

module.exports = router;
