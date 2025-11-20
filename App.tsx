import React, { useState, useEffect } from 'react';
import { Star, Calendar as CalendarIcon, ShoppingBag, Settings, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Zap, User, Edit3, Circle, X, Smile, BrainCircuit, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_TASKS, INITIAL_REWARDS } from './constants';
import { Task, Reward, TaskCategory, Transaction } from './types';

// --- Constants for UI ---
const COMMON_EMOJIS = [
  '📺', '🎮', '🍦', '🍬', '🍟', '🍔', 
  '🎡', '🪁', '🧸', '⚽', '🛹', '🎨',
  '📚', '🧩', '🎸', '🚲', '🏊', '🎁',
  '🧹', '🛏️', '🛁', '🦷', '🎒', '⏰',
  '🦄', '🦕', '🚀', '👑', '🌈', '🍩'
];

// --- Theme Colors (Candy Kingdom) ---
const THEME = {
  primary: 'from-pink-400 to-purple-400',
  bg: 'bg-[#FFF9F0]',
  cardBg: 'bg-white',
  text: 'text-slate-700',
  heading: 'text-slate-800',
  categories: {
    [TaskCategory.LIFE]: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', iconBg: 'bg-lime-400', accent: 'text-lime-500' },
    [TaskCategory.BEHAVIOR]: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconBg: 'bg-sky-400', accent: 'text-sky-500' },
    [TaskCategory.BONUS]: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconBg: 'bg-amber-400', accent: 'text-amber-500' },
    [TaskCategory.PENALTY]: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-400', accent: 'text-rose-500' },
  }
};

// --- Sub-Components ---

const Header = ({ balance, userName }: { balance: number, userName: string }) => (
  <div className={`bg-gradient-to-b ${THEME.primary} text-white p-4 pt-8 rounded-b-[2.5rem] shadow-xl sticky top-0 z-20`}>
    <div className="flex justify-between items-center max-w-5xl mx-auto px-2">
      <div>
        <h1 className="text-2xl font-cute tracking-wide drop-shadow-sm">
          {userName ? `${userName}的` : '小小'}星系 🦄
        </h1>
        <p className="text-pink-100 text-sm font-medium opacity-90 mt-1">今天也要棒棒的！</p>
      </div>
      <div className="flex items-center bg-white/25 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-white/40 shadow-lg transform hover:scale-105 transition-transform">
        <span className="text-3xl font-cute text-yellow-300 drop-shadow-md mr-2">{balance}</span>
        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" />
      </div>
    </div>
  </div>
);

const DateNavigator = ({ date, setDate }: { date: Date, setDate: (d: Date) => void }) => {
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return `${m}月${day}日 星期${week}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm mx-auto mt-4 mb-4 border-2 border-purple-50 max-w-xs">
      <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-purple-50 rounded-full text-purple-400 transition-colors">
        <ChevronLeft size={20} strokeWidth={3} />
      </button>
      <span className="font-cute text-lg text-purple-800">{formatDate(date)}</span>
      <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-purple-50 rounded-full text-purple-400 transition-colors">
        <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
};

// --- Celebration Overlay Component ---
const CelebrationOverlay = ({ isVisible, points, type }: { isVisible: boolean, points: number, type: 'success' | 'penalty' }) => {
  if (!isVisible) return null;

  const isPenalty = type === 'penalty';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
      {/* Dim background */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-out" style={{ animationDuration: '1.2s', animationDelay: '0.8s', animationFillMode: 'forwards' }}></div>
      
      {/* Animation Container */}
      <div className="relative animate-star-enter z-10 flex flex-col items-center justify-center">
        
        {/* Glow */}
        <div className={`absolute inset-0 rounded-full blur-3xl w-80 h-80 animate-pulse ${isPenalty ? 'bg-rose-400/20' : 'bg-yellow-400/30'}`}></div>
        
        {/* Main Icon */}
        <div className="relative mb-4">
           {isPenalty ? (
             <div className="relative">
                 <Zap size={140} className="text-rose-400 fill-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)] animate-float" strokeWidth={1.5} />
                 <Star size={40} className="absolute -top-2 right-0 text-rose-200 fill-rose-200 animate-bounce" />
             </div>
           ) : (
             <div className="relative">
                <Star size={160} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-float" strokeWidth={1.5} />
                {/* Little Stars */}
                <Star size={48} className="absolute -top-6 -right-6 text-amber-300 fill-amber-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <Star size={36} className="absolute bottom-2 -left-8 text-yellow-200 fill-yellow-200 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <Star size={40} className="absolute -bottom-4 right-0 text-orange-300 fill-orange-300 animate-bounce" style={{ animationDelay: '0.3s' }} />
             </div>
           )}
           
           {/* Points Text */}
           <div className="absolute inset-0 flex items-center justify-center pt-2">
              <span className={`font-cute text-6xl drop-shadow-lg tracking-tighter ${isPenalty ? 'text-white' : 'text-white'}`}>
                {points > 0 ? `+${points}` : points}
              </span>
           </div>
        </div>

        {/* Text */}
        <div className="mt-4 font-cute text-5xl text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)] tracking-widest stroke-2 animate-pulse">
          {isPenalty ? '继续加油!' : '太棒了!'}
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'store' | 'calendar' | 'settings'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State
  const [userName, setUserName] = useState(() => localStorage.getItem('app_username') || '');
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('app_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [rewards, setRewards] = useState<Reward[]>(() => {
    const saved = localStorage.getItem('app_rewards');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  const [logs, setLogs] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('app_logs');
    return saved ? JSON.parse(saved) : {};
  });

  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('app_balance');
    return saved ? parseInt(saved) : 0;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(!localStorage.getItem('app_username'));
  
  // Celebration State
  const [showCelebration, setShowCelebration] = useState<{show: boolean, points: number, type: 'success' | 'penalty'}>({ 
    show: false, 
    points: 0, 
    type: 'success' 
  });
  
  // Form States
  const [newTask, setNewTask] = useState<{title: string, stars: number, category: TaskCategory}>({
    title: '', stars: 2, category: TaskCategory.LIFE
  });
  const [newReward, setNewReward] = useState<{title: string, cost: number, icon: string}>({
    title: '', cost: 50, icon: '🎁'
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('app_username', userName), [userName]);
  useEffect(() => localStorage.setItem('app_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('app_rewards', JSON.stringify(rewards)), [rewards]);
  useEffect(() => localStorage.setItem('app_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('app_balance', balance.toString()), [balance]);
  useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);

  // Celebration Timer
  useEffect(() => {
    if (showCelebration.show) {
      const timer = setTimeout(() => {
        setShowCelebration(prev => ({ ...prev, show: false }));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration.show]);

  // Helpers
  const getDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const triggerStarConfetti = () => {
    // Fire stars from the center
    const duration = 1200;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 40, spread: 360, ticks: 80, zIndex: 150 };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      
      // Center burst
      confetti({
        ...defaults, 
        particleCount,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['star'],
        colors: ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C'], // Golds and Yellows
        scalar: 1.2,
        drift: 0,
        gravity: 0.8
      });
    }, 200);
  };

  const triggerPenaltyConfetti = () => {
    confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fda4af', '#e2e8f0', '#64748b'],
        disableForReducedMotion: true,
        gravity: 1.2,
        scalar: 0.8,
        shapes: ['circle']
      });
  };

  const updateBalance = (amount: number, description: string, dateContext?: Date) => {
    setBalance(prev => prev + amount);
    
    let txDate = new Date();
    if (dateContext) {
        txDate = new Date(dateContext);
        const now = new Date();
        txDate.setHours(now.getHours());
        txDate.setMinutes(now.getMinutes());
        txDate.setSeconds(now.getSeconds());
        txDate.setMilliseconds(now.getMilliseconds());
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: txDate.toISOString(),
      description,
      amount,
      type: amount > 0 ? 'EARN' : amount < 0 && description.includes('兑换') ? 'SPEND' : 'PENALTY'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const toggleTask = (task: Task) => {
    const dateKey = getDateKey(currentDate);
    const currentLog = logs[dateKey] || [];
    const isCompleted = currentLog.includes(task.id);

    let newLog;
    if (isCompleted) {
      // Undo
      newLog = currentLog.filter(id => id !== task.id);
      updateBalance(-task.stars, `撤销: ${task.title}`, currentDate);
    } else {
      // Complete
      newLog = [...currentLog, task.id];
      updateBalance(task.stars, `完成: ${task.title}`, currentDate);
      
      // Trigger celebration
      if (task.category === TaskCategory.PENALTY) {
        setShowCelebration({ show: true, points: task.stars, type: 'penalty' });
        triggerPenaltyConfetti();
      } else {
        setShowCelebration({ show: true, points: task.stars, type: 'success' });
        triggerStarConfetti();
      }
    }

    setLogs({ ...logs, [dateKey]: newLog });
  };

  const redeemReward = (reward: Reward) => {
    if (balance >= reward.cost) {
      if (window.confirm(`确定要花费 ${reward.cost} 星星兑换 "${reward.title}" 吗？`)) {
        updateBalance(-reward.cost, `兑换: ${reward.title}`);
        // Simple confetti for spending
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF7EB3', '#7AFCB0', '#7FD8FE']
        });
      }
    } else {
      alert(`星星不够哦！还需要 ${reward.cost - balance} 颗星星。加油！`);
    }
  };

  // Handlers for Modals
  const handleSaveTask = () => {
    if (!newTask.title.trim()) return alert("请输入任务名称");
    setTasks([...tasks, { 
      id: Date.now().toString(), 
      title: newTask.title, 
      stars: newTask.stars, 
      category: newTask.category 
    }]);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', stars: 2, category: TaskCategory.LIFE }); // Reset
  };

  const handleSaveReward = () => {
    if (!newReward.title.trim()) return alert("请输入奖励名称");
    setRewards([...rewards, {
      id: Date.now().toString(),
      title: newReward.title,
      cost: newReward.cost,
      icon: newReward.icon
    }]);
    setIsRewardModalOpen(false);
    setNewReward({ title: '', cost: 50, icon: '🎁' }); // Reset
  };

  // Calculated Values for Views
  const dateKey = getDateKey(currentDate);
  const dailyTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return getDateKey(txDate) === dateKey;
  });
  const dailyEarned = dailyTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const dailySpent = dailyTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Render Helpers
  const renderTaskList = (category: TaskCategory) => {
    const categoryTasks = tasks.filter(t => t.category === category);
    const completedIds = logs[dateKey] || [];
    const theme = THEME.categories[category];

    if (categoryTasks.length === 0) return null;

    return (
      <div className="mb-6 animate-slide-up">
        <h3 className={`font-cute text-lg mb-3 px-2 flex items-center ${theme.text}`}>
          <span className={`mr-2 p-1.5 rounded-xl ${theme.iconBg} text-white shadow-sm transform -rotate-6`}>
            {category === TaskCategory.LIFE && <Smile size={18} />}
            {category === TaskCategory.BEHAVIOR && <BrainCircuit size={18} />}
            {category === TaskCategory.BONUS && <Heart size={18} />}
            {category === TaskCategory.PENALTY && <Zap size={18} />}
          </span>
          {category}
        </h3>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {categoryTasks.map(task => {
              const isDone = completedIds.includes(task.id);
              const isPenalty = task.category === TaskCategory.PENALTY;
              
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className={`
                    relative overflow-hidden p-3 pl-4 rounded-[1.2rem] border-2 transition-all duration-300 bounce-click cursor-pointer flex justify-between items-center min-h-[70px] group
                    ${isDone 
                      ? (isPenalty ? 'bg-rose-100 border-rose-400 shadow-inner' : 'bg-lime-100 border-lime-400 shadow-inner opacity-90 scale-[0.98]') 
                      : `${theme.bg} ${theme.border} shadow-[0_3px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 bg-white`}
                  `}
                >
                    <div className="flex items-center gap-4 z-10 flex-1">
                         {/* Checkbox Visual */}
                        <div className={`
                            w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-300
                        `}>
                            {isDone ? (
                                isPenalty 
                                    ? <div className="bg-rose-500 rounded-full w-7 h-7 flex items-center justify-center text-white shadow-md animate-pop"><XCircle size={18} strokeWidth={3} /></div>
                                    : <div className="bg-lime-500 rounded-full w-7 h-7 flex items-center justify-center text-white shadow-md animate-pop"><CheckCircle2 size={18} strokeWidth={3} /></div>
                            ) : (
                                <Circle size={28} className="text-slate-300 group-hover:text-slate-400 transition-colors" strokeWidth={1.5} />
                            )}
                        </div>
                        
                        {/* Text */}
                        <span className={`font-bold text-lg leading-tight ${isDone ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-700'}`}>{task.title}</span>
                    </div>
                    <div className={`font-cute text-xl z-10 ml-2 ${isPenalty ? 'text-rose-500' : 'text-amber-400 drop-shadow-sm'}`}>
                        {task.stars > 0 ? `+${task.stars}` : task.stars}
                    </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] pb-28">
      {/* Celebration Overlay */}
      <CelebrationOverlay isVisible={showCelebration.show} points={showCelebration.points} type={showCelebration.type} />

      {/* Top Bar */}
      <Header balance={balance} userName={userName} />

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto pt-2 px-4 md:px-6">
        
        {/* --- DAILY VIEW --- */}
        {activeTab === 'daily' && (
          <>
            <DateNavigator date={currentDate} setDate={setCurrentDate} />
            <div className="pb-6">
                {renderTaskList(TaskCategory.LIFE)}
                {renderTaskList(TaskCategory.BEHAVIOR)}
                {renderTaskList(TaskCategory.BONUS)}
                {renderTaskList(TaskCategory.PENALTY)}
                
                {tasks.length === 0 && (
                    <div className="text-center p-12 text-slate-300 bg-white/50 rounded-[2.5rem] border-4 border-dashed border-slate-200 mt-8">
                        <div className="text-5xl mb-4 opacity-50">🎈</div>
                        <p className="font-cute text-lg">还没有任务哦，去设置里添加一些吧！</p>
                    </div>
                )}
            </div>
          </>
        )}

        {/* --- STORE VIEW --- */}
        {activeTab === 'store' && (
          <div className="py-4 animate-slide-up">
            <h2 className="text-xl font-cute text-purple-800 mb-4 flex items-center ml-2">
                <span className="bg-purple-100 p-2 rounded-xl mr-3 shadow-sm rotate-3"><ShoppingBag className="text-purple-500 w-5 h-5" /></span>
                兑换商城
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {rewards.map(reward => (
                    <div key={reward.id} className="bg-white rounded-[1.8rem] p-4 flex flex-col items-center shadow-[0_4px_0_0_rgba(0,0,0,0.04)] border-2 border-slate-100 relative overflow-hidden hover:border-purple-200 transition-all duration-300 group">
                        <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{reward.icon}</div>
                        <h3 className="font-bold text-slate-700 text-center mb-2 text-base h-10 flex items-center justify-center leading-snug">{reward.title}</h3>
                        <button 
                            onClick={() => redeemReward(reward)}
                            className={`
                                w-full py-2 rounded-xl font-cute text-lg text-white flex items-center justify-center gap-2 transition-all bounce-click shadow-md
                                ${balance >= reward.cost 
                                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 shadow-purple-200' 
                                    : 'bg-slate-200 cursor-not-allowed text-slate-400'}
                            `}
                            disabled={balance < reward.cost}
                        >
                            <span>{reward.cost}</span>
                            <Star size={16} fill="currentColor" />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* --- CALENDAR/HISTORY VIEW --- */}
        {activeTab === 'calendar' && (
           <div className="py-4 animate-slide-up max-w-3xl mx-auto">
               <h2 className="text-xl font-cute text-blue-800 mb-4 flex items-center ml-2">
                   <span className="bg-blue-100 p-2 rounded-xl mr-3 shadow-sm -rotate-3"><CalendarIcon className="text-blue-500 w-5 h-5" /></span>
                   积分记录
               </h2>
               
               <DateNavigator date={currentDate} setDate={setCurrentDate} />

               <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-lime-100 p-4 rounded-[1.8rem] border-2 border-lime-200 flex flex-col items-center shadow-sm">
                       <span className="text-lime-700 text-sm font-bold mb-1">今日获得</span>
                       <span className="text-3xl font-cute text-lime-600 drop-shadow-sm">+{dailyEarned}</span>
                   </div>
                   <div className="bg-rose-100 p-4 rounded-[1.8rem] border-2 border-rose-200 flex flex-col items-center shadow-sm">
                       <span className="text-rose-600 text-sm font-bold mb-1">今日消费</span>
                       <span className="text-3xl font-cute text-rose-500 drop-shadow-sm">-{dailySpent}</span>
                   </div>
               </div>

               <div className="bg-white rounded-[1.8rem] p-5 shadow-sm border-2 border-slate-100">
                   <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 当日明细
                   </h3>
                   <div className="space-y-3">
                        {dailyTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-bold text-slate-700 text-base mb-0.5">{tx.description}</p>
                                    <p className="text-xs text-slate-400 font-medium">{new Date(tx.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`font-cute text-xl ${tx.amount > 0 ? 'text-lime-500' : 'text-rose-500'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        ))}
                        {dailyTransactions.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-200 text-5xl mb-2">🍃</p>
                                <p className="text-slate-400 text-sm">静悄悄的，没有记录哦</p>
                            </div>
                        )}
                   </div>
               </div>
           </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {activeTab === 'settings' && (
            <div className="py-4 pb-20 animate-slide-up">
                <h2 className="text-xl font-cute text-slate-700 mb-4 flex items-center ml-2">
                    <span className="bg-slate-200 p-2 rounded-xl mr-3 shadow-sm"><Settings className="text-slate-600 w-5 h-5" /></span>
                    设置管理
                </h2>

                {/* User Profile Settings */}
                 <div className="bg-white rounded-[1.8rem] p-4 mb-6 shadow-sm border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2.5 rounded-full">
                            <User size={22} className="text-purple-500" />
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">小朋友名字</div>
                            <div className="text-lg font-cute text-slate-700">{userName || "未设置"}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsNameModalOpen(true)}
                        className="bg-slate-100 p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                        <Edit3 size={18} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5 items-start">
                    {/* Task Management */}
                    <div>
                        <div className="flex justify-between items-center mb-2 px-2">
                            <h3 className="font-bold text-slate-600 text-base">任务列表</h3>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)} 
                                className="text-white bg-lime-400 p-2 rounded-xl shadow-lime-200 shadow-md hover:bg-lime-500 transition-all"
                            >
                                <Plus size={20}/>
                            </button>
                        </div>
                        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                            {tasks.map(t => (
                                <div key={t.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold mr-2 align-middle ${THEME.categories[t.category].bg} ${THEME.categories[t.category].text}`}>
                                            {t.category}
                                        </span>
                                        <span className="text-slate-700 font-bold text-sm align-middle">{t.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-cute text-base ${t.stars > 0 ? 'text-amber-400' : 'text-rose-400'}`}>{t.stars > 0 ? '+' : ''}{t.stars}</span>
                                        <button onClick={() => {
                                            if(window.confirm("删除此任务?")) setTasks(tasks.filter(x => x.id !== t.id));
                                        }} className="text-slate-300 hover:text-rose-400 p-1.5"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reward Management */}
                    <div>
                         <div className="flex justify-between items-center mb-2 px-2">
                            <h3 className="font-bold text-slate-600 text-base">奖励列表</h3>
                            <button 
                                onClick={() => setIsRewardModalOpen(true)} 
                                className="text-white bg-purple-400 p-2 rounded-xl shadow-purple-200 shadow-md hover:bg-purple-500 transition-all"
                            >
                                <Plus size={20}/>
                            </button>
                        </div>
                        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                            {rewards.map(r => (
                                <div key={r.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{r.icon}</span>
                                        <span className="text-slate-700 font-bold text-sm">{r.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-cute text-base text-purple-500 flex items-center gap-1">{r.cost} <Star size={12} fill="currentColor"/></span>
                                        <button onClick={() => {
                                            if(window.confirm("删除此奖励?")) setRewards(rewards.filter(x => x.id !== r.id));
                                        }} className="text-slate-300 hover:text-rose-400 p-1.5"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Reset Data */}
                <button 
                    onClick={() => {
                        if(window.confirm("警告：这将清空所有数据！确定吗？")) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="w-full mt-10 p-3 text-rose-400 text-sm font-bold bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-100"
                >
                    重置所有数据 (慎用)
                </button>
            </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 z-30">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white max-w-2xl mx-auto px-6 h-20 flex justify-between items-center">
            <NavBtn icon={<CheckCircle2 />} label="打卡" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} color="text-lime-500" />
            <NavBtn icon={<ShoppingBag />} label="商城" active={activeTab === 'store'} onClick={() => setActiveTab('store')} color="text-purple-500" />
            <NavBtn icon={<CalendarIcon />} label="记录" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} color="text-blue-500" />
            <NavBtn icon={<Settings />} label="设置" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} color="text-slate-500" />
        </div>
      </nav>

      {/* --- MODALS --- */}

      {/* Name Entry Modal */}
      {isNameModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
              <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 text-center animate-pop border-4 border-purple-100">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
                      <User size={40} className="text-purple-500" />
                  </div>
                  <h2 className="font-cute text-2xl text-slate-800 mb-2">欢迎来到小小星系!</h2>
                  <p className="text-slate-500 mb-6 text-base">告诉星星你叫什么名字吧？</p>
                  <input 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="输入你的名字"
                    className="w-full bg-slate-50 border-2 border-purple-200 rounded-xl p-3 text-center text-xl font-bold text-slate-700 outline-none focus:border-purple-400 mb-6"
                  />
                  <button 
                    disabled={!userName.trim()}
                    onClick={() => setIsNameModalOpen(false)}
                    className={`w-full py-3 rounded-xl font-cute text-xl text-white shadow-xl transition-transform hover:scale-105 active:scale-95 ${!userName.trim() ? 'bg-slate-300' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}
                  >
                      开始探险！🚀
                  </button>
              </div>
          </div>
      )}
      
      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border-4 border-white">
                <div className="p-4 bg-lime-50 flex justify-between items-center">
                    <h3 className="font-cute text-xl text-lime-700">✨ 添加新任务</h3>
                    <button onClick={() => setIsTaskModalOpen(false)} className="bg-white p-1.5 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">任务名称</label>
                        <input 
                            autoFocus
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-lime-300 outline-none transition-all text-lg font-bold text-slate-700 placeholder-slate-300"
                            placeholder="例如：自己收拾书包"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">选择类别</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(TaskCategory).map(cat => {
                                const isActive = newTask.category === cat;
                                const theme = THEME.categories[cat];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            let defaultStars = 2;
                                            if(cat === TaskCategory.BONUS) defaultStars = 5;
                                            if(cat === TaskCategory.PENALTY) defaultStars = -5;
                                            setNewTask({...newTask, category: cat, stars: defaultStars});
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                                            isActive
                                            ? `${theme.bg} ${theme.border} ${theme.text} shadow-sm scale-105`
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">
                            {newTask.category === TaskCategory.PENALTY ? '扣除星星' : '奖励星星'}
                        </label>
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-4">
                            <input 
                                type="range"
                                min={newTask.category === TaskCategory.PENALTY ? -20 : 1}
                                max={newTask.category === TaskCategory.PENALTY ? -1 : 20}
                                value={newTask.stars}
                                onChange={e => setNewTask({...newTask, stars: parseInt(e.target.value)})}
                                className={`flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-${newTask.category === TaskCategory.PENALTY ? 'rose' : 'amber'}-400`}
                            />
                            <div className={`w-14 h-10 rounded-lg flex items-center justify-center font-cute text-xl bg-white shadow-sm border ${newTask.stars > 0 ? 'text-amber-400 border-amber-100' : 'text-rose-400 border-rose-100'}`}>
                                {newTask.stars > 0 ? '+' : ''}{newTask.stars}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveTask}
                        className="w-full py-3.5 bg-lime-400 hover:bg-lime-500 text-white rounded-xl font-cute text-lg shadow-lg shadow-lime-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        保存任务
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reward Modal */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
             <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border-4 border-white">
                <div className="p-4 bg-purple-50 flex justify-between items-center">
                    <h3 className="font-cute text-xl text-purple-700">🎁 添加新奖励</h3>
                    <button onClick={() => setIsRewardModalOpen(false)} className="bg-white p-1.5 rounded-full text-slate-400 hover:text-slate-600 shadow-sm"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">奖励名称</label>
                        <input 
                            autoFocus
                            value={newReward.title}
                            onChange={e => setNewReward({...newReward, title: e.target.value})}
                            className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-purple-300 outline-none transition-all text-lg font-bold text-slate-700 placeholder-slate-300"
                            placeholder="例如：看30分钟电视"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">选择图标</label>
                        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border-2 border-slate-100">
                            {COMMON_EMOJIS.map(icon => (
                                <button 
                                    key={icon}
                                    onClick={() => setNewReward({...newReward, icon})}
                                    className={`text-xl p-1.5 rounded-lg hover:bg-white transition-all ${newReward.icon === icon ? 'bg-white shadow-md ring-2 ring-purple-200 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-slate-400 font-bold uppercase mb-2 ml-2">兑换花费</label>
                        <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-4">
                            <input 
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={newReward.cost}
                                onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value)})}
                                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-400"
                            />
                            <div className="flex items-center justify-center gap-1 w-16 h-10 rounded-lg bg-white shadow-sm border border-purple-100">
                                <span className="font-cute text-xl text-purple-500">{newReward.cost}</span>
                                <Star size={14} className="text-purple-500 fill-purple-500" />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveReward}
                        className="w-full py-3.5 bg-purple-400 hover:bg-purple-500 text-white rounded-xl font-cute text-lg shadow-lg shadow-purple-200 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        保存奖励
                    </button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
}

const NavBtn = ({ icon, label, active, onClick, color }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, color?: string }) => {
    // Default color fallback
    const activeColorClass = color || 'text-orange-500';
    
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-16 transition-all duration-300 group ${active ? '-translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${active ? `${activeColorClass.replace('text-', 'bg-').replace('500', '100')} shadow-sm rotate-3 scale-110` : 'group-hover:bg-slate-50'}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { 
                    size: 24, 
                    strokeWidth: active ? 3 : 2.5,
                    className: active ? activeColorClass : "currentColor"
                })}
            </div>
            <span className={`text-[10px] font-bold mt-1 transition-opacity duration-300 ${active ? `opacity-100 ${activeColorClass}` : 'opacity-0'}`}>{label}</span>
        </button>
    );
}