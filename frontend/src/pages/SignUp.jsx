import stock from "../assets/signUp.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SignUp = () => {
  
    const [username,setUsername] = useState("");
    const [name,setName] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPass,setConfirmPass] = useState("");
    const [currState, setCurrState] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
      e.preventDefault();
      try{
        if(password != confirmPass){
          return setCurrState("Passwords don't match");
        }
        const response = await axios.post(`${BACKEND_URL}/auth/register`,{
          username : username,
          name : name,
          password : password
        })
        if(response.status === 201){
          navigate("/signin");
          return;
        }
        
      }
      catch(e){
        if(e.response.status === 400){
          return setCurrState("User already Exists, please login");
        }
        else{
          console.log("Server Error", e);
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
          <img src={stock} className=" w-96" alt="stock" />
        </div>
        <div className=" h-full w-[50%] border-l border-custom-blue flex flex-col items-center justify-around">
          <h1 className=" font-bold text-4xl bg-clip-text text-transparent bg-custom-gradient">
            Sign Up
          </h1>
          <form className="flex flex-col space-y-4 h-96 items-center justify-center w-full " onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Name"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => {setName(e.target.value)}}
            />
            <input
              type="text"
              placeholder="Username"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => {setUsername(e.target.value)}}
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => {setPassword(e.target.value)}}

            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="px-4 py-2 border border-gray-300 rounded-full w-[50%]"
              onChange={(e) => {setConfirmPass(e.target.value)}}
            />
            <p>
              Already have an account?{" "}
              <span className=" bg-clip-text text-transparent bg-custom-gradient cursor-pointer" onClick={() => {navigate('/signin')}}>
                Sign In
              </span>
            </p>
            <div className="text-red-500">{currState}</div>
            <button
              type="submit"
              className="bg-custom-gradient w-[50%] text-white py-2 px-4 rounded-full"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
