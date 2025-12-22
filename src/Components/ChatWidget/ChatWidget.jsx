import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Components/ServiceLayer/Context/authContext";
import { socket } from "../Hooks/socket";

function ChatWidget() {
  const { apiClient, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // load conversation + messages when first open
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
        setMessages(msgRes.data);

        // join socket room for this conversation
        socket.emit("join_conversation", convRes.data.conversation_id);

        // listen for new messages
        socket.on("new_message", (msg) => {
          if (msg.conversation_id === convRes.data.conversation_id) {
            setMessages((prev) => [...prev, msg]);
          }
        });
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      // cleanup listener when widget closes / unmounts
      socket.off("new_message");
    };
  }, [isOpen, conversation, apiClient]);

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
      // no need to push to state here if you trust the socket event,
      // but keeping it gives instant echo
    } catch (err) {
      console.error("Send message error:", err);
    }
  };
  // Floating toggle button
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
                  return (
                    <div
                      key={m.message_id}
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
                  );
                })}
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
                  onChange={(e) => setNewMessage(e.target.value)}
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
