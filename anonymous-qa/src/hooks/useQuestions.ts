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
import { Question, Category, SortOption } from '../types';
import { getAnonymousIdentity } from '../utils/names';

export function useQuestions(category: Category | 'All' = 'All', sortBy: SortOption = 'Trending') {
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
      
      // Dynamic Sorting
      filtered.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : (a.createdAt as any).toDate();
        const bDate = b.createdAt instanceof Date ? b.createdAt : (b.createdAt as any).toDate();

        switch (sortBy) {
          case 'Recent':
            return bDate.getTime() - aDate.getTime();
          case 'Oldest':
            return aDate.getTime() - bDate.getTime();
          case 'Top':
            return (b.score || 0) - (a.score || 0);
          case 'Most Discussed':
            return (b.commentCount || 0) - (a.commentCount || 0);
          case 'Trending':
          default:
            // score + (commentCount * 2) provides a balanced view of approval + engagement
            const aTrending = (a.score || 0) + ((a.commentCount || 0) * 2);
            const bTrending = (b.score || 0) + ((b.commentCount || 0) * 2);
            const trendDiff = bTrending - aTrending;
            if (trendDiff !== 0) return trendDiff;
            return bDate.getTime() - aDate.getTime();
        }
      });
      
      setQuestions(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [category, sortBy]);

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
