import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages([...messages, newMsg]);
    setInput("");

    // Dummy admin reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Hello! How can I help you today?",
          sender: "admin",
        },
      ]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        className="fixed bottom-6 right-6 bg-[#ff7e67] text-white p-4 rounded-full shadow-lg hover:bg-[#ff5c47] transition"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Popup */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-[#ff7e67] text-white rounded-t-xl">
            <span className="font-semibold">Chat with Us</span>
            <button onClick={() => setIsChatOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto h-60 text-sm space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-[#ff7e67] text-white self-end ml-auto"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff7e67]"
            />
            <button
              onClick={sendMessage}
              className="bg-[#ff7e67] text-white px-3 py-2 rounded-lg hover:bg-[#ff5c47]"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
