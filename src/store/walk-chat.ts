import { create } from 'zustand';

export type WalkChatLayer = 'L1' | 'L2' | 'L3';
export type WalkChatBranch = 'A' | 'B';

export interface WalkChatMessage {
  id: string;
  role: 'companion' | 'system';
  content: string;
  timestamp: number;
  source?: 'geofence' | 'expand' | 'branch' | 'deep';
  snippetId?: string;
  companionId?: string;
  threadId?: string;
  layer?: WalkChatLayer;
  branch?: WalkChatBranch;
  hidden?: boolean;
}

interface WalkChatState {
  messages: WalkChatMessage[];
  addMessage: (message: Omit<WalkChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => string;
  hideThreadChildren: (threadId: string) => void;
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
          threadId: message.threadId,
          layer: message.layer,
          branch: message.branch,
          hidden: message.hidden,
        },
      ],
    }));
    return id;
  },
  hideThreadChildren: (threadId) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.threadId === threadId && message.layer !== 'L1'
          ? { ...message, hidden: true }
          : message,
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));
