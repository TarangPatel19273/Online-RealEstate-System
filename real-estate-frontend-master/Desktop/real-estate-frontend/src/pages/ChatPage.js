import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import Navbar from "../components/Navbar";
import "../pages/ChatPage.css";

function ChatPage() {
  const { receiverId, propertyId, receiverUsername } = useParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="chat-page">
      <Navbar />
      <div className="chat-page-container">
        <Chat 
          propertyId={parseInt(propertyId)} 
          receiverId={parseInt(receiverId)} 
          receiverUsername={decodeURIComponent(receiverUsername)}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

export default ChatPage;
