// itsm-backend/lib/queue.js

// Completely disable queue functionality
export const aiQueue = {
  add: async () => {
    return true; // no-op
  }
};

// No Redis connection exported
export const connection = null;
