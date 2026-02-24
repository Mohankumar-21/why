import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Reply } from '../types';
import { getAnonymousIdentity } from '../utils/names';

export function useReplies(questionId: string, commentId: string) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId || !commentId) return;

    const q = query(
      collection(db, 'questions', questionId, 'comments', commentId, 'replies'), 
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as unknown as Reply[];
      
      setReplies(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [questionId, commentId]);

  const addReply = async (text: string) => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'questions', questionId, 'comments', commentId, 'replies'), {
      text,
      author: getAnonymousIdentity(),
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'questions', questionId, 'comments', commentId), {
      repliesCount: increment(1)
    });
  };

  return { replies, loading, addReply };
}
