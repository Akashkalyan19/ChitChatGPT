import axios from "axios";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const VC = ({ login }) => {
  const { token } = useAuth();
  const { username } = useParams();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [roomId, setRoomId] = useState("");
  const [createRoomId, setCreateRoomId] = useState("");
  const navigate = useNavigate();

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!login) {
      navigate("/signin");
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room/join`,
        { roomName: roomId, username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        navigate(`/profile/${username}/vc/${roomId}`);
      } else if (res.status === 400) {
        console.log(res.data.message);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!login) {
      navigate("/signin");
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room/create`,
        { roomName: createRoomId, username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        navigate(`/profile/${username}/vc/${createRoomId}`);
      } else if (res.status === 400) {
        console.log(res.data.message);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className=" flex flex-col gap-4 w-full h-full bg-white rounded-3xl p-4">
      <div className="flex-1 bg-custom-gradient rounded-2xl p-1">
        <form
          onSubmit={joinRoom}
          className=" bg-white rounded-xl h-full flex flex-col justify-center items-center gap-16 relative"
        >
          <div className="absolute bg-custom-blue top-2 right-2 rounded-full w-12 h-12"></div>
          <div className="absolute border-4 border-custom-blue bg-white top-2 right-16 rounded-full w-4 h-4"></div>
          <div className="absolute border-4 border-custom-blue bg-white top-16 right-2 rounded-full w-4 h-4"></div>
          <div className="absolute bg-custom-blue bottom-2 left-2 rounded-full w-12 h-12"></div>
          <div className="absolute border-4 border-custom-blue bg-white bottom-2 left-16 rounded-full w-4 h-4"></div>
          <div className="absolute border-4 border-custom-blue bg-white bottom-16 left-2 rounded-full w-4 h-4"></div>
          <h1 className="text-3xl font-semibold text-cus-grad">
            Join a Video chat room
          </h1>
          <div className="flex flex-col gap-2 w-[40%]">
            <input
              className="rounded-full px-4 py-2 w-full text-center text-black bg-slate-300 outline-none"
              type="text"
              placeholder="Enter room id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button
              type="submit"
              className="bg-custom-gradient hover:opacity-90 rounded-full px-4 py-2 w-full"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1 bg-custom-gradient rounded-2xl p-1">
        <form
          onSubmit={createRoom}
          className=" bg-white rounded-xl h-full flex flex-col justify-center items-center gap-16 relative"
        >
          <div className="absolute bg-custom-blue top-2 right-2 rounded-full w-12 h-12"></div>
          <div className="absolute border-4 border-custom-blue bg-white top-2 right-16 rounded-full w-4 h-4"></div>
          <div className="absolute border-4 border-custom-blue bg-white top-16 right-2 rounded-full w-4 h-4"></div>
          <div className="absolute bg-custom-blue bottom-2 left-2 rounded-full w-12 h-12"></div>
          <div className="absolute border-4 border-custom-blue bg-white bottom-2 left-16 rounded-full w-4 h-4"></div>
          <div className="absolute border-4 border-custom-blue bg-white bottom-16 left-2 rounded-full w-4 h-4"></div>
          <h1 className="text-3xl font-semibold text-cus-grad">
            Create a Video chat room
          </h1>
          <div className="flex flex-col gap-2 w-[40%]">
            <input
              className="rounded-full px-4 py-2 w-full text-center text-black bg-slate-300 outline-none"
              type="text"
              placeholder="Enter room name"
              onChange={(e) => setCreateRoomId(e.target.value)}
            />
            <button
              type="submit"
              className="bg-custom-gradient hover:opacity-90 rounded-full px-4 py-2 w-full"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VC;
