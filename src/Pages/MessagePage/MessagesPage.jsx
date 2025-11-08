import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavAdmin from "../../Components/Navigation/TopNavAdmin";
import { getApiBaseUrl } from "../../../../Backend/config/API_BASE_URL";

function getInitials(name = "User") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function MessagesPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reply, setReply] = useState("");

  const admin = JSON.parse(localStorage.getItem("loggedInAdmin"));
  const adminId = admin?.user_id;

  const handleSignOut = () => {
    localStorage.removeItem("loggedInAdmin");
    navigate("/user/login", { replace: true });
  };

  // Load conversation previews
  const loadConversations = async () => {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/chat/conversations/${adminId}`
      );
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();

      setConversations(
        data.map((conv) => ({
          ...conv,
          messages: conv.messages || [], // always ensure messages array
        }))
      );
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  // Socket register + live updates
  useEffect(() => {
    if (!adminId) return;

    socket.emit("register", { userId: adminId });

    socket.on("receiveMessage", (message) => {
      const userId =
        message.senderId === adminId ? message.receiverId : message.senderId;

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.userId === userId);

        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            messages: [...updated[idx].messages, message],
            lastMessageAt: message.createdAt,
            status: selectedConversation?.userId === userId ? "Read" : "Unread",
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              userId,
              userName: "Unknown",
              messages: [message],
              lastMessageAt: message.createdAt,
              status: "Unread",
            },
          ];
        }
      });

      // Update open chat window
      if (
        selectedConversation &&
        (message.senderId === selectedConversation.userId ||
          message.receiverId === selectedConversation.userId)
      ) {
        setSelectedConversation((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
      }
    });

    return () => socket.off("receiveMessage");
  }, [adminId, selectedConversation]);

  // Load conversations on page load
  useEffect(() => {
    if (adminId) loadConversations();
  }, [adminId]);

  // Open full conversation history
  const openConversation = async (conv) => {
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/chat/history/${conv.userId}/${adminId}`
      );
      if (!res.ok) throw new Error("Failed to load history");
      const history = await res.json();

      setSelectedConversation({
        ...conv,
        messages: history,
      });

      // Mark as read
      if (conv.status === "Unread") {
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === conv.userId ? { ...c, status: "Read" } : c
          )
        );
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  // Send message
  const sendReply = async () => {
    if (!reply.trim() || !selectedConversation) return;

    const newMsg = {
      senderId: adminId,
      receiverId: selectedConversation.userId,
      message: reply.trim(),
    };

    try {
      const res = await fetch(`${getApiBaseUrl()}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
      if (!res.ok) throw new Error("Failed to send message");
      await res.json();
      setReply(""); // socket will push the update
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-2xl mx-auto">
        <TopNavAdmin handleSignOut={handleSignOut} />

        {/* Conversation list */}
        <div className="bg-white rounded-md shadow divide-y divide-gray-200">
          {conversations.length === 0 ? (
            <p className="text-center p-6 text-gray-500">No messages yet.</p>
          ) : (
            conversations.map((conv) => {
              const lastMsg =
                conv.messages[conv.messages.length - 1]?.message || "";
              const lastDate = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <button
                  key={conv.userId}
                  onClick={() => openConversation(conv)}
                  className={`flex items-center w-full p-4 text-left hover:bg-gray-50 focus:outline-none ${
                    conv.status === "Unread" ? "bg-blue-50 font-semibold" : ""
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mr-4 text-lg font-bold select-none">
                    {getInitials(conv.userName)}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="truncate text-gray-900">
                      {conv.userName || conv.userId}
                    </p>
                    <p className="truncate text-gray-600 text-sm">{lastMsg}</p>
                  </div>
                  <div className="ml-4 text-xs text-gray-400 whitespace-nowrap select-none">
                    {lastDate}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
