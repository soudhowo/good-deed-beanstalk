import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Leaf, Flame, Send, Info, Star, Heart, Zap, Shield, Sparkles, Trophy, Trash2, Sprout, Cloud, Sun } from 'lucide-react';

// --- Configuration & Helpers ---

const DEED_TYPES = {
  KINDNESS: { id: 'kindness', label: 'Kindness', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', points: 20, icon: Heart, keywords: ['help', 'listen', 'support', 'kind', 'gave', 'share', 'friend', 'love', 'hug'] },
  PRODUCTIVE: { id: 'productive', label: 'Productivity', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', points: 15, icon: Zap, keywords: ['work', 'study', 'clean', 'finish', 'task', 'project', 'learn', 'read', 'code'] },
  CHARITY: { id: 'charity', label: 'Charity', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', points: 50, icon: Star, keywords: ['donate', 'volunteer', 'money', 'gift', 'charity', 'poor', 'rescue'] },
  SELF_CARE: { id: 'selfcare', label: 'Self Care', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', points: 10, icon: Shield, keywords: ['meditate', 'exercise', 'run', 'gym', 'sleep', 'water', 'healthy', 'walk', 'yoga'] },
  GENERAL: { id: 'general', label: 'Good Deed', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', points: 10, icon: Sparkles, keywords: [] }
};

const analyzeDeed = (text) => {
  const lowerText = text.toLowerCase();
  for (const typeKey of ['CHARITY', 'KINDNESS', 'PRODUCTIVE', 'SELF_CARE']) {
    const type = DEED_TYPES[typeKey];
    if (type.keywords.some(keyword => lowerText.includes(keyword))) {
      return type;
    }
  }
  return DEED_TYPES.GENERAL;
};

const getTodayString = () => new Date().toISOString().split('T')[0];
const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

// --- Visual Components ---

const GhibliCloud = ({ size, top, left, duration, delay }) => (
  <div 
    className="absolute pointer-events-none opacity-80 mix-blend-screen"
    style={{ 
      top, 
      left, 
      animation: `float ${duration}s linear infinite`,
      animationDelay: `${delay}s`,
      zIndex: 1
    }}
  >
    <div className={`relative ${size}`}>
      <div className="absolute w-full h-full bg-white rounded-full blur-xl opacity-90" />
      <div className="absolute w-[140%] h-[80%] -top-[40%] left-[-20%] bg-white rounded-full blur-2xl opacity-70" />
      <div className="absolute w-[80%] h-[60%] top-[40%] right-[-10%] bg-white rounded-full blur-xl opacity-80" />
    </div>
  </div>
);

const StreakBadge = ({ streak, hotStreak }) => (
  <div className={`
    flex items-center gap-2 px-5 py-2 rounded-full shadow-lg transition-all duration-500 backdrop-blur-md border border-white/40
    ${hotStreak 
      ? 'bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white animate-pulse' 
      : 'bg-white/60 text-slate-700'}
  `}>
    <Flame className={`w-5 h-5 ${hotStreak ? 'fill-yellow-200 text-yellow-200' : 'text-orange-500'}`} />
    <span className="font-bold text-lg font-serif tracking-wide">{streak} Day Streak</span>
  </div>
);

const LeafNode = ({ deed, index }) => {
  const isLeft = index % 2 === 0;
  const TypeIcon = deed.typeDef.icon;
  const bottomPos = index * 90 + 140; // Spaced out slightly more for elegance

  return (
    <div 
      className={`absolute w-full flex ${isLeft ? 'justify-start' : 'justify-end'} pointer-events-none`}
      style={{ bottom: `${bottomPos}px`, paddingLeft: '8%', paddingRight: '8%', zIndex: 20 }}
    >
      <div className={`
        relative flex items-center gap-4 p-4 max-w-[45%] 
        transition-all duration-1000 ease-out animate-in slide-in-from-bottom-8 fade-in fill-mode-forwards
        pointer-events-auto cursor-pointer group hover:-translate-y-1
      `}>
        
        {/* Vine Connector - Organic Curve */}
        <svg className={`absolute top-1/2 w-16 h-8 text-emerald-600 ${isLeft ? '-right-12' : '-left-12 rotate-180'}`} style={{ overflow: 'visible' }}>
           <path d="M 0,4 C 20,4 40,0 60,10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
           <circle cx="0" cy="4" r="3" fill="currentColor" />
        </svg>

        {/* The "Fruit/Flower" Card */}
        <div className={`
          relative flex items-center gap-3 p-4 rounded-2xl shadow-sm border
          backdrop-blur-xl bg-white/80 ${deed.typeDef.border}
          ${isLeft ? 'rounded-br-none' : 'rounded-bl-none flex-row-reverse text-right'}
        `}>
          {/* Glowing Icon Orb */}
          <div className={`
            relative flex items-center justify-center w-10 h-10 rounded-full shadow-inner
            ${deed.typeDef.bg} ${deed.typeDef.color}
          `}>
            <TypeIcon size={20} strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-sans">
              {deed.typeDef.label}
            </span>
            <span className="text-base font-medium text-slate-800 font-serif leading-tight">
              {deed.text}
            </span>
            <span className="text-xs font-bold text-emerald-600/80 mt-1">
              +{deed.points} growth
            </span>
          </div>
        </div>

        {/* Date Tooltip (Floating above) */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white text-[10px] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl whitespace-nowrap z-50">
          {new Date(deed.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800/90"></div>
        </div>

      </div>
    </div>
  );
};

// --- Main App Component ---

export default function GoodDeedBeanstalk() {
  const [deeds, setDeeds] = useState([]);
  const [inputText, setInputText] = useState('');
  const [streak, setStreak] = useState(0);
  const [lastLogDate, setLastLogDate] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(null);
  const [animating, setAnimating] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load Data
  useEffect(() => {
    const savedDeeds = localStorage.getItem('beanstalk_deeds');
    const savedStreak = localStorage.getItem('beanstalk_streak');
    const savedDate = localStorage.getItem('beanstalk_lastDate');

    if (savedDeeds) setDeeds(JSON.parse(savedDeeds));
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    if (savedDate) setLastLogDate(savedDate);

    // Validate Streak
    if (savedDate) {
      const yesterday = getYesterdayString();
      const today = getTodayString();
      if (savedDate !== today && savedDate !== yesterday) {
        setStreak(0);
        localStorage.setItem('beanstalk_streak', '0');
      }
    }
  }, []);

  const totalPoints = useMemo(() => deeds.reduce((acc, curr) => acc + curr.points, 0), [deeds]);

  // Analysis Effect
  useEffect(() => {
    if (inputText.length > 3) {
      const type = analyzeDeed(inputText);
      setShowAnalysis(type);
    } else {
      setShowAnalysis(null);
    }
  }, [inputText]);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
        setTimeout(() => {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }
  }, [deeds.length]);

  const handleAddDeed = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const analysis = analyzeDeed(inputText);
    const today = getTodayString();
    
    let newStreak = streak;
    if (lastLogDate !== today) {
      if (lastLogDate === getYesterdayString()) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      setStreak(newStreak);
      setLastLogDate(today);
      localStorage.setItem('beanstalk_streak', newStreak);
      localStorage.setItem('beanstalk_lastDate', today);
    }

    const newDeed = {
      id: Date.now(),
      text: inputText,
      points: analysis.points,
      typeDef: analysis,
      timestamp: new Date().toISOString()
    };

    const newDeeds = [newDeed, ...deeds];
    setDeeds(newDeeds);
    localStorage.setItem('beanstalk_deeds', JSON.stringify(newDeeds));
    
    setInputText('');
    setAnimating(true);
    setTimeout(() => setAnimating(false), 1000);
  };

  const handleClearData = () => {
    if(confirm("Are you sure you want to chop down your beanstalk? This cannot be undone.")) {
      localStorage.clear();
      setDeeds([]);
      setStreak(0);
      setLastLogDate(null);
    }
  }

  const hotStreak = streak >= 3;
  const contentHeight = Math.max(window.innerHeight, deeds.length * 90 + 500);
  const stalkHeight = deeds.length > 0 ? (deeds.length * 90 + 200) : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col font-sans bg-[#87CEEB]">
      
      {/* --- Global Styles for Animations --- */}
      <style>{`
        @keyframes float {
          0% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0px); }
        }
        .font-serif { font-family: 'Merriweather', serif; } 
      `}</style>

      {/* --- Painted Sky Background --- */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#4faec7] via-[#87CEEB] to-[#bce6eb]"></div>
      
      {/* Floating Clouds */}
      <GhibliCloud size="w-32 h-12" top="10%" left="10%" duration={20} delay={0} />
      <GhibliCloud size="w-48 h-20" top="20%" left="70%" duration={25} delay={2} />
      <GhibliCloud size="w-64 h-24" top="50%" left="-10%" duration={30} delay={5} />
      
      {/* Sun/Light Source */}
      <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-yellow-100 rounded-full blur-[100px] opacity-60 pointer-events-none mix-blend-screen" />

      {/* --- HUD Header --- */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 pt-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 transition-all hover:bg-white/60 group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">Current Height</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-serif text-slate-800 drop-shadow-sm">{totalPoints}</span>
              <span className="text-sm font-medium text-slate-600">m</span>
            </div>
          </div>
          <StreakBadge streak={streak} hotStreak={hotStreak} />
        </div>

        <button 
          onClick={handleClearData}
          className="pointer-events-auto p-3 bg-white/30 hover:bg-red-500/20 text-slate-700 hover:text-red-600 rounded-full backdrop-blur-sm transition-all shadow-sm border border-white/20"
          title="Reset Progress"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* --- Main Scrollable Area --- */}
      <div 
        ref={scrollRef}
        className="relative flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth z-10"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="relative w-full mx-auto max-w-3xl transition-all duration-500" style={{ height: `${contentHeight}px` }}>
          
          {/* --- Rolling Hills (Fixed at absolute bottom of scroll container) --- */}
          <div className="absolute bottom-0 w-full h-[300px] pointer-events-none z-30">
             {/* Back Hill */}
             <div className="absolute bottom-0 left-0 w-[120%] h-[200px] bg-[#2d6a4f] rounded-[100%] translate-x-[-10%] translate-y-[20%]"></div>
             {/* Middle Hill */}
             <div className="absolute bottom-0 right-0 w-[120%] h-[150px] bg-[#40916c] rounded-[100%] translate-x-[10%] translate-y-[30%] shadow-2xl"></div>
             {/* Front Hill */}
             <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-[#1b4332] to-[#52b788] translate-y-[10%]"></div>
             
             {/* Flowers on hill */}
             <div className="absolute bottom-8 left-[20%] text-yellow-300 opacity-80"><Sparkles size={12} /></div>
             <div className="absolute bottom-12 right-[30%] text-pink-300 opacity-70"><Sparkles size={16} /></div>
          </div>

          {/* SAPLING STATE */}
          {deeds.length === 0 && (
             <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-40">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 blur-xl opacity-40 animate-pulse"></div>
                  <Sprout size={72} className="text-emerald-100 drop-shadow-lg relative z-10 fill-emerald-500 stroke-emerald-800" strokeWidth={1.5} />
                </div>
                <div className="mt-4 bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl text-slate-800 text-sm font-serif font-medium text-center border border-white/40 shadow-xl">
                   Plant a seed of kindness...
                </div>
             </div>
          )}

          {/* THE STALK */}
          {deeds.length > 0 && (
            <div 
                className="absolute left-1/2 -translate-x-1/2 w-32 z-10 pointer-events-none transition-all duration-1000 ease-in-out"
                style={{ 
                    bottom: '80px', 
                    height: `${stalkHeight}px` 
                }}
            >
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="stalkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1b4332" />
                        <stop offset="40%" stopColor="#40916c" />
                        <stop offset="100%" stopColor="#1b4332" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Main Winding Stem */}
                    <path 
                        d={`M 64,${stalkHeight} 
                           Q ${50},${stalkHeight * 0.9} 64,${stalkHeight * 0.8} 
                           T 64,${stalkHeight * 0.6} 
                           T 64,${stalkHeight * 0.4} 
                           T 64,${stalkHeight * 0.2} 
                           T 64,0`} 
                        fill="none"
                        stroke="url(#stalkGradient)" 
                        strokeWidth="16" 
                        strokeLinecap="round"
                        className="drop-shadow-xl"
                    />
                    
                    {/* Secondary Wrapping Vine (Lighter) */}
                    <path 
                        d={`M 64,${stalkHeight} 
                           Q ${80},${stalkHeight * 0.9} 64,${stalkHeight * 0.8} 
                           T 64,${stalkHeight * 0.6} 
                           T 64,${stalkHeight * 0.4} 
                           T 64,${stalkHeight * 0.2} 
                           T 64,0`} 
                        fill="none"
                        stroke="#74c69d" 
                        strokeWidth="4" 
                        strokeDasharray="20 10"
                        strokeLinecap="round"
                        className="opacity-60"
                    />
                </svg>
            </div>
          )}

          {/* Leaves/Nodes */}
          {deeds.map((deed, index) => (
             <LeafNode 
               key={deed.id} 
               deed={deed} 
               index={deeds.length - 1 - index} 
             />
          ))}

          {/* Floating Spirit Motes (Decorations) */}
          <div className="absolute bottom-[20%] left-[20%] w-2 h-2 bg-white rounded-full blur-[1px] animate-ping opacity-50 duration-1000"></div>
          <div className="absolute bottom-[40%] right-[20%] w-3 h-3 bg-yellow-100 rounded-full blur-[2px] animate-pulse opacity-40"></div>

        </div>
      </div>

      {/* --- Input Area --- */}
      <div className="relative z-50 p-4 pb-8 bg-gradient-to-t from-[#1b4332]/90 via-[#1b4332]/50 to-transparent">
        <div className="max-w-xl mx-auto">
          
          {/* Analysis Preview Bubble */}
          {showAnalysis && (
            <div className={`
              mb-3 mx-auto w-fit px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl flex items-center gap-2
              backdrop-blur-xl border border-white/50
              ${showAnalysis.color} bg-white/90 animate-bounce
            `}>
              <showAnalysis.icon size={14} />
              <span>{showAnalysis.label}</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">+{showAnalysis.points}</span>
            </div>
          )}

          <form 
            onSubmit={handleAddDeed}
            className={`
              flex items-center gap-3 bg-white/90 backdrop-blur-xl p-2 pl-4 rounded-3xl shadow-2xl transition-all duration-300 border border-white/40
              ${animating ? 'scale-105 shadow-emerald-400/50' : 'hover:shadow-emerald-900/30'}
            `}
          >
            <div className="text-emerald-600">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="What good did you do today?"
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 font-serif text-lg h-12"
              autoFocus
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className={`
                h-12 w-12 flex items-center justify-center rounded-2xl text-white transition-all duration-300 transform active:scale-95
                ${inputText.trim() ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 rotate-0' : 'bg-slate-200 cursor-not-allowed -rotate-12'}
              `}
            >
              <Send size={20} fill={inputText.trim() ? "currentColor" : "none"} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}