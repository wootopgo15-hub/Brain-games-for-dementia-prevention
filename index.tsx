import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Brain, Hash, Image as ImageIcon, Grid3X3, ArrowLeft, Palette, BrainCircuit, Calculator, Trophy, User, Building, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import './index.css';

type Screen = 'LOGIN' | 'HOME' | 'RANKING' | 'NUMBER' | 'PICTURE' | 'PUZZLE' | 'COLOR_WORD' | 'PATTERN' | 'MATH';

type UserData = 
  | { type: 'INDIVIDUAL'; name: string; birth: string; center: string }
  | { type: 'CENTER'; name: string };

type ScoreEntry = {
  id: string;
  userType?: 'INDIVIDUAL' | 'CENTER';
  userName: string;
  centerName: string;
  game: string;
  score: number;
  timestamp: number;
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load scores from local storage on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('brain_game_scores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, []);

  const handleLogin = (user: UserData) => {
    setCurrentUser(user);
    setCurrentScreen('HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('LOGIN');
  };

  const saveScore = async (game: string, score: number) => {
    if (!currentUser) {
      setCurrentScreen('LOGIN');
      return;
    }

    if (score > 0) {
      const userName = currentUser.type === 'INDIVIDUAL' ? currentUser.name : '센터관리자';
      const centerName = currentUser.type === 'INDIVIDUAL' ? currentUser.center : currentUser.name;

      const newScore: ScoreEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userType: currentUser.type,
        userName,
        centerName,
        game,
        score,
        timestamp: Date.now(),
      };

      const updatedScores = [...scores, newScore];
      setScores(updatedScores);
      localStorage.setItem('brain_game_scores', JSON.stringify(updatedScores));

      // Send to Google Sheets if Web App URL is configured
      let googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_WEB_APP_URL;
      
      // Fallback to default URL if the environment variable is missing or looks invalid (e.g., just a number)
      if (!googleSheetUrl || !googleSheetUrl.startsWith('http')) {
        googleSheetUrl = 'https://script.google.com/macros/s/AKfycbw7Gb1OX0iXMlyJoBZef443mEpJ6_Z0mVd4biGALRhUWsGNErH90dF9jsYvsd01d8DG/exec';
      }

      if (googleSheetUrl) {
        fetch(googleSheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            mode: 'APPEND',
            type: 'GAME_SCORE',
            '참가유형': newScore.userType === 'INDIVIDUAL' ? '개인' : '센터',
            '이름': newScore.userName,
            '생년월일': currentUser.type === 'INDIVIDUAL' ? currentUser.birth : '',
            '소속센터': newScore.centerName,
            '게임종류': newScore.game,
            '점수': newScore.score
          }),
        }).then(() => {
          setToastMessage('점수가 구글 시트에 저장되었습니다!');
          setTimeout(() => setToastMessage(null), 3000);
        }).catch(error => {
          console.error('Failed to save score to Google Sheets:', error);
        });
      }
    }

    // Switch to ranking screen after saving (or if score is 0)
    setCurrentScreen('RANKING');
  };

  const getUserKey = (user: UserData) => `${user.type}-${user.name}-${user.type === 'INDIVIDUAL' ? user.center : ''}`;

  const getSavedLevel = (game: string) => {
    if (!currentUser) return 1;
    const key = getUserKey(currentUser);
    const progress = JSON.parse(localStorage.getItem('brain_game_progress') || '{}');
    return progress[key]?.[game] || 1;
  };

  const saveLevel = (game: string, level: number) => {
    if (!currentUser) return;
    const key = getUserKey(currentUser);
    const progress = JSON.parse(localStorage.getItem('brain_game_progress') || '{}');
    if (!progress[key]) progress[key] = {};
    if (level > (progress[key][game] || 0)) {
      progress[key][game] = level;
      localStorage.setItem('brain_game_progress', JSON.stringify(progress));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {currentScreen !== 'LOGIN' && currentScreen !== 'HOME' && (
            <button 
              onClick={() => setCurrentScreen('HOME')}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <Brain className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800">치매 예방 두뇌 게임</h1>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {currentUser.type === 'INDIVIDUAL' ? <User size={16} /> : <Building size={16} />}
              <span>{currentUser.name}</span>
              <span className="text-slate-400">|</span>
              <span>{currentUser.type === 'INDIVIDUAL' ? currentUser.center : '관리자'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors" title="로그아웃">
              <LogOut size={20} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {currentScreen === 'LOGIN' && <LoginScreen key="login" onLogin={handleLogin} />}
          {currentScreen === 'HOME' && <HomeScreen key="home" onNavigate={setCurrentScreen} currentUser={currentUser!} />}
          {currentScreen === 'RANKING' && <RankingScreen key="ranking" scores={scores} />}
          
          {currentScreen === 'NUMBER' && <NumberGame key="number" initialLevel={getSavedLevel('NUMBER')} onSaveLevel={(l) => saveLevel('NUMBER', l)} onFinish={(s) => saveScore('숫자 기억', s)} />}
          {currentScreen === 'PICTURE' && <PictureGame key="picture" initialLevel={getSavedLevel('PICTURE')} onSaveLevel={(l) => saveLevel('PICTURE', l)} onFinish={(s) => saveScore('그림 맞추기', s)} />}
          {currentScreen === 'PUZZLE' && <PuzzleGame key="puzzle" initialLevel={getSavedLevel('PUZZLE')} onSaveLevel={(l) => saveLevel('PUZZLE', l)} onFinish={(s) => saveScore('슬라이딩 퍼즐', s)} />}
          {currentScreen === 'COLOR_WORD' && <ColorWordGame key="color_word" initialLevel={getSavedLevel('COLOR_WORD')} onSaveLevel={(l) => saveLevel('COLOR_WORD', l)} onFinish={(s) => saveScore('색상 단어', s)} />}
          {currentScreen === 'PATTERN' && <PatternGame key="pattern" initialLevel={getSavedLevel('PATTERN')} onSaveLevel={(l) => saveLevel('PATTERN', l)} onFinish={(s) => saveScore('패턴 기억', s)} />}
          {currentScreen === 'MATH' && <MathGame key="math" initialLevel={getSavedLevel('MATH')} onSaveLevel={(l) => saveLevel('MATH', l)} onFinish={(s) => saveScore('사칙연산', s)} />}
        </AnimatePresence>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-50 font-medium"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeScreen({ onNavigate, currentUser }: { onNavigate: (s: Screen) => void, currentUser: UserData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md flex flex-col gap-3 pb-8"
    >
      <button onClick={() => onNavigate('RANKING')} className="mb-4 flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] font-bold text-lg">
        <Trophy size={24} />
        실시간 랭킹 보기
      </button>

      <h2 className="text-2xl font-bold text-center mb-4 text-slate-700">원하시는 게임을 선택하세요</h2>
      
      <div className="grid gap-3">
        <button onClick={() => onNavigate('NUMBER')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
            <Hash size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">숫자 기억 게임</h3>
            <p className="text-sm text-slate-500">순서대로 숫자를 기억하고 누르세요</p>
          </div>
        </button>

        <button onClick={() => onNavigate('PICTURE')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
            <ImageIcon size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">그림 짝맞추기</h3>
            <p className="text-sm text-slate-500">같은 그림의 카드를 찾아보세요</p>
          </div>
        </button>

        <button onClick={() => onNavigate('PUZZLE')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
            <Grid3X3 size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">슬라이딩 퍼즐</h3>
            <p className="text-sm text-slate-500">조각을 움직여 그림을 완성하세요</p>
          </div>
        </button>

        <button onClick={() => onNavigate('COLOR_WORD')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-rose-100 p-3 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
            <Palette size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">색상 단어 게임 (스트룹)</h3>
            <p className="text-sm text-slate-500">글자의 의미가 아닌 '색상'을 맞추세요</p>
          </div>
        </button>

        <button onClick={() => onNavigate('PATTERN')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
            <BrainCircuit size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">패턴 기억 게임</h3>
            <p className="text-sm text-slate-500">불이 켜지는 순서를 기억해 따라하세요</p>
          </div>
        </button>

        <button onClick={() => onNavigate('MATH')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
          <div className="bg-cyan-100 p-3 rounded-xl text-cyan-600 group-hover:scale-110 transition-transform">
            <Calculator size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">두뇌 회전 사칙연산</h3>
            <p className="text-sm text-slate-500">빠르게 계산 문제를 풀어보세요</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

// --- Login Screen ---
function LoginScreen({ onLogin }: { onLogin: (user: UserData) => void }) {
  const [tab, setTab] = useState<'INDIVIDUAL' | 'CENTER'>('INDIVIDUAL');
  
  // Individual State
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [center, setCenter] = useState('');

  // Center State
  const [centerName, setCenterName] = useState('');
  const [password, setPassword] = useState('');

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birth && center) {
      onLogin({ type: 'INDIVIDUAL', name, birth, center });
    }
  };

  const handleCenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerName && password) {
      onLogin({ type: 'CENTER', name: centerName });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setTab('INDIVIDUAL')}
          className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'INDIVIDUAL' ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50")}
        >
          개인전 참가
        </button>
        <button 
          onClick={() => setTab('CENTER')}
          className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'CENTER' ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50")}
        >
          센터 로그인
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {tab === 'INDIVIDUAL' ? (
          <form onSubmit={handleIndividualSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">이름</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">생년월일 (6자리)</label>
              <input type="text" required value={birth} onChange={e => setBirth(e.target.value)} placeholder="450101" maxLength={6} className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">소속 센터명</label>
              <input type="text" required value={center} onChange={e => setCenter(e.target.value)} placeholder="행복치매예방센터" className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
            </div>
            <button type="submit" className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg">
              입장하기
            </button>
          </form>
        ) : (
          <form onSubmit={handleCenterSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">센터명</label>
              <input type="text" required value={centerName} onChange={e => setCenterName(e.target.value)} placeholder="행복치매예방센터" className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">비밀번호</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" />
            </div>
            <button type="submit" className="mt-4 w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-900 active:scale-[0.98] transition-all shadow-md hover:shadow-lg">
              관리자 로그인
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}

// --- Ranking Screen ---
const GAME_TYPES = [
  { id: 'ALL', label: '종합 랭킹' },
  { id: '숫자 기억', label: '숫자 기억' },
  { id: '그림 맞추기', label: '그림 맞추기' },
  { id: '슬라이딩 퍼즐', label: '슬라이딩 퍼즐' },
  { id: '색상 단어', label: '색상 단어' },
  { id: '패턴 기억', label: '패턴 기억' },
  { id: '사칙연산', label: '사칙연산' },
];

function RankingScreen({ scores }: { scores: ScoreEntry[] }) {
  const [tab, setTab] = useState<'INDIVIDUAL' | 'CENTER'>('INDIVIDUAL');
  const [selectedGame, setSelectedGame] = useState<string>('ALL');

  // Calculate Individual Rankings (Sum of all scores per user)
  const individualRankings = React.useMemo(() => {
    const userScores: Record<string, { name: string; center: string; total: number; games: Record<string, number> }> = {};
    scores.forEach(s => {
      if (s.userType === 'CENTER' || s.userName === '센터관리자') return; // Skip center admins
      if (selectedGame !== 'ALL' && s.game !== selectedGame) return; // Filter by game

      const key = `${s.userName}-${s.centerName}`;
      if (!userScores[key]) {
        userScores[key] = { name: s.userName, center: s.centerName, total: 0, games: {} };
      }
      userScores[key].total += s.score;
      userScores[key].games[s.game] = (userScores[key].games[s.game] || 0) + s.score;
    });
    return Object.values(userScores).sort((a, b) => b.total - a.total);
  }, [scores, selectedGame]);

  // Calculate Center Rankings (Sum of all scores per center)
  const centerRankings = React.useMemo(() => {
    const centerScores: Record<string, { name: string; total: number; games: Record<string, number> }> = {};
    scores.forEach(s => {
      if (s.userType === 'INDIVIDUAL' || (s.userType === undefined && s.userName !== '센터관리자')) return; // Skip individuals
      if (selectedGame !== 'ALL' && s.game !== selectedGame) return; // Filter by game

      if (!centerScores[s.centerName]) {
        centerScores[s.centerName] = { name: s.centerName, total: 0, games: {} };
      }
      centerScores[s.centerName].total += s.score;
      centerScores[s.centerName].games[s.game] = (centerScores[s.centerName].games[s.game] || 0) + s.score;
    });
    return Object.values(centerScores).sort((a, b) => b.total - a.total);
  }, [scores, selectedGame]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-[85vh] sm:h-[80vh]">
      <div className="bg-amber-400 p-6 text-center">
        <Trophy size={48} className="mx-auto text-amber-100 mb-2" />
        <h2 className="text-3xl font-black text-amber-900">명예의 전당</h2>
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50">
        <button onClick={() => setTab('INDIVIDUAL')} className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'INDIVIDUAL' ? "bg-white text-amber-600 border-b-2 border-amber-500" : "text-slate-500 hover:bg-slate-100")}>
          개인전 랭킹
        </button>
        <button onClick={() => setTab('CENTER')} className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'CENTER' ? "bg-white text-amber-600 border-b-2 border-amber-500" : "text-slate-500 hover:bg-slate-100")}>
          센터별 랭킹
        </button>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-3 overflow-x-auto whitespace-nowrap flex gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {GAME_TYPES.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-bold transition-colors",
              selectedGame === game.id 
                ? "bg-amber-100 text-amber-700 border border-amber-200" 
                : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
            )}
          >
            {game.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
        {tab === 'INDIVIDUAL' ? (
          <div className="flex flex-col gap-3">
            {individualRankings.length === 0 ? (
              <div className="text-center text-slate-400 py-10">아직 기록이 없습니다.</div>
            ) : (
              individualRankings.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-base sm:text-lg shrink-0", idx === 0 ? "bg-amber-400 text-amber-900" : idx === 1 ? "bg-slate-300 text-slate-700" : idx === 2 ? "bg-orange-300 text-orange-900" : "bg-slate-100 text-slate-500")}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base sm:text-lg text-slate-800">{user.name}</div>
                    <div className="text-xs sm:text-sm text-slate-500">{user.center}</div>
                  </div>
                  <div className="font-black text-xl sm:text-2xl text-indigo-600 ml-2 sm:ml-4 text-right min-w-[60px] sm:min-w-[80px]">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{selectedGame === 'ALL' ? '총점' : '점수'}</div>
                    {user.total.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {centerRankings.length === 0 ? (
              <div className="text-center text-slate-400 py-10">아직 기록이 없습니다.</div>
            ) : (
              centerRankings.map((center, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-base sm:text-lg shrink-0", idx === 0 ? "bg-amber-400 text-amber-900" : idx === 1 ? "bg-slate-300 text-slate-700" : idx === 2 ? "bg-orange-300 text-orange-900" : "bg-slate-100 text-slate-500")}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-base sm:text-lg text-slate-800">{center.name}</div>
                  </div>
                  <div className="font-black text-xl sm:text-2xl text-rose-500 ml-2 sm:ml-4 text-right min-w-[60px] sm:min-w-[80px]">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{selectedGame === 'ALL' ? '총점' : '점수'}</div>
                    {center.total.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Shared Components ---
function LevelComplete({ level, score, onNext, isGameOver, isLevelClear, totalScore, onFinish }: { level: number, score: number, onNext: () => void, isGameOver: boolean, isLevelClear: boolean, totalScore: number, onFinish: () => void }) {
  return (
    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 rounded-3xl">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        {isGameOver && !isLevelClear ? (
          <>
            <h3 className="text-4xl font-black text-rose-600 mb-2">게임 종료!</h3>
            <p className="text-xl font-bold text-slate-600 mb-6">최종 점수: {totalScore}점</p>
            <button onClick={onFinish} className="px-8 py-3 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors shadow-md">
              결과 저장하기
            </button>
          </>
        ) : isGameOver && isLevelClear ? (
          <>
            <h3 className="text-4xl font-black text-indigo-600 mb-2">모든 단계 완료!</h3>
            <p className="text-xl font-bold text-slate-600 mb-6">최종 점수: {totalScore}점</p>
            <button onClick={onFinish} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-md">
              결과 저장하기
            </button>
          </>
        ) : (
          <>
            <h3 className="text-3xl font-black text-emerald-500 mb-2">{level}단계 클리어!</h3>
            <p className="text-xl font-bold text-slate-600 mb-6">+{score}점 획득 (현재 총점: {totalScore}점)</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={onFinish} className="px-6 py-3 bg-slate-500 text-white rounded-full font-bold hover:bg-slate-600 transition-colors shadow-md w-full sm:w-auto">
                결과 저장하기
              </button>
              <button onClick={onNext} className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors shadow-md w-full sm:w-auto">
                다음 단계로
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// --- 1. Number Game ---
function NumberGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [numbers, setNumbers] = useState<(number | null)[]>([]);
  const [currentTarget, setCurrentTarget] = useState(1);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const getTargetCount = (lvl: number) => Math.min(2 + lvl, 16); // L1: 3, L14+: 16

  const initLevel = (lvl: number) => {
    const count = getTargetCount(lvl);
    const nums: (number | null)[] = Array(16).fill(null);
    const positions = Array.from({ length: 16 }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, count);
    positions.forEach((pos, i) => {
      nums[pos] = i + 1;
    });
    setNumbers(nums);
    setCurrentTarget(1);
    setIsLevelClear(false);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  const handleNumberClick = (num: number | null) => {
    if (isLevelClear || isGameOver || num === null) return;
    if (num === currentTarget) {
      if (currentTarget === getTargetCount(level)) {
        const earned = level * 10;
        setLevelScore(earned);
        setScore(prev => prev + earned);
        setIsLevelClear(true);
        if (level === 50) setIsGameOver(true);
      } else {
        setCurrentTarget(prev => prev + 1);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5)); // Penalty
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-indigo-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center">1부터 {getTargetCount(level)}까지 순서대로 누르세요</h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full aspect-square">
        {numbers.map((num, i) => {
          const isHidden = num === null || num < currentTarget;
          return (
            <button key={i} disabled={isHidden || isLevelClear} onClick={() => handleNumberClick(num)}
              className={clsx("rounded-2xl text-2xl sm:text-3xl font-bold flex items-center justify-center transition-all duration-300",
                isHidden ? "bg-transparent text-transparent shadow-none" : "bg-indigo-500 text-white shadow-md hover:bg-indigo-600 hover:scale-105 active:scale-95"
              )}>
              {num}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// --- 2. Picture Game ---
type Card = { id: number; content: string; isFlipped: boolean; isMatched: boolean };
function PictureGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const emojis = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🥝", "🍍"];
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const getPairCount = (lvl: number) => Math.min(2 + Math.floor(lvl / 2), 8); // L1: 2, L12+: 8

  const initLevel = (lvl: number) => {
    const pairCount = getPairCount(lvl);
    const selectedEmojis = emojis.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((content, i) => ({ id: i, content, isFlipped: false, isMatched: false }));
    setCards(deck);
    setSelectedIndices([]);
    setIsLevelClear(false);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  const handleCardClick = (index: number) => {
    if (isLevelClear || selectedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setTimeout(() => {
        const [first, second] = newSelected;
        const updatedCards = [...newCards];
        if (updatedCards[first].content === updatedCards[second].content) {
          updatedCards[first].isMatched = true; updatedCards[second].isMatched = true;
        } else {
          updatedCards[first].isFlipped = false; updatedCards[second].isFlipped = false;
        }
        setCards(updatedCards); setSelectedIndices([]);
        
        if (updatedCards.every(c => c.isMatched)) {
          const earned = level * 15;
          setLevelScore(earned);
          setScore(prev => prev + earned);
          setIsLevelClear(true);
          if (level === 50) setIsGameOver(true);
        }
      }, 800);
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center">같은 그림을 찾으세요</h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-4 gap-2 w-full">
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => handleCardClick(i)} disabled={card.isMatched || card.isFlipped || isLevelClear}
            className={clsx("rounded-2xl text-3xl sm:text-4xl flex items-center justify-center transition-all duration-500 transform-gpu aspect-square",
              card.isMatched ? "bg-slate-200 opacity-50" : card.isFlipped ? "bg-white shadow-md rotate-y-180" : "bg-emerald-500 shadow-md hover:bg-emerald-600"
            )} style={{ perspective: '1000px' }}>
            <div className={clsx("transition-opacity duration-300", (card.isFlipped || card.isMatched) ? "opacity-100" : "opacity-0")}>{card.content}</div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// --- 3. Puzzle Game ---
function PuzzleGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [tiles, setTiles] = useState<number[]>([]);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const isSolved = (currentTiles: number[]) => currentTiles.length > 0 && currentTiles.every((t, i) => i === 8 ? t === 0 : t === i + 1);

  const initLevel = (lvl: number) => {
    // Instead of completely random, we shuffle from solved state based on level
    let currentTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const shuffles = lvl * 3; // L1: 3, L50: 150
    let emptyIdx = 8;
    
    for (let i = 0; i < shuffles; i++) {
      const adjacents = [];
      if (emptyIdx % 3 !== 0) adjacents.push(emptyIdx - 1);
      if (emptyIdx % 3 !== 2) adjacents.push(emptyIdx + 1);
      if (emptyIdx >= 3) adjacents.push(emptyIdx - 3);
      if (emptyIdx < 6) adjacents.push(emptyIdx + 3);
      
      const swapIdx = adjacents[Math.floor(Math.random() * adjacents.length)];
      currentTiles[emptyIdx] = currentTiles[swapIdx];
      currentTiles[swapIdx] = 0;
      emptyIdx = swapIdx;
    }
    
    // Ensure it's not already solved by chance
    if (isSolved(currentTiles)) {
        // just swap two valid ones
        const adjacents = [];
        if (emptyIdx % 3 !== 0) adjacents.push(emptyIdx - 1);
        if (emptyIdx % 3 !== 2) adjacents.push(emptyIdx + 1);
        if (emptyIdx >= 3) adjacents.push(emptyIdx - 3);
        if (emptyIdx < 6) adjacents.push(emptyIdx + 3);
        const swapIdx = adjacents[0];
        currentTiles[emptyIdx] = currentTiles[swapIdx];
        currentTiles[swapIdx] = 0;
    }

    setTiles(currentTiles);
    setIsLevelClear(false);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  const handleTileClick = (index: number) => {
    if (isLevelClear || isGameOver) return;
    const emptyIndex = tiles.indexOf(0);
    const isAdjacent = (index === emptyIndex - 1 && emptyIndex % 3 !== 0) || (index === emptyIndex + 1 && index % 3 !== 0) || (index === emptyIndex - 3) || (index === emptyIndex + 3);
    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIndex] = tiles[index]; newTiles[index] = 0;
      setTiles(newTiles);
      
      if (isSolved(newTiles)) {
        const earned = level * 20;
        setLevelScore(earned);
        setScore(prev => prev + earned);
        setIsLevelClear(true);
        if (level === 50) setIsGameOver(true);
      }
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-amber-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center">순서대로 맞추세요</h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full aspect-square bg-slate-200 p-1.5 sm:p-2 rounded-2xl">
        {tiles.map((tile, i) => (
          <button key={i} onClick={() => handleTileClick(i)} disabled={tile === 0 || isLevelClear}
            className={clsx("rounded-xl text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all duration-200",
              tile === 0 ? "bg-transparent shadow-none" : "bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:scale-95"
            )}>
            {tile !== 0 ? tile : ''}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// --- 4. Color Word Game (Stroop Test) ---
const COLORS = [
  { name: '빨강', color: '#ef4444' },
  { name: '파랑', color: '#3b82f6' },
  { name: '초록', color: '#10b981' },
  { name: '노랑', color: '#eab308' }
];

function ColorWordGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [word, setWord] = useState(COLORS[0]);
  const [ink, setInk] = useState(COLORS[1]);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const initLevel = () => {
    const randomWord = COLORS[Math.floor(Math.random() * COLORS.length)];
    const randomInk = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord(randomWord);
    setInk(randomInk);
    setIsLevelClear(false);
  };

  useEffect(() => { initLevel(); }, [initialLevel]);

  const handleColorClick = (selectedColor: string) => {
    if (isLevelClear || isGameOver) return;
    
    if (selectedColor === ink.name) {
      const earned = level * 10;
      setLevelScore(earned);
      setScore(prev => prev + earned);
      setIsLevelClear(true);
      if (level === 50) setIsGameOver(true);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel();
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-rose-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 text-center">글자의 <span className="text-rose-500">색상</span>을 맞추세요</h2>
      <p className="text-sm sm:text-base text-slate-500 mb-6 text-center">의미가 아닌 칠해진 색을 선택해야 합니다.</p>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col items-center">
        <div className="h-40 flex items-center justify-center mb-10">
          <span style={{ color: ink.color }} className="text-6xl sm:text-7xl font-black tracking-widest drop-shadow-sm">
            {word.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => handleColorClick(c.name)} disabled={isLevelClear}
              className="py-4 rounded-2xl text-xl font-bold text-slate-700 bg-white border-2 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- 5. Pattern Memory Game (Simon Says) ---
function PatternGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [activeBox, setActiveBox] = useState<number | null>(null);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const colors = [
    { id: 0, base: 'bg-red-400', active: 'bg-red-600 scale-105 shadow-[0_0_30px_rgba(220,38,38,0.6)]' },
    { id: 1, base: 'bg-blue-400', active: 'bg-blue-600 scale-105 shadow-[0_0_30px_rgba(37,99,235,0.6)]' },
    { id: 2, base: 'bg-green-400', active: 'bg-green-600 scale-105 shadow-[0_0_30px_rgba(22,163,74,0.6)]' },
    { id: 3, base: 'bg-yellow-400', active: 'bg-yellow-500 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.6)]' },
  ];

  const initLevel = (lvl: number) => {
    const seqLength = lvl + 2; // L1: 3, L50: 52
    const newSeq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setPlayerSequence([]);
    setIsLevelClear(false);
    playSequence(newSeq);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  const playSequence = async (seq: number[]) => {
    setIsShowingPattern(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    for (let i = 0; i < seq.length; i++) {
      setActiveBox(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveBox(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsShowingPattern(false);
  };

  const handleBoxClick = (id: number) => {
    if (isShowingPattern || isLevelClear || isGameOver) return;

    setActiveBox(id);
    setTimeout(() => setActiveBox(null), 200);

    const newPlayerSeq = [...playerSequence, id];
    setPlayerSequence(newPlayerSeq);

    const isCorrect = newPlayerSeq.every((val, index) => val === sequence[index]);
    
    if (!isCorrect) {
      // Failed!
      setIsGameOver(true); // End game immediately if failed
    } else if (newPlayerSeq.length === sequence.length) {
      const earned = level * 20;
      setLevelScore(earned);
      setScore(prev => prev + earned);
      setIsLevelClear(true);
      if (level === 50) setIsGameOver(true);
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-purple-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 text-center">패턴 기억 게임</h2>
      <p className="text-sm sm:text-base text-slate-500 mb-6 text-center">불이 켜지는 순서를 기억하고 따라 누르세요.</p>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col items-center">
        <div className="text-xl font-bold text-purple-600 mb-8 h-8">
          {isShowingPattern ? "순서를 기억하세요..." : (!isLevelClear && !isGameOver ? "따라 누르세요!" : "")}
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full aspect-square max-w-[300px] p-3 sm:p-4 bg-slate-200 rounded-3xl">
          {colors.map((color) => (
            <button key={color.id} onClick={() => handleBoxClick(color.id)} disabled={isShowingPattern || isLevelClear}
              className={clsx("rounded-2xl transition-all duration-200",
                activeBox === color.id ? color.active : color.base,
                isShowingPattern || isLevelClear ? "cursor-default" : "cursor-pointer active:scale-95"
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- 6. Mental Math Game ---
function MathGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [equation, setEquation] = useState({ num1: 0, num2: 0, op: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const generateEquation = (lvl: number) => {
    const isAddition = Math.random() > 0.5;
    let n1, n2, ans;
    const max = 10 + lvl * 5; // L1: 15, L50: 260
    
    if (isAddition) {
      n1 = Math.floor(Math.random() * max) + 1;
      n2 = Math.floor(Math.random() * max) + 1;
      ans = n1 + n2;
    } else {
      n1 = Math.floor(Math.random() * max) + 10;
      n2 = Math.floor(Math.random() * n1) + 1;
      ans = n1 - n2;
    }

    setEquation({ num1: n1, num2: n2, op: isAddition ? '+' : '-', answer: ans });

    // Generate options
    const opts = new Set([ans]);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5;
      if (offset !== 0 && ans + offset > 0) opts.add(ans + offset);
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setIsLevelClear(false);
  };

  useEffect(() => { generateEquation(initialLevel); }, [initialLevel]);

  const handleAnswer = (selected: number) => {
    if (isLevelClear || isGameOver) return;
    if (selected === equation.answer) {
      const earned = level * 10;
      setLevelScore(earned);
      setScore(prev => prev + earned);
      setIsLevelClear(true);
      if (level === 50) setIsGameOver(true);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    generateEquation(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px]">
      <div className="flex justify-between items-center w-full mb-4 px-4">
        <div className="text-lg font-bold text-cyan-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-lg font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center">두뇌 회전 사칙연산</h2>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col items-center">
        <div className="h-32 flex items-center justify-center mb-10 w-full bg-white rounded-3xl shadow-sm border border-slate-100">
          <span className="text-4xl sm:text-6xl font-black text-slate-800 tracking-wider">
            {equation.num1} {equation.op} {equation.num2} = ?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={isLevelClear}
              className="py-4 sm:py-5 rounded-2xl text-2xl sm:text-3xl font-bold text-slate-700 bg-white border-2 border-slate-200 shadow-sm hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 active:scale-95 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
