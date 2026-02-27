import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import chatService from "../services/chatService";
import axiosConfig from "../services/axiosConfig";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    setIsAuthenticated(!!token);
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // Handle click outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isNotificationOpen]);

  // Fetch unread message count
  useEffect(() => {
    if (user && user.id && isAuthenticated) {
      loadUnreadCount();
      
      // Set up WebSocket connection to listen for new messages
      if (!chatService.isConnected) {
        chatService.connect(
          user.id,
          () => {
            console.log("Navbar WebSocket connected");
          },
          (error) => {
            console.error("Navbar WebSocket error:", error);
          }
        );
      }

      // Listen for new messages and update count
      const messageListener = (message) => {
        // Increment unread count if message is for this user
        if (message.receiverId === user.id) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      };

      chatService.onMessageReceived(messageListener);

      return () => {
        chatService.removeMessageListener(messageListener);
      };
    }
  }, [user, isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const response = await axiosConfig.get(`/chat/unread/${user.id}`);
      // The endpoint returns a list of unread messages, so count them
      const count = response.data ? response.data.length : 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
      setUnreadCount(0);
    }
  };

  // Load conversations and extract unique users who sent messages
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await axiosConfig.get(`/chat/conversations/${user.id}`);
      const messages = response.data || [];
      
      // Extract unique senders (buyers who sent messages to this seller)
      const uniqueUsers = new Map();
      
      messages.forEach(msg => {
        // If current user is receiver, then sender is the one who contacted them
        if (msg.receiverId === user.id) {
          const senderKey = msg.senderId;
          if (!uniqueUsers.has(senderKey)) {
            uniqueUsers.set(senderKey, {
              userId: msg.senderId,
              username: msg.senderUsername,
              lastMessage: msg.message,
              lastMessageTime: msg.timestamp,
              propertyId: msg.propertyId
            });
          }
        }
      });

      // Convert to array and sort by most recent
      const conversationList = Array.from(uniqueUsers.values()).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );

      setConversations(conversationList);
      setLoadingConversations(false);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setLoadingConversations(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      loadConversations();
    }
  };

  const handleUserClick = (conversation) => {
    // Navigate to chat page with the specific user
    navigate(`/chat/${conversation.userId}/${conversation.propertyId}/${conversation.username}`);
    setIsNotificationOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setUnreadCount(0);
    navigate("/login");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <span className="brand-logo">🏠</span>
          <span className="brand-name">Estate<span className="brand-highlight">Hub</span></span>
        </div>

        {/* Navigation Links */}
        <div className="navbar-links">
          <div className="nav-item" onClick={() => navigate("/?type=Buy")}>Buy</div>
          <div className="nav-item" onClick={() => navigate("/?type=Rent")}>Rent</div>
          <div className="nav-item" onClick={() => navigate("/documents-info")}>Documents</div>
          <div className="nav-item" onClick={() => navigate("/budget-calculator")}>Budget Calculator</div>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Post Property CTA */}
          {!isAuthenticated && (
            <button className="btn-post-property" onClick={() => navigate("/sell-property")}>
              Post Property
              <span className="badge-free">FREE</span>
            </button>
          )}

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <>
              <button className="btn-post-property" onClick={() => navigate("/sell-property")} style={{ marginRight: '15px' }}>
                Post Property
                <span className="badge-free">FREE</span>
              </button>

              {/* Notification Bell Icon */}
              <div className="notification-icon-wrapper" ref={notificationRef} onClick={handleNotificationClick}>
                <div className="notification-bell">
                  🔔
                </div>
                {unreadCount > 0 && (
                  <div className="notification-count-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Messages</h3>
                      <button 
                        className="close-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotificationOpen(false);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {loadingConversations ? (
                      <div className="notification-loading">Loading...</div>
                    ) : conversations.length === 0 ? (
                      <div className="notification-empty">
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      <div className="conversation-list">
                        {conversations.map((conversation) => (
                          <div 
                            key={`${conversation.userId}-${conversation.propertyId}`}
                            className="conversation-item"
                            onClick={() => handleUserClick(conversation)}
                          >
                            <div className="conversation-avatar">
                              {conversation.username?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="conversation-details">
                              <div className="user-name">{conversation.username}</div>
                              <div className="last-message">{conversation.lastMessage}</div>
                              <div className="message-time">
                                {new Date(conversation.lastMessageTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="user-menu"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
              <div className="user-icon-wrapper" onClick={handleProfileClick}>
                <div className="user-icon-circle">
                  {user ? user.username?.charAt(0).toUpperCase() : "U"}
                </div>
              </div>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={() => { navigate("/profile"); setIsDropdownOpen(false); }}>
                    <span>👤</span> My Profile
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate("/my-properties"); setIsDropdownOpen(false); }}>
                    <span>📊</span> My Dashboard
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate("/wishlist"); setIsDropdownOpen(false); }}>
                    <span>♥️</span> Wishlist
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </div>
                </div>
              )}
              </div>
            </>
          ) : (
            <div className="auth-links">
              <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-signup" onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
