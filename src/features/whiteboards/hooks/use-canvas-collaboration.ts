"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface UserPresence {
  userId: string;
  userName: string;
  cursorX?: number;
  cursorY?: number;
  color: string;
}

type LayerType = "RECTANGLE" | "ELLIPSE" | "PATH" | "TEXT" | "NOTE";

interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  data: any;
}

interface UseCanvasCollaborationProps {
  canvasId: string;
  userId: string;
  userName: string;
  onElementUpdate?: (element: Layer) => void;
  onElementDelete?: (elementId: string) => void;
  onSync?: (elements: Layer[]) => void;
}

const USER_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", 
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
];

export function useCanvasCollaboration({
  canvasId,
  userId,
  userName,
  onElementUpdate,
  onElementDelete,
  onSync,
}: UseCanvasCollaborationProps) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const cursorThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const userColor = useRef(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  const broadcastUpdate = useCallback(async (type: string, data: any) => {
    try {
      await fetch("/api/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          canvasId,
          userId,
          data,
        }),
      });
    } catch (error) {
      console.error("Failed to broadcast update:", error);
    }
  }, [canvasId, userId]);

  const sendCursor = useCallback((x: number, y: number, selectedElementId?: string) => {
    if (cursorThrottleRef.current) {
      clearTimeout(cursorThrottleRef.current);
    }

    cursorThrottleRef.current = setTimeout(() => {
      setUsers(prev => {
        const existingIndex = prev.findIndex(u => u.userId === userId);
        const updatedUser: UserPresence = {
          userId,
          userName,
          cursorX: x,
          cursorY: y,
          color: userColor.current,
        };

        if (existingIndex >= 0) {
          const newUsers = [...prev];
          newUsers[existingIndex] = updatedUser;
          return newUsers;
        }
        return [...prev, updatedUser];
      });
    }, 50);
  }, [userId, userName]);

  const updateElement = useCallback((element: Layer) => {
    broadcastUpdate("update-element", element);
    onElementUpdate?.(element);
  }, [broadcastUpdate, onElementUpdate]);

  const deleteElement = useCallback((elementId: string) => {
    broadcastUpdate("delete-element", elementId);
    onElementDelete?.(elementId);
  }, [broadcastUpdate, onElementDelete]);

  useEffect(() => {
    const connectToCollaboration = async () => {
      try {
        const response = await fetch("/api/collaborate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "sync",
            canvasId,
            userId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.elements) {
            onSync?.(data.elements);
          }
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Failed to connect to collaboration:", error);
        setIsConnected(false);
      }
    };

    connectToCollaboration();

    const pollInterval = setInterval(() => {
      connectToCollaboration();
    }, 30000);

    return () => {
      clearInterval(pollInterval);
      if (cursorThrottleRef.current) {
        clearTimeout(cursorThrottleRef.current);
      }
    };
  }, [canvasId, userId, onSync]);

  useEffect(() => {
    const inactivityTimeout = setTimeout(() => {
      setUsers(prev => prev.filter(u => u.userId === userId));
    }, 60000);

    return () => clearTimeout(inactivityTimeout);
  }, [users, userId]);

  return {
    users: users.filter(u => u.userId !== userId),
    isConnected,
    sendCursor,
    updateElement,
    deleteElement,
  };
}
