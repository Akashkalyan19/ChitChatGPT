import React, { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import PeerService from "../service/peer";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";
import CancelScheduleSendIcon from "@mui/icons-material/CancelScheduleSend";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import MicIcon from '@mui/icons-material/Mic';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useSpeechSynthesis } from "react-speech-kit";
import { useSpeechRecognition } from "react-speech-kit";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

let peer = new PeerService();

const VideoRoom = () => {
  const [remoteUser, setRemoteUser] = useState("");
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [streamSent, setStreamSent] = useState(false);
  const [userDis, setUserDis] = useState(false);

  const [waitingForGpt, setWaitingForGpt] = useState(false);
  const [userGptMessage, setUserGptMessage] = useState("");
  const [gptMessages, setGptMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const { room } = useParams();
  const socket = useSocket();
  const { currUsername, token } = useAuth();
  const navigate = useNavigate();

  const { speak, cancel } = useSpeechSynthesis();
  const {
    listen: listenGPT,
    listening: listeningGPT,
    stop: stopGPT,
  } = useSpeechRecognition({
    onResult: (result) => {
      setUserGptMessage(result);
    },
  });
  const [isPlayingGPT, setIsPlayingGPT] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

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
  };

  useEffect(() => {
    if (socket) {
      socket.emit("room", { roomname: room, username: currUsername });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gptMessages]);

  const handleUserJoined = useCallback(({ message, username, socketId }) => {
    if (username !== currUsername) {
      setRemoteUser(username);
      setRemoteSocketId(socketId);
      console.log(message, username);
    }
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    socket.emit("call-user", { to: remoteSocketId, offer });
    setLocalStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ offer, from }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      const answer = await peer.getAnswer(offer);
      socket.emit("call-accepted", { to: from, answer });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    setStreamSent(true);
    for (const track of localStream.getTracks()) {
      peer.peer.addTrack(track, localStream);
    }
  }, [localStream]);

  const handleCallAccepted = useCallback(
    async ({ answer, from }) => {
      await peer.setLocalDescription(answer);
      sendStream();
    },
    [sendStream]
  );

  const handleNegoNeedIncoming = useCallback(
    async ({ offer, from }) => {
      const answer = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { to: from, answer });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    if (!socket) return;
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
      socket.off("wait-for-gpt");
      socket.off("bot-gpt-message");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("videoRoom", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-nego-needed", handleNegoNeedIncoming);
    socket.on("peer-nego-final", handleNegoNeedFinal);

    return () => {
      socket.off("videoRoom", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("peer-nego-needed", handleNegoNeedIncoming);
      socket.off("peer-nego-final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer-nego-needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleLeaveMeeting = () => {
    socket.emit("user-disconnected", { to: remoteSocketId });
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    navigate("/");
  };

  useEffect(() => {
    socket.on("user-disconnected", () => {
      setUserDis(true);
    });

    return () => {
      socket.off("user-disconnected");
    };
  }, [socket]);

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
    [gptMessages, socket]
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
      if (res.status === 200) {
        sendMessageToGPT(formattedUserGptMessage);
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

  return (
    <div className="flex h-full w-full items-center gap-8 px-8">
      <div className=" flex-1 h-[80%] bg-white rounded-xl p-3">
        <div className="bg-custom-gradient w-full h-full rounded-xl p-1">
          <div className="bg-white rounded-lg h-full flex flex-col items-center justify-center gap-4 relative bg-chat_bg">
            {!remoteStream && (
              <div>
                {remoteUser ? (
                  <button
                    className="bg-custom-blue text-white p-2 rounded-full"
                    onClick={handleCallUser}
                  >
                    {" "}
                    Call {remoteUser}{" "}
                  </button>
                ) : (
                  <p className="bg-custom-blue text-white p-2 rounded-full">
                    Waiting for connection
                  </p>
                )}
              </div>
            )}
            {localStream && (
              <div className="flex border-custom-blue border-4 max-w-fit rounded-lg overflow-hidden relative">
                <h1 className="absolute text-white bg-custom-blue pl-1 pr-1 rounded-br-md top-0 left-0">
                  My Stream
                </h1>
                <ReactPlayer
                  url={localStream}
                  playing
                  controls
                  width="18rem"
                  height="auto"
                  style={{}}
                />
              </div>
            )}
            {!streamSent && localStream && (
              <button
                className="text-lg p-2 bg-violet-400 rounded-lg font-semibold"
                onClick={sendStream}
              >
                Accept Call
              </button>
            )}
            {remoteStream && (
              <div className="flex border-custom-blue border-4 max-w-fit rounded-lg overflow-hidden relative">
                <h1 className="absolute text-white bg-custom-blue pl-1 pr-1 rounded-br-md top-0 left-0">
                  Remote Stream
                </h1>
                <ReactPlayer
                  url={remoteStream}
                  playing
                  controls
                  width="18rem"
                  height="auto"
                  style={{}}
                />
              </div>
            )}
            {!userDis && (
              <button
                className="bg-red-500 text-white px-2 py-1 rounded-md absolute bottom-2 right-2 hover:bg-red-700"
                onClick={handleLeaveMeeting}
              >
                Leave
              </button>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleGptChat}
        className="bg-white rounded-xl p-3 flex-1 h-[80%]"
      >
        <div className=" bg-custom-gradient rounded-xl p-1 h-full">
          <div className=" bg-white rounded-lg p-3 gap-4 h-full flex flex-col">
            <div className=" rounded-lg flex-1 flex flex-col gap-1 overflow-auto pr-2 relative bg-ai-chat-bg">
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

export default VideoRoom;
