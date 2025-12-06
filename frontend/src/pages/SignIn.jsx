import stock from "../assets/signUp.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SignIn = () => {
    const {saveToken} = useAuth();
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [currState,setCurrState] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      try{
        const response = await axios.post(`${BACKEND_URL}/auth/login`,{
          username : username,
          password : password
        })
        
        if(response.status === 200){
          saveToken(response.data.token);
          navigate(`/profile/${username}`);
        }
      }
      catch(e){
        if(e.response.status === 404){
          return setCurrState("User not found");
        }
        if(e.response.status === 401){
          return setCurrState("Invalid credentials");
        }
        else{
        console.log(e);
        }
      }
    }

    return (
    <div className="h-[80%] w-[85%] bg-custom-white shadow-2xl rounded-3xl flex p-6">
      <div className=" w-full h-full flex">
        <div className="flex flex-col h-full w-[50%] items-center justify-around">
          <h1 className=" font-bold text-4xl bg-clip-text text-transparent bg-custom-gradient">
            ChitChatGPT
          </h1>
          {/* <img src={logo} className=" w-24" alt="logo" /> */}
          <img src={stock} className=" w-96" alt="stock" />
        </div>
        <div className=" h-full w-[50%] border-l border-custom-blue flex flex-col items-center justify-around">
          <h1 className=" font-bold text-4xl bg-clip-text text-transparent bg-custom-gradient">
            Sign In
          </h1>
          <form 
            className="flex flex-col space-y-4 h-96 items-center justify-center w-full "
            onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p>
              Don't have an account?{" "}
              <span className=" bg-clip-text text-transparent bg-custom-gradient cursor-pointer" onClick={() => {navigate('/signup')}}>
                Sign Up
              </span>
            </p>
            <div className="text-red-500">{currState}</div>
            <button
              type="submit"
              className="bg-custom-gradient w-[50%] text-white py-2 px-4 rounded-full"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
