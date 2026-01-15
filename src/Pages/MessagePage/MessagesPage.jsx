import React, { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import { socket } from "../../Components/Hooks/socket";

const TYPING_TIMEOUT_MS = 2000;
let adminTypingTimeout = null;

function MessagesPage() {
  const { apiClient, logout, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchConversations();
  }, [apiClient, user]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await apiClient.get("/conversations").catch((e) => {
        console.log("status:", e.response?.status, "data:", e.response?.data);
        throw e;
      });
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const res = await apiClient.get(
        `/conversations/${conversationId}/messages`
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
      await apiClient.post(`/conversations/${conversationId}/read`);
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id !== user?.user_id ? { ...m, is_read: 1 } : m
        )
      );
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.conversation_id);

    socket.emit("join_conversation", conv.conversation_id);

    socket.off("new_message");
    socket.off("typing");
    socket.off("stop_typing");

    socket.on("new_message", (msg) => {
      if (msg.conversation_id !== conv.conversation_id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m.message_id === msg.message_id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing", (data) => {
      if (data.conversationId !== conv.conversation_id) return;
      if (data.sender_role === "pet owner") {
        setIsUserTyping(true);
      }
    });

    socket.on("stop_typing", (data) => {
      if (data.conversationId !== conv.conversation_id) return;
      if (data.sender_role === "pet owner") {
        setIsUserTyping(false);
      }
    });

    socket.on("messages_read", (data) => {
      if (data.conversationId !== conv.conversation_id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === user?.user_id ? { ...m, is_read: 1 } : m
        )
      );
    });
  };

  useEffect(() => {
    return () => {
      socket.off("new_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("messages_read");
    };
  }, []);

  const handleAdminInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!selectedConversation) return;

    socket.emit("typing", {
      conversationId: selectedConversation.conversation_id,
      sender_role: "admin",
    });

    if (adminTypingTimeout) clearTimeout(adminTypingTimeout);
    adminTypingTimeout = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: selectedConversation.conversation_id,
        sender_role: "admin",
      });
    }, TYPING_TIMEOUT_MS);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      await apiClient.post(
        `/conversations/${selectedConversation.conversation_id}/messages`,
        { content }
      );
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const getLastAdminMessageId = () => {
    const adminMessages = messages.filter(
      (m) => m.sender_role === "admin" || m.sender_id === user?.user_id
    );
    if (adminMessages.length === 0) return null;
    return adminMessages[adminMessages.length - 1].message_id;
  };

  const lastAdminMessageId = getLastAdminMessageId();

  // NEW PET-THEMED FULL PAGE LOADING
  if (loadingConversations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 transition-opacity duration-300">
        <div className="flex flex-col items-center gap-6 p-8 animate-pulse">
          <div className="w-20 h-20 bg-[#7c5e3b]/20 rounded-2xl flex items-center justify-center mb-4">
            <Loader2 className="h-16 w-16 text-[#7c5e3b] animate-spin drop-shadow-md" />
          </div>
          <div className="space-y-2 text-center">
            <div className="text-xl font-bold text-[#7c5e3b] tracking-wide">
              Preparing Messages
            </div>
            <div className="text-lg text-[#7c5e3b]/80">
              Loading conversations...
            </div>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#7c5e3b]/30 to-transparent rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7c5e3b] to-amber-500 animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={logout} />

        <div className="px-6 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex h-[70vh]">
            {/* Left: Conversation list */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="px-4 py-3 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                </h2>
                <p className="text-xs text-gray-500">
                  Conversations with users
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-xs text-gray-500">
                    No conversations yet.
                  </div>
                ) : (
                  conversations.map((c) => {
                    const fullName = `${c.first_name || ""} ${
                      c.last_name || ""
                    }`.trim();
                    const isActive =
                      selectedConversation?.conversation_id ===
                      c.conversation_id;

                    return (
                      <button
                        key={c.conversation_id}
                        onClick={() => handleSelectConversation(c)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isActive ? "bg-gray-100" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {fullName || `User #${c.user_id}`}
                          </span>
                        </div>
                        {c.last_message_preview && (
                          <p className="mt-1 text-xs text-gray-500 truncate">
                            {c.last_message_preview}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Messages in selected conversation */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {`${selectedConversation.first_name || ""} ${
                          selectedConversation.last_name || ""
                        }`.trim() || `User #${selectedConversation.user_id}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {loadingMessages ? (
                      <p className="text-xs text-gray-500">Loading messages…</p>
                    ) : messages.length === 0 ? (
                      <p className="text-xs text-gray-500">
                        No messages yet. Start the conversation.
                      </p>
                    ) : (
                      messages.map((m) => {
                        const isAdmin =
                          m.sender_role === "admin" ||
                          m.sender_id === user?.user_id;
                        const isLastAdmin =
                          isAdmin && m.message_id === lastAdminMessageId;

                        return (
                          <div key={m.message_id} className="space-y-1">
                            <div
                              className={`flex ${
                                isAdmin ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] px-3 py-2 text-xs rounded-2xl ${
                                  isAdmin
                                    ? "bg-[#560705] text-white rounded-br-sm"
                                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                }`}
                              >
                                {m.content}
                              </div>
                            </div>
                            {isLastAdmin && (
                              <div
                                className={`flex ${
                                  isAdmin ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="text-[10px] text-gray-400">
                                  {m.is_read ? "Seen" : "Sent"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {isUserTyping && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        User is typing…
                      </p>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="border-t px-4 py-3 flex space-x-2"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleAdminInputChange}
                      placeholder="Type a message..."
                      className="flex-1 text-sm px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#560705]"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-[#560705] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    Select a conversation from the left to start chatting.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
