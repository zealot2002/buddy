import { create } from 'zustand';

export type WalkChatLayer = 'L1' | 'L2' | 'L3';
export type WalkChatBranch = 'A' | 'B';
export type WalkCardAct = 0 | 1 | 2;

export interface WalkCardLayers {
  l1: string;
  l2A?: string;
  l2B?: string;
  l3?: string;
  l2ALabel?: string;
  l2BLabel?: string;
}

export interface WalkChatMessage {
  id: string;
  role: 'companion' | 'system';
  content: string;
  timestamp: number;
  source?: 'geofence' | 'expand' | 'branch' | 'deep';
  snippetId?: string;
  companionId?: string;
  layer?: WalkChatLayer;
  branch?: WalkChatBranch;
  /** 卡片内当前幕：0=L1, 1=L2, 2=L3 */
  cardAct?: WalkCardAct;
  layers?: WalkCardLayers;
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
          layer: message.layer,
          branch: message.branch,
          cardAct: message.cardAct,
          layers: message.layers,
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
