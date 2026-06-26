import { create } from 'zustand';

export interface WalkChatMessage {
  id: string;
  role: 'companion' | 'system';
  content: string;
  timestamp: number;
  source?: 'geofence' | 'continue';
  /** 围栏 id */
  snippetId?: string;
  companionId?: string;
  jokeId?: string;
  jokeLabel?: string;
  /** 当前幕 0-based */
  actIndex?: number;
  actCount?: number;
  actLabel?: string;
  spotLabel?: string;
}

interface WalkChatState {
  messages: WalkChatMessage[];
  addMessage: (message: Omit<WalkChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => string;
  updateMessage: (id: string, patch: Partial<WalkChatMessage>) => void;
  clearMessages: () => void;
}

export const useWalkChatStore = create<WalkChatState>((set) => ({
  messages: [],
  addMessage: (message) => {
    const id = message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id,
          timestamp: message.timestamp ?? Date.now(),
          role: message.role,
          content: message.content,
          source: message.source,
          snippetId: message.snippetId,
          companionId: message.companionId,
          jokeId: message.jokeId,
          jokeLabel: message.jokeLabel,
          actIndex: message.actIndex,
          actCount: message.actCount,
          actLabel: message.actLabel,
          spotLabel: message.spotLabel,
        },
      ],
    }));
    return id;
  },
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));
