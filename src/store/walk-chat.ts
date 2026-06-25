import { create } from 'zustand';

export interface WalkChatMessage {
  id: string;
  role: 'companion' | 'system';
  content: string;
  timestamp: number;
  source?: 'geofence' | 'tap';
}

interface WalkChatState {
  messages: WalkChatMessage[];
  addMessage: (message: Omit<WalkChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  clearMessages: () => void;
}

export const useWalkChatStore = create<WalkChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: message.timestamp ?? Date.now(),
          role: message.role,
          content: message.content,
          source: message.source,
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));
