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
import { Comment } from '../types';
import { getAnonymousIdentity } from '../utils/names';

export function useComments(questionId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;

    const q = query(
      collection(db, 'questions', questionId, 'comments'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as unknown as Comment[];
      
      setComments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [questionId]);

  const addComment = async (text: string) => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'questions', questionId, 'comments'), {
      text,
      author: getAnonymousIdentity(),
      createdAt: serverTimestamp(),
      likes: 0,
      repliesCount: 0
    });

    await updateDoc(doc(db, 'questions', questionId), {
      commentCount: increment(1)
    });
  };

  const likeComment = async (commentId: string, amount: number) => {
    const commentRef = doc(db, 'questions', questionId, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: increment(amount)
    });
  };

  return { comments, loading, addComment, likeComment };
}
