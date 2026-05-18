import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const MemoryService = {
  async addMemory(userId: string, content: string, type: 'conversation' | 'file' | 'screenshot' | 'voice' | 'code', metadata: any = {}) {
    const path = 'memories';
    try {
      return await addDoc(collection(db, path), {
        userId,
        content,
        type,
        timestamp: serverTimestamp(),
        metadata
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  subscribeToMemories(userId: string, callback: (memories: any[]) => void) {
    const path = 'memories';
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snapshot) => {
      const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(memories);
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, path);
    });
  }
};

export const ChatService = {
  async createConversation(userId: string, title: string, agentId: string = 'nexus') {
    const path = 'conversations';
    try {
      return await addDoc(collection(db, path), {
        userId,
        title,
        agentId,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async getLatestConversationForAgent(userId: string, agentId: string) {
    const path = 'conversations';
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      where('agentId', '==', agentId),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
    try {
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    if (!content) return;
    const path = `conversations/${conversationId}/messages`;
    try {
      // Update parent updatedAt
      await updateDoc(doc(db, 'conversations', conversationId), {
        updatedAt: serverTimestamp(),
        lastMessage: content.substring(0, 100)
      });
      
      return await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        role,
        content,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  subscribeToMessages(conversationId: string, callback: (messages: any[]) => void) {
    const path = `conversations/${conversationId}/messages`;
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, path);
    });
  }
};
