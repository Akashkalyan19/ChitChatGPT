import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import MicIcon from "@mui/icons-material/Mic";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import Chat_bg from "../assets/chat_background2.jpg";
import { useSpeechSynthesis } from "react-speech-kit";
import { useSpeechRecognition } from "react-speech-kit";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Room = () => {
  const [myMessages, setMyMessages] = useState([]);
  const [gptMessages, setGptMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userGptMessage, setUserGptMessage] = useState("");
  const [waitingForGpt, setWaitingForGpt] = useState(false);
  const { speak, cancel } = useSpeechSynthesis();
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setMessage(result);
    },
  });
  const {
    listen: listenGPT,
    listening: listeningGPT,
    stop: stopGPT,
  } = useSpeechRecognition({
    onResult: (result) => {
      setUserGptMessage(result);
    },
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingGPT, setIsPlayingGPT] = useState(false);

  const { room } = useParams();
  const { currUsername, token } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.emit("room", { roomname: room, username: currUsername });
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("message", ({ message, username, date }) => {
      const dated = date.split("T")[0];
      const dateObject = new Date(date);
      const time = dateObject.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = {
        date: dated,
        time,
      };
      setMessage("");
      setMyMessages((prev) => [
        ...prev,
        { message, username, timeStamp: formattedDate },
      ]);
    });
    socket.on("room", ({ message }) => {
      console.log(message);
    });
    socket.on("wait-for-gpt", ({ message, username, date }) => {
      setWaitingForGpt(true);
      const dated = date.split("T")[0];
      const dateObject = new Date(date);
      const time = dateObject.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = {
        date: dated,
        time,
      };
      setUserGptMessage("");
      const messageToSet = message.slice(5);
      setGptMessages((prev) => [
        ...prev,
        { message: messageToSet, username, timeStamp: formattedDate },
      ]);
    });

    socket.on("bot-gpt-message", ({ message, username, date }) => {
      const dated = date.split("T")[0];
      const dateObject = new Date(date);
      const time = dateObject.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = {
        date: dated,
        time,
      };
      const messageToSet = message.slice(5);
      setGptMessages((prev) => [
        ...prev,
        { message: messageToSet, username, timeStamp: formattedDate },
      ]);
      setWaitingForGpt(false);
    });

    return () => {
      socket.off("message");
      socket.off("room");
      socket.off("wait-for-gpt");
      socket.off("bot-gpt-message");
    };
  }, [socket]);

  const sendMessageToBackend = async (e) => {
    e.preventDefault();
    try {
      const date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const res = await axios.post(
        `${BACKEND_URL}/room/add-chat`,
        {
          message,
          username: currUsername,
          roomName: room,
          date: date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        sendMessage();
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const sendMessage = useCallback(() => {
    const dateObject = new Date();
    const date = dateObject.toISOString();
    socket.emit("message", {
      message,
      username: currUsername,
      roomname: room,
      date: date,
    });
  }, [message, myMessages, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [myMessages, gptMessages]);

  const fetchChats = async () => {
    const res = await axios.get(
      `${BACKEND_URL}/room/fetch-chats?roomName=${room}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const chats = res.data.chats;
    const filteredUserChats = chats.filter(
      (chat) => !chat.message.startsWith("{GPT}")
    );
    const filteredGptChats = chats.filter((chat) =>
      chat.message.startsWith("{GPT}")
    );
    const finalGptChats = filteredGptChats.map((chat) => {
      return {
        ...chat,
        message: chat.message.slice(5),
      };
    });
    setGptMessages(finalGptChats);
    setMyMessages(filteredUserChats);
  };

  const sendMessageToGPT = useCallback(
    (formattedUserGptMessage) => {
      const dateObject = new Date();
      const date = dateObject.toISOString();
      socket.emit("wait-for-gpt", {
        message: formattedUserGptMessage,
        username: currUsername,
        roomname: room,
        date: date,
      });
    },
    [message, gptMessages, socket]
  );

  const handleGptChat = async (e) => {
    e.preventDefault();
    try {
      setWaitingForGpt(true);
      const formattedUserGptMessage = "{GPT}" + userGptMessage;
      const date = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const res = await axios.post(
        `${BACKEND_URL}/room/user-gpt-chat`,
        {
          message: formattedUserGptMessage,
          username: currUsername,
          roomName: room,
          date: date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("user: " + formattedUserGptMessage);
      if (res.status === 200) {
        sendMessageToGPT(formattedUserGptMessage);
        // socket.emit("wait-for-gpt", { roomname: room });
        const response = await axios.post(
          `${BACKEND_URL}/room/add-gpt-chat`,
          {
            message: userGptMessage,
            roomName: room,
            date: date,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          console.log(response.data.response);
          socket.emit("bot-gpt-message", {
            message: response.data.response,
            username: "GPT",
            roomname: room,
            date: date,
          });
        }
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAudioClick = (e) => {
    e.preventDefault();
    if (typeof speak === "function") {
      if (!isPlaying) {
        setIsPlaying(true);
        speak({
          text: myMessages[myMessages.length - 1].message,
          onEnd: () => {
            setIsPlaying(false);
            console.log("hi");
          },
        });
      } else {
        setIsPlaying(false);
        cancel();
      }
    } else {
      console.error("Speech synthesis is not available.");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center gap-8 px-8">
      <form
        onSubmit={sendMessageToBackend}
        className="bg-white rounded-xl p-3 flex-1 h-[80%]"
      >
        <div className=" bg-custom-gradient rounded-xl p-1 h-full">
          <div className=" bg-white rounded-lg p-3 gap-4 h-full flex flex-col">
            <div className=" rounded-lg flex-1 flex flex-col gap-1 overflow-auto pr-2 relative bg-chat_bg">
              {myMessages?.map((msg, index) => (
                <div
                  className={`px-2 py-1 flex flex-col ${
                    msg.username === currUsername ? " self-start" : "self-end"
                  } bg-custom-gradient text-white rounded-lg gap-0 z-10 shadow-xl max-w-[80%]`}
                  key={index}
                >
                  <div className="flex flex-col gap-0">
                    {(index === 0 ||
                      msg.username !== myMessages[index - 1].username) &&
                      msg.username !== currUsername && (
                        <p className=" text-sm font-semibold">{msg.username}</p>
                      )}

                    <p className="">{msg.message}</p>
                  </div>
                  <span className={` text-[10px] text-gray-200 self-end `}>
                    {msg.timeStamp.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className=" flex items-center w-full relative">
              <input
                className="w-[100%] p-2 rounded-lg bg-slate-300 outline-none pr-8"
                type="text"
                placeholder="Enter message"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
              <button
                type="submit"
                className=" absolute right-[13%] flex items-center justify-center"
              >
                <SendIcon className=" text-custom-blue hover:text-blue-500 " />
              </button>
              <div
                onClick={() => {
                  listening ? stop() : listen();
                }}
              >
                {!listening ? (
                  <MicIcon className="hover:text-custom-blue cursor-pointer" />
                ) : (
                  <StopIcon className="hover:text-custom-blue cursor-pointer" />
                )}
              </div>
              <div
                onClick={() => {
                  setMessage("");
                }}
              >
                <DeleteIcon className="hover:text-custom-blue cursor-pointer" />
              </div>
              <div onClick={handleAudioClick}>
                {isPlaying ? (
                  <PauseIcon className="hover:text-custom-blue cursor-pointer" />
                ) : (
                  <PlayArrowIcon className="hover:text-custom-blue cursor-pointer" />
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
      <form
        onSubmit={handleGptChat}
        className="bg-white rounded-xl p-3 flex-1 h-[80%]"
      >
        <div className=" bg-custom-gradient rounded-xl p-1 h-full ">
          <div className=" bg-white rounded-lg p-3 gap-4 h-full flex flex-col ">
            <div className=" rounded-lg flex-1 flex flex-col gap-1 overflow-auto pr-2 relative bg-bg-ai-chat-bg">
              {gptMessages?.map((msg, index) => (
                <div
                  className={`px-2 py-1 flex flex-col ${
                    msg.username === currUsername ? " self-start" : "self-end"
                  } bg-custom-gradient text-white rounded-lg gap-0 z-10 shadow-xl max-w-[80%]`}
                  key={index}
                >
                  <div className="flex flex-col gap-0">
                    {(index === 0 ||
                      msg.username !== gptMessages[index - 1].username) &&
                      msg.username !== currUsername && (
                        <p className=" text-sm font-semibold">{msg.username}</p>
                      )}

                    <p className="">{msg.message}</p>
                  </div>
                  <span className={` text-[10px] text-gray-200 self-end `}>
                    {msg.timeStamp.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className=" flex items-center w-full relative">
              <input
                className="w-[100%] p-2 rounded-lg bg-slate-300 outline-none pr-12"
                type="text"
                placeholder="Enter message"
                onChange={(e) => setUserGptMessage(e.target.value)}
                value={userGptMessage}
              />
              <button
                type="submit"
                className=" absolute right-[13%] flex items-center justify-center"
                disabled={waitingForGpt}
              >
                {waitingForGpt ? (
                  <CancelScheduleSendIcon className=" text-red-500 hover:text-red-700 " />
                ) : (
                  <SendIcon className=" text-custom-blue hover:text-blue-500 " />
                )}
              </button>
              <div
                onClick={() => {
                  listeningGPT ? stopGPT() : listenGPT();
                }}
              >
                {!listeningGPT ? (
                  <MicIcon className="hover:text-custom-blue cursor-pointer" />
                ) : (
                  <StopIcon className="hover:text-custom-blue cursor-pointer" />
                )}
              </div>
              <div
                onClick={() => {
                  setUserGptMessage("");
                }}
              >
                <DeleteIcon className="hover:text-custom-blue cursor-pointer" />
              </div>
              <div
                onClick={() => {
                  if (typeof speak === "function") {
                    if (!isPlayingGPT) {
                      setIsPlayingGPT(true);
                      speak({
                        text: gptMessages[gptMessages.length - 1].message,
                        onEnd: () => {
                          setIsPlayingGPT(false);
                        },
                      });
                    } else {
                      setIsPlayingGPT(false);
                      cancel();
                    }
                  } else {
                    console.error("Speech synthesis is not available.");
                  }
                }}
              >
                {isPlayingGPT ? (
                  <PauseIcon className="hover:text-custom-blue cursor-pointer" />
                ) : (
                  <PlayArrowIcon className="hover:text-custom-blue cursor-pointer" />
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Room;
