import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext.tsx';
import { useQuestions } from './hooks/useQuestions';
import { useComments } from './hooks/useComments';
import { useReplies } from './hooks/useReplies';
import { useSpamPrevention } from './hooks/useSpamPrevention';
import type { Category, Question, Comment } from './types';
import { Button, Card, cn } from './components/UI';
import { 
  Plus, 
  MessageSquare, 
  ArrowBigUp, 
  ArrowBigDown, 
  Sun,
  Moon,
  Hash,
  Send,
  Flame,
  Zap,
  X,
  User,
  Heart,
  ChevronLeft,
  Reply as ReplyIcon,
  Info,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getAnonymousUserId, getAnonymousIdentity } from './utils/names';

const CATEGORIES: (Category | 'All')[] = [
  'All', 
  'General', 
  'Sports', 
  'Spiritual', 
  'Technology', 
  'Life', 
  'Health', 
  'Business', 
  'Entertainment', 
  'Other'
];

function App() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const { questions, loading, createQuestion, vote } = useQuestions(selectedCategory);
  const { canPost, timeLeft, recordPost } = useSpamPrevention();
  
  // Navigation State
  const [view, setView] = useState<'feed' | 'detail'>('feed');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('General');
  const [isPosting, setIsPosting] = useState(false);

  const handleOpenDetail = (question: Question) => {
    setSelectedQuestion(question);
    setView('detail');
  };

  const handleBack = () => {
    setView('feed');
    setSelectedQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !canPost) return;

    setIsPosting(true);
    try {
      await createQuestion(newTitle, newCategory);
      setNewTitle('');
      recordPost();
      setIsModalOpen(false);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#0B0F1A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 w-full px-6 shrink-0 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view === 'detail' && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="rounded-full w-10 h-10 p-0">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
              <MessageSquare className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">Why</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsAboutOpen(true)} className="rounded-full w-10 h-10 p-0 text-slate-500 hover:text-indigo-600">
            <Info className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full w-10 h-10 p-0">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 w-full",
        view === 'feed' ? "px-6 py-8 overflow-y-auto" : "flex flex-col overflow-hidden"
      )}>
        {view === 'feed' ? (
          <div className="space-y-8 max-w-full">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F1A]/80 backdrop-blur-sm py-4 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-slate-800/50 -mx-6 px-6">
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-[-1px]"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-20 text-slate-400">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Hash className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500 font-medium">No questions found in this category.</p>
                </div>
              ) : (
                questions.map(question => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    onVote={vote} 
                    onClick={() => handleOpenDetail(question)}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <QuestionDetail 
            question={selectedQuestion!} 
            onVote={vote}
            onBack={handleBack}
          />
        )}
      </main>

      {view === 'feed' && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      {/* Raising Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
              <h2 className="text-xl font-bold">Raise a Question</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">What's your question?</label>
                <textarea
                  placeholder="Type your question here..."
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-lg resize-none min-h-[150px] focus:ring-2 focus:ring-indigo-500 transition-shadow outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.slice(1).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat as Category)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                          newCategory === cat
                            ? "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-3">
                  {!canPost && <span className="text-xs font-bold text-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">Wait {timeLeft}s</span>}
                  <Button disabled={!newTitle.trim() || !canPost || isPosting} size="lg" className="gap-2 shadow-xl shadow-indigo-200 dark:shadow-none">
                    <Plus className="w-5 h-5" /> Raise Question
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 space-y-6 animate-in zoom-in-95 duration-200 border-none bg-white/90 dark:bg-slate-900/90 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <button onClick={() => setIsAboutOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight">Why this application?</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We all have those questions. The ones that keep us up at night, the ones that sound "too simple," or the ones we're afraid to ask because of what people might think.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">This is a space for the "Why?".</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                As an anonymous platform, we let you see perspectives without the weight of perfection. Discuss it, find the funny side, and understand the depth of human curiosity. Use it wisely, ask boldly.
              </p>
            </div>
            <Button onClick={() => setIsAboutOpen(false)} className="w-full h-14 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none">
              Start Asking
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

// Question Card Component
function QuestionCard({ question, onVote, onClick }: { question: Question, onVote: any, onClick: () => void }) {
  const [useVote, setUseVote] = useState<number>(0);

  useEffect(() => {
    const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
    const myVote = votes[question.id];
    if (typeof myVote === 'number') setUseVote(myVote);
  }, [question.id]);

  const handleVote = (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    const votes = JSON.parse(localStorage.getItem('user_votes') || '{}');
    const current = votes[question.id] || 0;
    
    // Logic: If clicking same direction, remove vote (return to 0).
    // If clicking opposite direction, switch vote (-1 to 1 or 1 to -1).
    
    if (direction === 'up') {
      if (current === 1) {
        // Toggle off
        onVote(question.id, 'up', -1);
        votes[question.id] = 0;
      } else if (current === -1) {
        // Switch from down to up
        onVote(question.id, 'down', -1);
        onVote(question.id, 'up', 1);
        votes[question.id] = 1;
      } else {
        // Just upvote
        onVote(question.id, 'up', 1);
        votes[question.id] = 1;
      }
    } else {
      if (current === -1) {
        // Toggle off
        onVote(question.id, 'down', -1);
        votes[question.id] = 0;
      } else if (current === 1) {
        // Switch from up to down
        onVote(question.id, 'up', -1);
        onVote(question.id, 'down', 1);
        votes[question.id] = -1;
      } else {
        // Just downvote
        onVote(question.id, 'down', 1);
        votes[question.id] = -1;
      }
    }
    
    localStorage.setItem('user_votes', JSON.stringify(votes));
    setUseVote(votes[question.id]);
  };

  const isTrending = question.score > 8 || question.commentCount >= 5;
  const isHot = question.commentCount >= 10;
  const createdAt = question.createdAt instanceof Date ? question.createdAt : (question.createdAt as any)?.toDate();

  return (
    <Card 
      onClick={onClick} 
      className={cn(
        "flex flex-col hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300 h-full cursor-pointer group bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md relative overflow-hidden",
        isTrending && "ring-2 ring-orange-500/20 dark:ring-orange-500/10 border-orange-200 dark:border-orange-900/50 shadow-orange-100/50 dark:shadow-none bg-orange-50/10 dark:bg-orange-950/5"
      )}
    >
      {/* Visual Trending Indicator Line */}
      {isTrending && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-rose-500" />}

      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            {isTrending && (
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0 outline outline-4 outline-white dark:outline-slate-900",
                isHot ? "bg-orange-600 shadow-orange-200 dark:shadow-none animate-pulse" : "bg-orange-100 dark:bg-orange-900/40"
              )}>
                {isHot ? <Zap className="w-5 h-5 text-white fill-current" /> : <Flame className="w-5 h-5 text-orange-600 fill-current" />}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border dark:border-slate-700">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{question.author || 'Anonymous User'}</span>
                <span className="text-[10px] text-slate-500">
                  {createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'just now'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isHot && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-tighter rounded-md animate-bounce">
                Hot
              </span>
            )}
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-800/50">{question.category}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold leading-tight line-clamp-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{question.title}</h3>
      </div>
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-1">
          <button onClick={(e) => handleVote(e, 'up')} className={cn("p-2 rounded-lg transition-all", useVote === 1 ? "bg-orange-100 text-orange-600 dark:bg-orange-950/40" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800")}>
            <ArrowBigUp className={cn("w-6 h-6", useVote === 1 && "fill-current")} />
          </button>
          <span className={cn("font-black text-sm px-1 min-w-[28px] text-center", useVote === 1 ? "text-orange-600" : useVote === -1 ? "text-indigo-600" : "text-slate-700 dark:text-slate-300")}>{question.score}</span>
          <button onClick={(e) => handleVote(e, 'down')} className={cn("p-2 rounded-lg transition-all", useVote === -1 ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800")}>
            <ArrowBigDown className={cn("w-6 h-6", useVote === -1 && "fill-current")} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
          <MessageSquare className="w-5 h-5" />
          {question.commentCount || 0}
        </div>
      </div>
    </Card>
  );
}

// Question Detail View
function QuestionDetail({ question }: { question: Question, onVote: any, onBack: () => void }) {
  const { comments, loading, addComment, likeComment, deleteComment } = useComments(question.id);
  const [text, setText] = useState('');
  const createdAt = question.createdAt instanceof Date ? question.createdAt : (question.createdAt as any)?.toDate();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-[#0B0F1A] animate-in slide-in-from-right-4 duration-300 overflow-hidden">
      <div className="border-b dark:border-slate-800 bg-white/50 dark:bg-[#0B0F1A]/50 backdrop-blur-xl p-6 lg:p-10 shrink-0 z-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none">{question.author?.[0] || 'A'}</div>
               <div>
                 <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">{question.author || 'Anonymous'}</h2>
                 <p className="text-sm text-slate-500 font-medium">{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'just now'}</p>
               </div>
            </div>
            <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase tracking-widest rounded-full border border-indigo-200 dark:border-indigo-800">{question.category}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black leading-tight text-slate-900 dark:text-white">{question.title}</h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                <ArrowBigUp className="w-6 h-6 text-slate-400" />
                <span className="font-bold text-lg">{question.score}</span>
                <ArrowBigDown className="w-6 h-6 text-slate-400" />
             </div>
             <div className="flex items-center gap-2 text-slate-500 font-bold">
                <MessageSquare className="w-6 h-6" />
                {question.commentCount || 0} Discussions
             </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto thin-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10 pb-24">
          <div className="space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-700 dark:text-slate-300">Discussion Feed <span className="px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400">{question.commentCount || 0}</span></h3>
            <form onSubmit={handleAddComment} className="relative group">
              <textarea
                placeholder="Share your anonymous thoughts..."
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 pr-20 text-lg resize-none min-h-[140px] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none shadow-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" disabled={!text.trim()} className="absolute right-4 bottom-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-300 dark:shadow-none disabled:bg-slate-200 dark:disabled:bg-slate-800"><Send className="w-6 h-6" /></button>
            </form>
            <div className="space-y-8">
              {loading ? (
                <div className="text-center py-10 text-slate-400">Loading discussion...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 italic">No one has spoken yet. Be the first!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    questionId={question.id} 
                    onLike={(amt) => likeComment(comment.id, amt)} 
                    onDelete={() => deleteComment(comment.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Comment Item with Nested Replies
function CommentItem({ comment, questionId, onLike, onDelete }: { comment: Comment, questionId: string, onLike: (amt: number) => void, onDelete: () => void }) {
  const { replies, addReply, deleteReply } = useReplies(questionId, comment.id);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(() => {
    const likes = JSON.parse(localStorage.getItem('comment_likes') || '{}');
    return !!likes[comment.id];
  });
  
  const currentUserId = getAnonymousUserId();
  // For older comments without authorId, we check if the author name matches exactly (fallible but better than nothing)
  // In a real app we'd migrate data, but for this anonymous app we'll be slightly more permissive for the current session user
  const isAuthor = comment.authorId === currentUserId || (comment.author === getAnonymousIdentity() && !comment.authorId);

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('comment_likes') || '{}');
    if (isLiked) {
      onLike(-1);
      delete likes[comment.id];
    } else {
      onLike(1);
      likes[comment.id] = true;
    }
    localStorage.setItem('comment_likes', JSON.stringify(likes));
    setIsLiked(!isLiked);
  };

  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await addReply(replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  const createdAt = comment.createdAt instanceof Date ? comment.createdAt : (comment.createdAt as any)?.toDate();

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-800 relative group">
        
        {isAuthor && (
          <button 
            onClick={() => { if(window.confirm('Delete this comment and all its replies?')) onDelete(); }}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all hover:scale-110 shadow-sm border dark:border-slate-700"
            title="Delete your comment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border dark:border-slate-700"><User className="w-5 h-5 text-slate-400" /></div>
          <div className="flex-1 space-y-3 px-1">
            <div className="flex items-center gap-2">
               <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{comment.author || 'Anonymous'}</span>
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'just now'}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base italic">{comment.text}</p>
            <div className="flex items-center gap-6 pt-1">
               <button onClick={handleLike} className={cn("flex items-center gap-2 text-xs font-black transition-all hover:scale-110 active:scale-95", isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-500")}><Heart className={cn("w-4 h-4", isLiked && "fill-current")} />{comment.likes || 0}</button>
               <button onClick={() => setShowReplyForm(!showReplyForm)} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors"><ReplyIcon className="w-4 h-4" />{comment.repliesCount || 0} Replies</button>
            </div>
          </div>
        </div>
        {showReplyForm && (
          <form onSubmit={handleAddReply} className="mt-6 ml-4 lg:ml-12 flex gap-3 animate-in slide-in-from-top-2">
            <input type="text" autoFocus placeholder="What's your reply?" className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
            <Button size="sm" type="submit" disabled={!replyText.trim()} className="rounded-2xl px-6">Reply</Button>
          </form>
        )}
      </div>
      {replies.length > 0 && (
        <div className="ml-8 lg:ml-14 space-y-4 border-l-2 border-indigo-100 dark:border-indigo-900/40 pl-6 py-2">
          {replies.map(reply => (
            <div key={reply.id} className="bg-slate-50/80 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative shadow-sm hover:bg-white dark:hover:bg-slate-800/40 transition-colors group/reply">
              
              {(reply.authorId === currentUserId || (reply.author === getAnonymousIdentity() && !reply.authorId)) && (
                <button 
                  onClick={() => { if(window.confirm('Delete this reply?')) deleteReply(reply.id); }}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg transition-all hover:scale-110 shadow-sm"
                  title="Delete your reply"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="flex items-center gap-2 mb-2">
                 <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center"><User className="w-3 h-3 text-indigo-400" /></div>
                 <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{reply.author || 'Anonymous'}</span>
              </div>
              <p className="text-[15px] text-slate-600 dark:text-slate-200 leading-relaxed font-medium">{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
