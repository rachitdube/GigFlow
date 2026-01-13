import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { addNotification } from "./store/slices/bidSlice";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGig from "./pages/CreateGig";
import GigDetails from "./pages/GigDetails";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeSocket } from "./utils/socket";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is logged in
    dispatch(getCurrentUser());

    // Initialize socket connection
    const socket = initializeSocket();

    // Listen for hire notifications
    socket.on("hired", (data) => {
      dispatch(
        addNotification({
          id: Date.now(),
          type: "success",
          message: data.message,
          gigTitle: data.gigTitle,
          timestamp: new Date().toISOString(),
        })
      );
    });

    // Listen for bid rejection notifications
    socket.on("bidRejected", (data) => {
      dispatch(
        addNotification({
          id: Date.now(),
          type: "error",
          message: data.message,
          gigTitle: data.gigTitle,
          timestamp: new Date().toISOString(),
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gig/:id" element={<GigDetails />} />
          <Route
            path="/create-gig"
            element={
              <ProtectedRoute>
                <CreateGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
