import React, { useEffect, useState, useRef } from "react";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import { socket } from "../../Components/Hooks/socket";

function MessagesPage() {
  const { apiClient, logout, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    console.log("Current user in MessagesPage:", user);
    fetchConversations();
  }, [apiClient, user]);

  // fetch all conversations (one per user)
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      // const res = await apiClient.get("/conversations");
      const res = await apiClient.get("/conversations").catch((e) => {
        console.log("status:", e.response?.status, "data:", e.response?.data);
        throw e;
      });
      setConversations(Array.isArray(res.data) ? res.data : []);

      console.log(
        "apiClient config test",
        await apiClient.get("/conversations", { validateStatus: () => true })
      );
    } catch (err) {
      console.error("Fetch conversations error:", err);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  };

  // fetch messages for the selected conversation
  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const res = await apiClient.get(
        `/conversations/${conversationId}/messages`
      );
      setMessages(Array.isArray(res.data) ? res.data : []);
      // optional: mark as read
      await apiClient.post(`/conversations/${conversationId}/read`);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [apiClient]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.conversation_id);

    // join room for this conversation
    socket.emit("join_conversation", conv.conversation_id);

    // remove previous listener, then add new one for this conversation
    socket.off("new_message");
    socket.on("new_message", (msg) => {
      if (msg.conversation_id !== conv.conversation_id) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m.message_id === msg.message_id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });
  };

  useEffect(() => {
    return () => {
      socket.off("new_message");
    };
  }, []);

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
      // do NOT push to messages here; socket "new_message" will add it once
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

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
                {loadingConversations ? (
                  <div className="p-4 text-xs text-gray-500">Loading...</div>
                ) : conversations.length === 0 ? (
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
                          {c.last_message_at && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(c.last_message_at).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
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
                      <p className="text-xs text-gray-500">
                        Conversation ID: {selectedConversation.conversation_id}
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
                        const isAdmin = m.sender_role === "admin";

                        return (
                          <div
                            key={m.message_id}
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
                        );
                      })
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
                      onChange={(e) => setNewMessage(e.target.value)}
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

      {/* sendingEmail modal is only for ChatWidget / actions, not needed here unless you want it */}
      {/* <LoadingModal isOpen={sendingEmail} message="Sending message..." /> */}
    </div>
  );
}

export default MessagesPage;
