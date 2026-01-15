import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import { socket } from "../Hooks/socket";

const TYPING_TIMEOUT_MS = 2000;
let userTypingTimeout = null;

function ChatWidget() {
  const { apiClient, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Silent init: only if user is logged in
  useEffect(() => {
    if (!user) return;

    const initSilent = async () => {
      try {
        const convRes = await apiClient.get("/conversations/me");
        setConversation(convRes.data);
        socket.emit("join_conversation", convRes.data.conversation_id);

        // Initial unseen ADMIN messages
        const msgRes = await apiClient.get(
          `/conversations/${convRes.data.conversation_id}/messages`
        );
        const messagesData = msgRes.data || [];
        setMessages(messagesData);

        const initialUnreadFromAdmin = messagesData.filter((m) => {
          const role = (m.sender_role || "").toLowerCase();
          return role === "admin" && !m.is_read;
        }).length;

        if (initialUnreadFromAdmin > 0) {
          setHasUnreadMessages(true);
          setUnreadCount(initialUnreadFromAdmin);
        }
      } catch (e) {
        console.error("Silent chat init error:", e);
      }
    };
    initSilent();

    return () => {
      socket.off("new_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("messages_read");
    };
  }, [apiClient, user]);

  // Load + mark read: only when chat is open AND user exists
  useEffect(() => {
    if (!isOpen || !conversation || !user) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const msgRes = await apiClient.get(
          `/conversations/${conversation.conversation_id}/messages`
        );
        if (cancelled) return;
        const messagesData = msgRes.data || [];
        setMessages(messagesData);

        await apiClient.post(
          `/conversations/${conversation.conversation_id}/read`
        );
        if (cancelled) return;
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id !== user?.user_id ? { ...m, is_read: 1 } : m
          )
        );
        setHasUnreadMessages(false);
        setUnreadCount(0);
      } catch (err) {
        if (!cancelled) console.error("Chat open load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [isOpen, conversation, apiClient, user]);

  // Global socket listeners
  useEffect(() => {
    if (!conversation || !user) return;

    socket.off("new_message");
    socket.off("typing");
    socket.off("stop_typing");
    socket.off("messages_read");

    socket.on("new_message", (msg) => {
      if (msg.conversation_id !== conversation.conversation_id) return;

      const role = (msg.sender_role || "").toLowerCase();
      const isAdminSender = role === "admin";

      setMessages((prev) => [...prev, msg]);

      if (!isOpen && isAdminSender) {
        setHasUnreadMessages(true);
        setUnreadCount((c) => c + 1);
      }
    });

    socket.on("typing", (data) => {
      if (data.conversationId !== conversation.conversation_id) return;
      const role = (data.sender_role || "").toLowerCase();
      if (role === "admin") setIsAdminTyping(true);
    });

    socket.on("stop_typing", (data) => {
      if (data.conversationId !== conversation.conversation_id) return;
      const role = (data.sender_role || "").toLowerCase();
      if (role === "admin") setIsAdminTyping(false);
    });

    socket.on("messages_read", (data) => {
      if (data.conversationId !== conversation.conversation_id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === user?.user_id ? { ...m, is_read: 1 } : m
        )
      );
    });

    return () => {
      socket.off("new_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("messages_read");
    };
  }, [conversation, isOpen, user]);

  const getLastUserMessageId = () => {
    const userMessages = messages.filter((m) => {
      const role = (m.sender_role || "").toLowerCase();
      return role === "pet owner" || m.sender_id === user?.user_id;
    });
    if (userMessages.length === 0) return null;
    return userMessages[userMessages.length - 1].message_id;
  };

  const lastUserMessageId = getLastUserMessageId();

  const handleUserInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!conversation) return;

    socket.emit("typing", {
      conversationId: conversation.conversation_id,
      sender_role: "pet owner",
    });

    if (userTypingTimeout) clearTimeout(userTypingTimeout);
    userTypingTimeout = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: conversation.conversation_id,
        sender_role: "pet owner",
      });
    }, TYPING_TIMEOUT_MS);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      await apiClient.post(
        `/conversations/${conversation.conversation_id}/messages`,
        { content }
      );
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const openChat = () => {
    if (!user) return;
    setIsOpen(true);
    setHasUnreadMessages(false);
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={
          hasUnreadMessages ? openChat : () => setIsOpen((prev) => !prev)
        }
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
          bg-gradient-to-br from-[#560705] to-[#703736] text-white shadow-2xl
          hover:from-[#703736] hover:to-[#560705] active:scale-95
          transition-all duration-200 flex items-center justify-center
          border-2 border-white/20 md:bottom-4 md:right-4  ${
            hasUnreadMessages ? "ring-4 ring-red-400/50 animate-pulse" : ""
          }`}
        aria-label="Toggle chat"
      >
        {hasUnreadMessages && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
        {isOpen ? "×" : "💬"}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={closeChat}
        />
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl overflow-hidden w-full h-screen md:bottom-20 md:right-4 md:w-96 md:h-[500px] md:max-h-[80vh] md:inset-auto md:rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#560705] to-[#703736] px-6 py-4 border-b border-[#560705]/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                👤
              </div>
              <div>
                <span className="font-semibold text-white text-base block">
                  Chat with Admin
                </span>
                <span className="text-[#F3D6B7]/80 text-sm">Online</span>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition"
            >
              ×
            </button>
          </div>

          {/* Body */}
          {loading && !conversation ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#560705]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  💬
                </div>
                <span className="text-lg font-medium text-gray-700">
                  Loading chat...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 md:px-4 md:py-3 bg-gradient-to-b from-gray-50/50 to-white">
                {messages.map((m) => {
                  const role = (m.sender_role || "").toLowerCase();
                  const isMe =
                    role === "pet owner" || m.sender_id === user?.user_id;
                  const isLastMine = isMe && m.message_id === lastUserMessageId;

                  return (
                    <div key={m.message_id} className="space-y-1.5">
                      <div
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-md text-sm transition-all ${
                            isMe
                              ? "bg-gradient-to-r from-[#560705] to-[#703736] text-white rounded-br-sm shadow-[#560705]/25"
                              : "bg-white/80 backdrop-blur-sm border border-gray-100/50 rounded-bl-sm shadow-sm hover:shadow-md"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>

                      {isLastMine && (
                        <div
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 backdrop-blur-sm shadow-sm">
                            {m.is_read ? "Seen" : "Sent"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isAdminTyping && (
                  <div className="flex items-center space-x-2 px-1 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]" />
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      Admin is typing…
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4 md:px-4 md:py-3"
              >
                <div className="flex items-end space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleUserInputChange}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-5 py-3 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#560705]/30 focus:border-transparent shadow-sm resize-none min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-12 h-12 bg-gradient-to-r from-[#560705] to-[#703736] text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:shadow-md transition-all font-semibold flex-shrink-0"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWidget;
