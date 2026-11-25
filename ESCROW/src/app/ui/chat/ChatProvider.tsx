"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import ChatPopup from "./ChatPopup";

interface ParticipantUser {
  id: string;
  name: string;
  profile_image_url: string | null;
}

interface Participant {
  id: string;
  room_id: string;
  user_id: string;
  role: "USER" | "CREATOR" | "ARBITER";
  user: ParticipantUser;
}

export interface ChatRoom {
  id: string;
  created_at: string;
  participants: Participant[];
}

interface ChatContextType {
  activeRoom: ChatRoom | null;
  isOpen: boolean;
  openChat: (targetUserId: string, targetRole?: "USER" | "CREATOR" | "ARBITER") => Promise<void>;
  startDisputeChat: (orderId: string) => Promise<void>;
  switchRoom: (room: ChatRoom) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openChat = async (targetUserId: string, targetRole?: "USER" | "CREATOR" | "ARBITER") => {
    try {
      const response = await axios.post("/api/chat", { targetUserId, targetRole });
      setActiveRoom(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to open chat:", error);
      alert("Failed to start chat. Are you logged in?");
    }
  };

  const startDisputeChat = async (orderId: string) => {
    try {
      const response = await axios.post("/api/chat/dispute", { orderId });
      setActiveRoom(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to open dispute chat:", error);
      alert("Failed to start dispute chat.");
    }
  };

  const switchRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveRoom(null);
  };

  return (
    <ChatContext.Provider value={{ activeRoom, isOpen, openChat, startDisputeChat, switchRoom, closeChat }}>
      {children}
      {isOpen && activeRoom && <ChatPopup />}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
