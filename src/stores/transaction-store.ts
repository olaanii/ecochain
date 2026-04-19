import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

export type Transaction = {
  id: string;
  hash: string;
  type: 'stake' | 'unstake' | 'claim' | 'bridge' | 'verify' | 'other';
  from?: string;
  to?: string;
  amount?: string;
  status: TransactionStatus;
  timestamp: Date;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  error?: string;
};

export type TransactionState = {
  transactions: Transaction[];
  queue: Transaction[];
};

export type TransactionActions = {
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addToQueue: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  removeFromQueue: (id: string) => void;
  processQueue: () => void;
  clearHistory: () => void;
  getTransactionByHash: (hash: string) => Transaction | undefined;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
};

type TransactionStore = TransactionState & TransactionActions;

const initialState: TransactionState = {
  transactions: [],
  queue: [],
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      addTransaction: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions].slice(0, 100), // Keep last 100
        }));
      },
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          queue: state.queue.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),
      removeTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
          queue: state.queue.filter((tx) => tx.id !== id),
        })),
      addToQueue: (tx) => {
        const newTx: Transaction = {
          ...tx,
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          status: 'pending',
        };
        set((state) => ({
          queue: [...state.queue, newTx],
        }));
      },
      removeFromQueue: (id) =>
        set((state) => ({
          queue: state.queue.filter((tx) => tx.id !== id),
        })),
      processQueue: () => {
        const queue = get().queue;
        if (queue.length === 0) return;
        
        // Move first item from queue to transactions
        const [firstTx, ...remainingQueue] = queue;
        set((state) => ({
          transactions: [firstTx, ...state.transactions].slice(0, 100),
          queue: remainingQueue,
        }));
      },
      clearHistory: () => set({ transactions: [], queue: [] }),
      getTransactionByHash: (hash) => {
        return get().transactions.find((tx) => tx.hash === hash);
      },
      getTransactionsByType: (type) => {
        return get().transactions.filter((tx) => tx.type === type);
      },
      getRecentTransactions: (limit = 10) => {
        return get().transactions.slice(0, limit);
      },
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);
