import React, { useState, useEffect } from 'react';
import { Star, Calendar as CalendarIcon, ShoppingBag, Settings, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Sparkles, BrainCircuit, X } from 'lucide-react';
import { INITIAL_TASKS, INITIAL_REWARDS } from './constants';
import { Task, Reward, TaskCategory, Transaction } from './types';
import { generateIdeas } from './services/geminiService';

// --- Constants for UI ---
const COMMON_EMOJIS = [
  '📺', '🎮', '🍦', '🍬', '🍟', '🍔', 
  '🎡', '🪁', '🧸', '⚽', '🛹', '🎨',
  '📚', '🧩', '🎸', '🚲', '🏊', '🎁',
  '🧹', '🛏️', '🛁', '🦷', '🎒', '⏰'
];

// --- Sub-Components defined here to keep single file structure clean ---

const Header = ({ balance }: { balance: number }) => (
  <div className="bg-orange-400 text-white p-4 pt-8 rounded-b-[2rem] shadow-lg sticky top-0 z-20">
    <div className="flex justify-between items-center max-w-5xl mx-auto px-4">
      <div>
        <h1 className="text-xl font-bold tracking-wider">小小之星 ✨</h1>
        <p className="text-orange-100 text-xs opacity-90">积累好习惯，兑换大惊喜</p>
      </div>
      <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
        <span className="text-3xl font-extrabold text-yellow-300 drop-shadow-md mr-2">{balance}</span>
        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
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
    return `${y}年${m}月${day}日 星期${week}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm mx-auto mt-4 mb-2 border border-orange-100 max-w-3xl">
      <button onClick={() => changeDate(-1)} className="p-2 hover:bg-orange-50 rounded-full text-orange-400 transition-colors">
        <ChevronLeft size={24} />
      </button>
      <span className="font-bold text-gray-700 text-sm sm:text-base">{formatDate(date)}</span>
      <button onClick={() => changeDate(1)} className="p-2 hover:bg-orange-50 rounded-full text-orange-400 transition-colors">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'store' | 'calendar' | 'settings'>('daily');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State
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
  
  // Form States
  const [newTask, setNewTask] = useState<{title: string, stars: number, category: TaskCategory}>({
    title: '', stars: 2, category: TaskCategory.LIFE
  });
  const [newReward, setNewReward] = useState<{title: string, cost: number, icon: string}>({
    title: '', cost: 50, icon: '🎁'
  });

  // Persistence Effects
  useEffect(() => localStorage.setItem('app_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('app_rewards', JSON.stringify(rewards)), [rewards]);
  useEffect(() => localStorage.setItem('app_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('app_balance', balance.toString()), [balance]);
  useEffect(() => localStorage.setItem('app_transactions', JSON.stringify(transactions)), [transactions]);

  // Helpers
  const getDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      newLog = currentLog.filter(id => id !== task.id);
      updateBalance(-task.stars, `撤销: ${task.title}`, currentDate);
    } else {
      newLog = [...currentLog, task.id];
      updateBalance(task.stars, `完成: ${task.title}`, currentDate);
    }

    setLogs({ ...logs, [dateKey]: newLog });
  };

  const redeemReward = (reward: Reward) => {
    if (balance >= reward.cost) {
      if (window.confirm(`确定要花费 ${reward.cost} 星星兑换 "${reward.title}" 吗？`)) {
        updateBalance(-reward.cost, `兑换: ${reward.title}`);
        alert(`🎉 兑换成功！享受你的奖励吧！`);
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

  // AI Logic
  const [isGenerating, setIsGenerating] = useState(false);
  const handleAIGenerate = async (type: 'task' | 'reward') => {
    setIsGenerating(true);
    const ideas = await generateIdeas(type, type === 'task' ? tasks.length : rewards.length);
    setIsGenerating(false);
    
    if (ideas && ideas.length > 0) {
        const newItems = ideas.map((item: any) => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
        
        if (type === 'task') {
            setTasks([...tasks, ...newItems]);
            alert(`已为您添加了 ${newItems.length} 个新任务建议！`);
        } else {
            setRewards([...rewards, ...newItems]);
            alert(`已为您添加了 ${newItems.length} 个新奖励建议！`);
        }
    } else {
        alert("AI 思考超时，请稍后再试。");
    }
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
  const renderTaskList = (category: TaskCategory, colorClass: string) => {
    const categoryTasks = tasks.filter(t => t.category === category);
    const completedIds = logs[dateKey] || [];

    if (categoryTasks.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className={`font-bold text-lg mb-3 px-2 flex items-center ${colorClass}`}>
          <span className="mr-2 text-xl">
            {category === TaskCategory.LIFE && '🏠'}
            {category === TaskCategory.BEHAVIOR && '📚'}
            {category === TaskCategory.BONUS && '🌟'}
            {category === TaskCategory.PENALTY && '⚠️'}
          </span>
          {category}
        </h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {categoryTasks.map(task => {
              const isDone = completedIds.includes(task.id);
              const isPenalty = task.category === TaskCategory.PENALTY;
              
              return (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className={`
                    relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-200 bounce-click cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md
                    ${isDone 
                      ? (isPenalty ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400') 
                      : 'bg-white border-orange-100 hover:border-orange-200'}
                  `}
                >
                    <div className="flex items-center gap-3 z-10">
                        <div className={`
                            w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0
                            ${isDone 
                                ? (isPenalty ? 'bg-red-500 border-red-500 text-white' : 'bg-green-500 border-green-500 text-white')
                                : 'border-gray-300 bg-gray-50'}
                        `}>
                            {isDone && (isPenalty ? <XCircle size={16} /> : <CheckCircle2 size={16} />)}
                        </div>
                        <span className={`font-medium ${isDone ? 'text-gray-700' : 'text-gray-600'}`}>{task.title}</span>
                    </div>
                    <div className={`font-extrabold text-lg z-10 ${isPenalty ? 'text-red-500' : 'text-yellow-500'}`}>
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
    <div className="min-h-screen bg-[#FFF7ED] pb-24">
      {/* Top Bar */}
      <Header balance={balance} />

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto pt-2 px-4 md:px-8">
        
        {/* --- DAILY VIEW --- */}
        {activeTab === 'daily' && (
          <>
            <DateNavigator date={currentDate} setDate={setCurrentDate} />
            <div className="pb-10 animate-fade-in">
                {renderTaskList(TaskCategory.LIFE, 'text-orange-600')}
                {renderTaskList(TaskCategory.BEHAVIOR, 'text-blue-600')}
                {renderTaskList(TaskCategory.BONUS, 'text-purple-600')}
                {renderTaskList(TaskCategory.PENALTY, 'text-red-600')}
                
                {tasks.length === 0 && (
                    <div className="text-center p-8 text-gray-400">
                        还没有任务哦，去设置里添加一些吧！
                    </div>
                )}
            </div>
          </>
        )}

        {/* --- STORE VIEW --- */}
        {activeTab === 'store' && (
          <div className="py-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                <ShoppingBag className="mr-2" /> 兑换商城
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {rewards.map(reward => (
                    <div key={reward.id} className="bg-white rounded-2xl p-4 flex flex-col items-center shadow-md border border-orange-100 relative overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-3">{reward.icon}</div>
                        <h3 className="font-bold text-gray-800 text-center mb-2 text-sm h-10 flex items-center justify-center">{reward.title}</h3>
                        <button 
                            onClick={() => redeemReward(reward)}
                            className={`
                                w-full py-2 rounded-xl font-bold text-white flex items-center justify-center gap-1 transition-colors bounce-click
                                ${balance >= reward.cost ? 'bg-orange-400 hover:bg-orange-500 shadow-orange-200' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                            disabled={balance < reward.cost}
                        >
                            <span>{reward.cost}</span>
                            <Star size={14} fill="currentColor" />
                        </button>
                        {balance >= reward.cost && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 opacity-10 rounded-full -mr-8 -mt-8"></div>
                        )}
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* --- CALENDAR/HISTORY VIEW --- */}
        {activeTab === 'calendar' && (
           <div className="py-4 animate-fade-in max-w-3xl mx-auto">
               <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                   <CalendarIcon className="mr-2" /> 积分记录
               </h2>
               
               <DateNavigator date={currentDate} setDate={setCurrentDate} />

               <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-green-100 p-4 rounded-2xl border border-green-200 flex flex-col items-center">
                       <span className="text-green-600 text-xs font-bold uppercase">今日获得</span>
                       <span className="text-2xl font-extrabold text-green-600">+{dailyEarned}</span>
                   </div>
                   <div className="bg-red-100 p-4 rounded-2xl border border-red-200 flex flex-col items-center">
                       <span className="text-red-500 text-xs font-bold uppercase">今日消费/扣除</span>
                       <span className="text-2xl font-extrabold text-red-500">-{dailySpent}</span>
                   </div>
               </div>

               <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                   <h3 className="text-gray-500 text-sm mb-3">当日明细</h3>
                   <div className="space-y-3">
                        {dailyTransactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-700">{tx.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        ))}
                        {dailyTransactions.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-300 text-4xl mb-2">📅</p>
                                <p className="text-gray-400 text-sm">这一天没有积分变动哦</p>
                            </div>
                        )}
                   </div>
               </div>
           </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {activeTab === 'settings' && (
            <div className="py-4 pb-20 animate-fade-in">
                <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                    <Settings className="mr-2" /> 设置管理
                </h2>

                {/* AI Generator Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg text-white mb-8">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                        <Sparkles className="text-yellow-300" /> AI 助手
                    </h3>
                    <p className="text-sm text-indigo-100 mb-4">不知道设置什么任务或奖励？让 AI 帮你想想！</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleAIGenerate('task')}
                            disabled={isGenerating}
                            className="flex-1 bg-white/20 backdrop-blur hover:bg-white/30 py-2 px-4 rounded-lg text-sm font-bold border border-white/30 flex items-center justify-center gap-2 transition-all"
                        >
                            {isGenerating ? <span className="animate-spin">⌛</span> : <BrainCircuit size={16} />}
                            生成任务
                        </button>
                        <button 
                             onClick={() => handleAIGenerate('reward')}
                             disabled={isGenerating}
                             className="flex-1 bg-white/20 backdrop-blur hover:bg-white/30 py-2 px-4 rounded-lg text-sm font-bold border border-white/30 flex items-center justify-center gap-2 transition-all"
                        >
                            {isGenerating ? <span className="animate-spin">⌛</span> : <ShoppingBag size={16} />}
                            生成奖励
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Task Management */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">任务列表</h3>
                            <button 
                                onClick={() => setIsTaskModalOpen(true)} 
                                className="text-orange-500 bg-orange-100 p-2 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                                <Plus size={20}/>
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
                            {tasks.map(t => (
                                <div key={t.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 mr-2">{t.category}</span>
                                        <span className="text-gray-700">{t.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${t.stars > 0 ? 'text-yellow-500' : 'text-red-500'}`}>{t.stars > 0 ? '+' : ''}{t.stars}</span>
                                        <button onClick={() => {
                                            if(window.confirm("删除此任务?")) setTasks(tasks.filter(x => x.id !== t.id));
                                        }} className="text-gray-300 hover:text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reward Management */}
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">奖励列表</h3>
                            <button 
                                onClick={() => setIsRewardModalOpen(true)} 
                                className="text-orange-500 bg-orange-100 p-2 rounded-lg hover:bg-orange-200 transition-colors"
                            >
                                <Plus size={20}/>
                            </button>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
                            {rewards.map(r => (
                                <div key={r.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{r.icon}</span>
                                        <span className="text-gray-700">{r.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-orange-500 flex items-center gap-1">{r.cost} <Star size={12} fill="currentColor"/></span>
                                        <button onClick={() => {
                                            if(window.confirm("删除此奖励?")) setRewards(rewards.filter(x => x.id !== r.id));
                                        }} className="text-gray-300 hover:text-red-400"><Trash2 size={16}/></button>
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
                    className="w-full mt-10 p-4 text-red-400 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors"
                >
                    重置所有数据
                </button>
            </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-orange-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
        <div className="flex justify-between items-center max-w-3xl mx-auto h-16">
            <NavBtn icon={<CheckCircle2 />} label="打卡" active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} />
            <NavBtn icon={<ShoppingBag />} label="商城" active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
            <NavBtn icon={<CalendarIcon />} label="记录" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            <NavBtn icon={<Settings />} label="设置" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </nav>

      {/* --- MODALS --- */}
      
      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
                    <h3 className="font-bold text-orange-800">添加新任务</h3>
                    <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">任务名称</label>
                        <input 
                            autoFocus
                            value={newTask.title}
                            onChange={e => setNewTask({...newTask, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                            placeholder="例如：自己收拾书包"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">任务类别</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(TaskCategory).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        // Auto-adjust stars based on category default if user hasn't messed with it much
                                        let defaultStars = 2;
                                        if(cat === TaskCategory.BONUS) defaultStars = 5;
                                        if(cat === TaskCategory.PENALTY) defaultStars = -5;
                                        setNewTask({...newTask, category: cat, stars: defaultStars});
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                                        newTask.category === cat 
                                        ? 'bg-orange-100 border-orange-400 text-orange-700' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">
                            {newTask.category === TaskCategory.PENALTY ? '扣除星星' : '奖励星星'}
                        </label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range"
                                min={newTask.category === TaskCategory.PENALTY ? -20 : 1}
                                max={newTask.category === TaskCategory.PENALTY ? -1 : 20}
                                value={newTask.stars}
                                onChange={e => setNewTask({...newTask, stars: parseInt(e.target.value)})}
                                className="flex-1 accent-orange-400 h-2 bg-gray-200 rounded-lg appearance-none"
                            />
                            <span className={`font-extrabold text-xl w-12 text-center ${newTask.stars > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {newTask.stars > 0 ? '+' : ''}{newTask.stars}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveTask}
                        className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-all mt-4"
                    >
                        保存任务
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reward Modal */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                    <h3 className="font-bold text-purple-800">添加新奖励</h3>
                    <button onClick={() => setIsRewardModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">奖励名称</label>
                        <input 
                            autoFocus
                            value={newReward.title}
                            onChange={e => setNewReward({...newReward, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                            placeholder="例如：看30分钟电视"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">选择图标</label>
                        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                            {COMMON_EMOJIS.map(icon => (
                                <button 
                                    key={icon}
                                    onClick={() => setNewReward({...newReward, icon})}
                                    className={`text-xl p-2 rounded-lg hover:bg-white transition-all ${newReward.icon === icon ? 'bg-white shadow-md ring-2 ring-purple-200 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 font-bold uppercase mb-1">兑换花费</label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={newReward.cost}
                                onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value)})}
                                className="flex-1 accent-purple-400 h-2 bg-gray-200 rounded-lg appearance-none"
                            />
                            <div className="flex items-center gap-1 w-16 justify-end">
                                <span className="font-extrabold text-xl text-orange-500">{newReward.cost}</span>
                                <Star size={16} className="text-orange-500 fill-orange-500" />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveReward}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 transition-all mt-4"
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

const NavBtn = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${active ? 'text-orange-500 -translate-y-2' : 'text-gray-400 hover:text-orange-300'}`}
    >
        <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-orange-100 shadow-sm' : ''}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24, fill: active ? "currentColor" : "none" })}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);