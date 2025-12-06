import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import Room from "./pages/Room";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import VideoRoom from "./pages/VideoRoom";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="h-screen bg-custom-gradient flex items-center justify-center font-custom2">
          <Routes>
            <Route path="/" element={<Profile login={false} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />

            <Route
              path="/profile/:username/*"
              element={
                <Routes>
                  <Route index element={<Profile login={true} />} />
                  <Route
                    path=":room"
                    element={
                      <SocketProvider>
                        <Room />
                      </SocketProvider>
                    }
                  />
                  <Route
                    path="/vc/:room"
                    element={
                      <SocketProvider>
                        <VideoRoom />
                      </SocketProvider>
                    }
                  />
                </Routes>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
