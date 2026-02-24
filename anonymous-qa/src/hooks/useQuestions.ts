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
import { Question, Category } from '../types';
import { getAnonymousIdentity } from '../utils/names';

export function useQuestions(category: Category | 'All' = 'All') {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as unknown as Question[];
      
      let filtered = docs;
      if (category !== 'All') {
        filtered = docs.filter(q => q.category === category);
      }
      
      // Sort by score (descending) as primary, createdAt as secondary
      filtered.sort((a, b) => {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
        
        const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate();
        const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate();
        return bDate.getTime() - aDate.getTime();
      });
      
      setQuestions(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category]);

  const createQuestion = async (title: string, category: Category) => {
    await addDoc(collection(db, 'questions'), {
      title,
      category,
      author: getAnonymousIdentity(),
      createdAt: serverTimestamp(),
      commentCount: 0,
      upvotes: 0,
      downvotes: 0,
      score: 0,
    });
  };

  const vote = async (questionId: string, direction: 'up' | 'down', amount: number) => {
    const questionRef = doc(db, 'questions', questionId);
    await updateDoc(questionRef, {
      [direction === 'up' ? 'upvotes' : 'downvotes']: increment(amount),
      score: increment(direction === 'up' ? amount : -amount)
    });
  };

  return { questions, loading, createQuestion, vote };
}
