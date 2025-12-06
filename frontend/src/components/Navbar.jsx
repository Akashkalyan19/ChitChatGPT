import Logo from "../assets/logo_transparent.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const Navbar = ({ login }) => {
  const navigate = useNavigate();
  const { token, removeToken } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (login) {
      const decodedToken = jwtDecode(token);
      setName(decodedToken.name);
      setUsername(decodedToken.username);
    }
  }, [token]);

  const logout = () => {
    removeToken();
    navigate('/');
  }

  return (
    <div className="w-screen flex justify-between items-center py-4 px-8 bg-white relative">
      <div className="">
        <img className="w-14" src={Logo} alt="" />
      </div>
      <h1 className="text-5xl text-cus-grad font-semibold text-center absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
        ChitChatGPT
      </h1>
      {!login ? (
        <div className="flex items-center gap-4 ">
          <button
            className=" bg-custom-gradient px-7 hover:opacity-85 py-2 rounded-full text-xl"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign Up
          </button>
          <button
            className=" bg-custom-gradient px-7 hover:opacity-85 py-2 rounded-full text-xl"
            onClick={() => {
              navigate("/signin");
            }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="bg-custom-gradient px-4 py-2 rounded-full flex items-center gap-4 relative">
          <h1 className=" text-xl">{name}</h1>
          <LogoutRoundedIcon className=" scale-100 cursor-pointer" onClick={logout}/>
        </div>
      )}
    </div>
  );
};

export default Navbar;
