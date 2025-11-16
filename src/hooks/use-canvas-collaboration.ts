"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CanvasCollaborationManager, UserPresence } from "@/lib/collaboration";
import { getWebSocketUrl } from "@/lib/get-base-url";

export interface UseCanvasCollaborationOptions {
  canvasId: string;
  userId: string;
  userName: string;
}

export function useCanvasCollaboration({
  canvasId,
  userId,
  userName,
}: UseCanvasCollaborationOptions) {
  const managerRef = useRef<CanvasCollaborationManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<UserPresence[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeCollaboration = async () => {
      try {
        managerRef.current = new CanvasCollaborationManager(
          canvasId,
          userId,
          userName,
        );

        managerRef.current.on("connected", () => {
          setIsConnected(true);
          setError(null);
        });

        managerRef.current.on("disconnected", () => {
          setIsConnected(false);
        });

        managerRef.current.on("presence-update", (users: UserPresence[]) => {
          setCollaborators(users.filter((u) => u.userId !== userId));
        });

        managerRef.current.on("error", (err: Error) => {
          setError(err);
        });

        const serverUrl = getWebSocketUrl();
        await managerRef.current.connect(serverUrl);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    };

    initializeCollaboration();

    return () => {
      managerRef.current?.disconnect();
    };
  }, [canvasId, userId, userName]);

  const updateCursor = useCallback(
    (x: number, y: number, selectedElementId?: string) => {
      managerRef.current?.updateCursor(x, y, selectedElementId);
    },
    [],
  );

  const updateElement = useCallback((element: any) => {
    managerRef.current?.updateElement(element);
  }, []);

  return {
    isConnected,
    collaborators,
    error,
    updateCursor,
    updateElement,
    manager: managerRef.current,
  };
}
