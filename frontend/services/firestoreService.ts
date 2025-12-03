import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Message } from "../types";

// Helper to get ref: users/{uid}/history
const getHistoryRef = (uid: string) => collection(db, 'users', uid, 'history');

export const saveMessageToHistory = async (uid: string, message: Message) => {
  if (!uid) return;
  try {
    // We do not await this to keep UI snappy, handled in background
    addDoc(getHistoryRef(uid), {
      ...message,
      timestamp: serverTimestamp(), // Server time is truth
      localTimestamp: message.timestamp // Keep local time for immediate UI consistency
    });
  } catch (error) {
    console.error("Firestore Save Error:", error);
  }
};

export const subscribeToHistory = (uid: string, callback: (messages: Message[]) => void) => {
  if (!uid) {
    return () => {};
  }

  const q = query(getHistoryRef(uid), orderBy('timestamp', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs: Message[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        content: data.content,
        image: data.image,
        timestamp: data.localTimestamp || Date.now(), // Fallback
        metadata: data.metadata
      } as Message;
    });
    callback(msgs);
  }, (error) => {
    // Handle Permission Errors Gracefully
    if (error.code === 'permission-denied') {
      console.error("Firestore Permission Denied. Check Security Rules for uid:", uid);
    } else {
      console.error("Firestore Subscription Error:", error);
    }
  });

  return unsubscribe;
};
