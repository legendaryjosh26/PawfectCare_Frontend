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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!isOpen || conversation) return;

    const init = async () => {
      try {
        setLoading(true);

        const convRes = await apiClient.get("/conversations/me");
        setConversation(convRes.data);

        const msgRes = await apiClient.get(
          `/conversations/${convRes.data.conversation_id}/messages`
        );
        setMessages(msgRes.data || []);

        await apiClient.post(
          `/conversations/${convRes.data.conversation_id}/read`
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id !== user?.user_id ? { ...m, is_read: 1 } : m
          )
        );

        socket.emit("join_conversation", convRes.data.conversation_id);

        socket.off("new_message");
        socket.off("typing");
        socket.off("stop_typing");
        socket.off("messages_read");

        socket.on("new_message", (msg) => {
          if (msg.conversation_id === convRes.data.conversation_id) {
            setMessages((prev) => [...prev, msg]);
          }
        });

        socket.on("typing", (data) => {
          if (data.conversationId !== convRes.data.conversation_id) return;
          if (data.sender_role === "admin") {
            setIsAdminTyping(true);
          }
        });

        socket.on("stop_typing", (data) => {
          if (data.conversationId !== convRes.data.conversation_id) return;
          if (data.sender_role === "admin") {
            setIsAdminTyping(false);
          }
        });

        socket.on("messages_read", (data) => {
          if (data.conversationId !== convRes.data.conversation_id) return;
          // admin opened chat; mark my messages as read
          setMessages((prev) =>
            prev.map((m) =>
              m.sender_id === user?.user_id ? { ...m, is_read: 1 } : m
            )
          );
        });
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      socket.off("new_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("messages_read");
    };
  }, [isOpen, conversation, apiClient, user?.user_id]);

  const getLastUserMessageId = () => {
    const userMessages = messages.filter(
      (m) => m.sender_role === "USER" || m.sender_id === user?.user_id
    );
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
      // message will arrive via socket
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-[#560705] text-white w-12 h-12 flex items-center justify-center shadow-lg hover:bg-[#703736] transition"
      >
        {isOpen ? "×" : "💬"}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-lg rounded-xl flex flex-col z-40">
          {/* Header */}
          <div className="px-4 py-2 border-b flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-800">
              Chat with Admin
            </span>
          </div>

          {/* Body */}
          {loading && !conversation ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-sm text-gray-500">Loading chat...</span>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                {messages.map((m) => {
                  const isMe =
                    m.sender_role === "USER" || m.sender_id === user?.user_id;
                  const isLastMine = isMe && m.message_id === lastUserMessageId;

                  return (
                    <div key={m.message_id} className="space-y-1">
                      {/* bubble */}
                      <div
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-xs ${
                            isMe
                              ? "bg-[#560705] text-white rounded-br-none"
                              : "bg-gray-100 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>

                      {/* bottom: Sent / Seen aligned with my bubble */}
                      {isLastMine && (
                        <div
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] text-gray-400">
                            {m.is_read ? "Seen" : "Sent"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isAdminTyping && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    Admin is typing…
                  </p>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="border-t px-3 py-2 flex space-x-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleUserInputChange}
                  placeholder="Type a message..."
                  className="flex-1 text-xs px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#560705]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#560705] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWidget;
