"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import styles from "./ChatPopup.module.css";
import { useChat } from "./ChatProvider";
import { IoMdClose, IoMdSend } from "react-icons/io";

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    profile_image_url: string;
  };
}

export default function ChatPopup() {
  const { activeRoom, closeChat } = useChat();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipants = activeRoom?.participants.filter(
    (p) => p.user_id !== session?.user?.id
  ) ?? [];
  const isGroupChat = otherParticipants.length > 1;
  const headerName = isGroupChat
    ? otherParticipants.map((p) => p.user.name || "User").join(", ")
    : otherParticipants[0]?.user.name || "User";
  const headerImage = isGroupChat ? "/noavatar.png" : otherParticipants[0]?.user.profile_image_url || "/noavatar.png";

  const fetchMessages = async () => {
    if (!activeRoom) return;
    try {
      const response = await axios.get(`/api/chat/${activeRoom.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeRoom?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    try {
      setLoading(true);
      const response = await axios.post(`/api/chat/${activeRoom.id}/message`, {
        content: newMessage
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={headerImage} alt="profile" />
          <span>{headerName}</span>
        </div>
        <button onClick={closeChat} className={styles.closeBtn}>
          <IoMdClose size={20} />
        </button>
      </div>

      <div className={styles.body}>
        {messages.map((msg) => {
          const isMine = session?.user?.id === msg.user_id;
          return (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${isMine ? styles.mine : styles.theirs}`}
            >
              <div className={styles.messageGroup}>
                <span className={styles.senderName}>
                  {isMine ? "You" : msg.user.name}
                </span>
                <div className={styles.messageBubble}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.footer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newMessage.trim()}>
          <IoMdSend size={20} />
        </button>
      </form>
    </div>
  );
}
