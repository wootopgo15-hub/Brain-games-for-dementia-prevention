import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Brain, Hash, Image as ImageIcon, Grid3X3, ArrowLeft, Palette, BrainCircuit, Calculator, Trophy, User, Users, Building, LogOut, Heart, Home, Search, Hand, Type, ArrowRight, Music, Play, Pause, Volume2, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import './index.css';

type Screen = 'LOGIN' | 'HOME' | 'RANKING' | 'NUMBER' | 'PICTURE' | 'PUZZLE' | 'COLOR_WORD' | 'PATTERN' | 'MATH' | 'ODD_ONE_OUT' | 'RPS' | 'INITIAL_QUIZ' | 'FLANKER';

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

function AdSenseAd() {
  const adPushed = useRef(false);

  useEffect(() => {
    if (!adPushed.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{ display: 'block', width: '100%', height: '100%' }}
         data-ad-client="ca-pub-7204177319630647"
         data-ad-format="rectangle"
         data-full-width-responsive="true"></ins>
  );
}

function AdModal({ type, onClose }: { type: 'ENTRY' | 'EXIT', onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#F4F6FF] rounded-xl overflow-hidden shadow-2xl flex flex-col relative w-full max-w-sm"
      >
        <div className="px-4 py-3 bg-[#F4F6FF] flex justify-between items-center border-b border-blue-100/50">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-100/50 px-1">Advertisement</span>
          <button 
            onPointerDown={(e) => {
              if (timeLeft === 0) {
                e.preventDefault();
                onClose();
              }
            }}
            disabled={timeLeft > 0}
            className={`text-sm font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1 shadow-sm active:scale-95 ${timeLeft > 0 ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-[#0B215E] text-white hover:bg-blue-900'}`}
          >
            {timeLeft > 0 ? `닫기 0${timeLeft}` : '닫기 (X)'}
          </button>
        </div>
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mb-5 text-blue-500">
            <Trophy size={28} />
          </div>
          <div className="flex flex-col items-center gap-1 mb-6">
            <h3 className="text-lg font-bold text-white bg-blue-500 px-2 py-0.5">개인전 랭킹 도전!</h3>
            <p className="text-white bg-blue-500 px-2 py-0.5 text-[13px] mt-1">
              매일매일 두뇌 훈련하고
            </p>
            <p className="text-white bg-blue-500 px-2 py-0.5 text-[13px]">
              전국 어르신들과 순위를 겨뤄보세요!
            </p>
          </div>
          <div className="p-2 bg-white rounded-lg shadow-sm w-full aspect-square flex items-center justify-center overflow-hidden">
            <AdSenseAd />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const BGM_TRACKS = [
  { id: 1, name: '경쾌한 래그타임 (메이플 리프 래그)', url: 'https://www.mfiles.co.uk/mp3-downloads/maple-leaf-rag.mp3' },
  { id: 2, name: '리드미컬한 피아노 (엔터테이너)', url: 'https://www.mfiles.co.uk/mp3-downloads/the-entertainer.mp3' },
  { id: 3, name: '빠르고 경쾌한 연주 (터키 행진곡)', url: 'https://www.mfiles.co.uk/mp3-downloads/alla-turca.mp3' },
  { id: 4, name: '빠른 왈츠 (강아지 왈츠)', url: 'https://www.mfiles.co.uk/mp3-downloads/minute-waltz.mp3' },
  { id: 5, name: '클래식 피아노 (엘리제를 위하여)', url: 'https://www.mfiles.co.uk/mp3-downloads/fur-elise.mp3' },
];

function BgmPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(BGM_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 볼륨 조절
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // 트랙이 변경될 때 오디오 소스 다시 로드 및 재생
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load(); // 새로운 src를 명시적으로 불러옴
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio play failed:", e));
        }
      }
    }
  }, [currentTrack]);

  // 재생/일시정지 상태 변경 시
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => console.log("Audio play failed:", e));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/5"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 mb-4 w-72 origin-bottom-right"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Music size={18} className="text-indigo-500" />
                  배경음악
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {BGM_TRACKS.map(track => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(track);
                      setIsPlaying(true);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between",
                      currentTrack.id === track.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <span className="truncate">{track.name}</span>
                    {currentTrack.id === track.id && isPlaying && (
                      <div className="flex gap-0.5">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-indigo-500 rounded-full" />
                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-indigo-500 rounded-full" />
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-indigo-500 rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors shrink-0"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <Volume2 size={16} className="text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95",
            isPlaying ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          )}
        >
          <Music size={24} />
        </button>

        <audio ref={audioRef} src={currentTrack.url} loop />
      </div>
    </>
  );
}

function UpdateNoticePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <h2 className="text-2xl font-black mb-1">🚀 업데이트 안내</h2>
          <p className="text-indigo-200 text-sm">2026년 3월 21일</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 text-slate-700">
          <div className="flex gap-3">
            <div className="mt-1 text-indigo-500"><CheckCircle2 size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">초성 퀴즈 대폭 업그레이드</h3>
              <p className="text-sm mt-1">단어가 100개 추가되었으며, 단계가 올라갈수록 보기 개수가 늘어나 더욱 흥미진진해졌습니다!</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mt-1 text-indigo-500"><CheckCircle2 size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">단어 기억 게임 난이도 조정</h3>
              <p className="text-sm mt-1">단어를 외울 수 있는 시간이 3초로 고정되어 집중력이 더욱 필요해졌습니다.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mt-1 text-indigo-500"><CheckCircle2 size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-900">편의성 개선</h3>
              <p className="text-sm mt-1">배경음악 창 바깥을 누르면 닫히도록 개선되었고, 2인용 게임 시작 안내가 더 친절해졌습니다.</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
          >
            확인했습니다
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  const [showUpdateNotice, setShowUpdateNotice] = useState(() => {
    return localStorage.getItem('update_notice_20260321') !== 'true';
  });
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [history, setHistory] = useState<Screen[]>([]);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  const navigateTo = (screen: Screen) => {
    setHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevScreen = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('HOME');
    }
  };
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showEntryAd, setShowEntryAd] = useState(false);
  const [showExitAd, setShowExitAd] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserData | null>(null);

  const fetchScoresFromSheet = async () => {
    let googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_WEB_APP_URL;
    if (!googleSheetUrl || !googleSheetUrl.startsWith('http')) {
      googleSheetUrl = 'https://script.google.com/macros/s/AKfycbw7Gb1OX0iXMlyJoBZef443mEpJ6_Z0mVd4biGALRhUWsGNErH90dF9jsYvsd01d8DG/exec';
    }

    const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
    };

    try {
      const response = await fetch(googleSheetUrl);
      if (!response.ok) {
        showToast('서버 응답 오류가 발생했습니다.');
        return;
      }
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse JSON:', text);
        showToast('구글 시트 스크립트 설정(doGet) 및 새 배포를 확인해주세요.');
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        const sheetScores: ScoreEntry[] = data.filter(row => row['점수']).map((row: any, index: number) => ({
          id: `sheet-${index}-${Date.now()}`,
          userType: row['참가유형'] === '개인' ? 'INDIVIDUAL' : 'CENTER',
          userName: row['이름'] || '알 수 없음',
          centerName: row['소속센터'] || '알 수 없음',
          game: row['게임종류'] || '알 수 없음',
          score: Number(row['점수']) || 0,
          timestamp: row.timestamp ? new Date(row.timestamp).getTime() : Date.now(),
        }));
        
        if (sheetScores.length > 0) {
          setScores(sheetScores);
          localStorage.setItem('brain_game_scores', JSON.stringify(sheetScores));
          showToast('데이터를 성공적으로 불러왔습니다.');
        } else {
          showToast('불러올 데이터가 없습니다.');
        }
      } else {
        showToast('불러올 데이터가 없습니다.');
      }
    } catch (error) {
      console.warn('Failed to fetch scores from Google Sheets:', error);
      showToast('네트워크 오류: 구글 시트 스크립트가 "모든 사용자" 권한으로 "새 배포"되었는지 확인해주세요.');
    }
  };

  // Load scores from local storage and Google Sheets on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('brain_game_scores');
    let localScores: ScoreEntry[] = [];
    if (savedScores) {
      try {
        localScores = JSON.parse(savedScores);
        setScores(localScores);
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }

    fetchScoresFromSheet();
  }, []);

  const handleLogin = (user: UserData) => {
    setHistory([]);
    if (user.type === 'INDIVIDUAL') {
      setPendingUser(user);
      setShowEntryAd(true);
    } else {
      setCurrentUser(user);
      navigateTo('HOME');
    }
  };

  const handleLogout = () => {
    setHistory([]);
    if (currentUser?.type === 'INDIVIDUAL') {
      setShowExitAd(true);
    } else {
      setCurrentUser(null);
      navigateTo('LOGIN');
    }
  };

  const closeEntryAd = () => {
    setHistory([]);
    setShowEntryAd(false);
    if (pendingUser) {
      setCurrentUser(pendingUser);
      navigateTo('HOME');
      setPendingUser(null);
    }
  };

  const closeExitAd = () => {
    setHistory([]);
    setShowExitAd(false);
    setCurrentUser(null);
    navigateTo('LOGIN');
  };

  const saveScore = async (game: string, score: number) => {
    if (!currentUser) {
      navigateTo('LOGIN');
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
          setToastMessage('점수가 저장되었습니다!');
          setTimeout(() => setToastMessage(null), 3000);
        }).catch(error => {
          console.warn('Failed to save score to Google Sheets:', error);
        });
      }
    }

    // Switch to ranking screen after saving (or if score is 0)
    navigateTo('RANKING');
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
      <header className="bg-white shadow-sm px-3 sm:px-4 pb-3 sm:pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-[calc(env(safe-area-inset-top)+1rem)] landscape:pb-2 landscape:pt-[calc(env(safe-area-inset-top)+0.5rem)] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {currentScreen !== 'LOGIN' && currentScreen !== 'HOME' && (
            <button 
              onClick={goBack}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 landscape:w-5 landscape:h-5" />
              <span className="text-sm font-bold text-slate-600 hidden sm:inline landscape:hidden">뒤로 가기</span>
            </button>
          )}
          <Brain className="text-indigo-600 shrink-0 w-6 h-6 sm:w-7 sm:h-7 landscape:w-5 landscape:h-5" />
          <h1 className="text-lg sm:text-xl landscape:text-base font-bold text-slate-800 truncate shrink-1">치매 예방 두뇌 게임</h1>
          <button 
            onClick={() => window.location.href = 'https://app-janggostory-com.vercel.app'}
            className="px-2 sm:px-3 py-1.5 ml-1 sm:ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 flex items-center gap-1.5 font-medium text-sm shrink-0"
            title="홈으로 돌아가기"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
            <span className="hidden sm:inline landscape:hidden">홈으로</span>
          </button>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full landscape:text-xs">
              {currentUser.type === 'INDIVIDUAL' ? <User size={14} className="sm:w-4 sm:h-4" /> : <Building size={14} className="sm:w-4 sm:h-4" />}
              <span className="truncate max-w-[50px] sm:max-w-[80px]">{currentUser.name}</span>
              <span className="text-slate-400">|</span>
              <span className="truncate max-w-[50px] sm:max-w-[80px]">{currentUser.type === 'INDIVIDUAL' ? currentUser.center : '관리자'}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 sm:p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors shrink-0" title="로그아웃">
              <LogOut className="w-5 h-5 sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 landscape:p-2 landscape:py-1">
        <AnimatePresence mode="wait">
          {currentScreen === 'LOGIN' && <LoginScreen key="login" onLogin={handleLogin} />}
          {currentScreen === 'HOME' && <HomeScreen key="home" onNavigate={navigateTo} currentUser={currentUser!} />}
          {currentScreen === 'RANKING' && <RankingScreen key="ranking" scores={scores} onRefresh={fetchScoresFromSheet} />}
          
          {currentScreen === 'NUMBER' && <NumberGame key="number" initialLevel={getSavedLevel('NUMBER')} onSaveLevel={(l) => saveLevel('NUMBER', l)} onFinish={(s) => saveScore('숫자 기억', s)} />}
          {currentScreen === 'PICTURE' && <PictureGame key="picture" initialLevel={getSavedLevel('PICTURE')} onSaveLevel={(l) => saveLevel('PICTURE', l)} onFinish={(s) => saveScore('그림 맞추기', s)} />}
          {currentScreen === 'PUZZLE' && <PuzzleGame key="puzzle" initialLevel={getSavedLevel('PUZZLE')} onSaveLevel={(l) => saveLevel('PUZZLE', l)} onFinish={(s) => saveScore('슬라이딩 퍼즐', s)} />}
          {currentScreen === 'COLOR_WORD' && <LandscapeGameWrapper key="color_word_wrapper" title="색상 단어 게임 (스트룹)" onBack={() => navigateTo('HOME')}><ColorWordGame key="color_word" initialLevel={getSavedLevel('COLOR_WORD')} onSaveLevel={(l) => saveLevel('COLOR_WORD', l)} onFinish={(s) => saveScore('색상 단어', s)} /></LandscapeGameWrapper>}
          {currentScreen === 'PATTERN' && <PatternGame key="pattern" initialLevel={getSavedLevel('PATTERN')} onSaveLevel={(l) => saveLevel('PATTERN', l)} onFinish={(s) => saveScore('패턴 기억', s)} />}
          {currentScreen === 'MATH' && <LandscapeGameWrapper key="math_wrapper" title="두뇌 회전 사칙연산" onBack={() => navigateTo('HOME')}><MathGame key="math" initialLevel={getSavedLevel('MATH')} onSaveLevel={(l) => saveLevel('MATH', l)} onFinish={(s) => saveScore('사칙연산', s)} /></LandscapeGameWrapper>}
          {currentScreen === 'ODD_ONE_OUT' && <LandscapeGameWrapper key="odd_one_out_wrapper" title="다른 하나 찾기" onBack={() => navigateTo('HOME')}><OddOneOutGame key="odd_one_out" initialLevel={getSavedLevel('ODD_ONE_OUT')} onSaveLevel={(l) => saveLevel('ODD_ONE_OUT', l)} onFinish={(s) => saveScore('다른 하나 찾기', s)} /></LandscapeGameWrapper>}
          {currentScreen === 'RPS' && <LandscapeGameWrapper key="rps_wrapper" title="가위바위보 두뇌" onBack={() => navigateTo('HOME')}><RPSBrainGame key="rps" initialLevel={getSavedLevel('RPS')} onSaveLevel={(l) => saveLevel('RPS', l)} onFinish={(s) => saveScore('가위바위보 두뇌', s)} /></LandscapeGameWrapper>}
          {currentScreen === 'INITIAL_QUIZ' && <LandscapeGameWrapper key="initial_quiz_wrapper" title="초성 퀴즈" onBack={() => navigateTo('HOME')}><InitialQuizGame key="initial_quiz" initialLevel={getSavedLevel('INITIAL_QUIZ')} onSaveLevel={(l) => saveLevel('INITIAL_QUIZ', l)} onFinish={(s) => saveScore('초성 퀴즈', s)} /></LandscapeGameWrapper>}
          {currentScreen === 'FLANKER' && <LandscapeGameWrapper key="flanker_wrapper" title="방해꾼 화살표" onBack={() => navigateTo('HOME')}><FlankerTaskGame key="flanker" initialLevel={getSavedLevel('FLANKER')} onSaveLevel={(l) => saveLevel('FLANKER', l)} onFinish={(s) => saveScore('방해꾼 화살표', s)} /></LandscapeGameWrapper>}
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

      <AnimatePresence>
        {showEntryAd && <AdModal key="entry-ad" type="ENTRY" onClose={closeEntryAd} />}
        {showExitAd && <AdModal key="exit-ad" type="EXIT" onClose={closeExitAd} />}
        {showUpdateNotice && (
          <UpdateNoticePopup 
            key="update-notice" 
            onClose={() => {
              localStorage.setItem('update_notice_20260321', 'true');
              setShowUpdateNotice(false);
            }} 
          />
        )}
      </AnimatePresence>

      <BgmPlayer />
    </div>
  );
}

function HomeScreen({ onNavigate, currentUser }: { onNavigate: (s: Screen) => void, currentUser: UserData }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md landscape:max-w-5xl flex flex-col gap-3 pb-8 landscape:pb-2"
    >
      <button onClick={() => onNavigate('RANKING')} className="mb-4 landscape:mb-2 flex items-center justify-center gap-2 w-full py-4 landscape:py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] font-bold text-lg">
        <Trophy size={24} />
        실시간 랭킹 보기
      </button>

      <div className="w-full mt-2">
        <h2 className="text-xl font-bold mb-3 text-slate-700 flex items-center gap-2 px-2">
          <Users size={24} className="text-indigo-500" />
          화면 보고 같이 할 수 있는 게임
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => onNavigate('COLOR_WORD')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-rose-100 p-3 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
              <Palette size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800">색상 단어 게임 (스트룹)</h3>
              <p className="text-sm text-slate-500">글자의 의미가 아닌 '색상'을 맞추세요</p>
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

          <button onClick={() => onNavigate('ODD_ONE_OUT')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <Search size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">다른 하나 찾기 <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md tracking-wider">NEW</span></h3>
              <p className="text-sm text-slate-500">여러 그림 중 다른 하나를 찾아보세요</p>
            </div>
          </button>

          <button onClick={() => onNavigate('RPS')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
              <Hand size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">가위바위보 두뇌 <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md tracking-wider">NEW</span></h3>
              <p className="text-sm text-slate-500">지시에 따라 이기거나 지거나 비기세요</p>
            </div>
          </button>

          <button onClick={() => onNavigate('INITIAL_QUIZ')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-pink-100 p-3 rounded-xl text-pink-600 group-hover:scale-110 transition-transform">
              <Type size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">초성 퀴즈 <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md tracking-wider">NEW</span></h3>
              <p className="text-sm text-slate-500">초성과 힌트를 보고 단어를 맞추세요</p>
            </div>
          </button>

          <button onClick={() => onNavigate('FLANKER')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-teal-100 p-3 rounded-xl text-teal-600 group-hover:scale-110 transition-transform">
              <ArrowRight size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">방해꾼 화살표 <span className="ml-2 px-1.5 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-md tracking-wider">NEW</span></h3>
              <p className="text-sm text-slate-500">가운데 화살표의 방향을 맞추세요</p>
            </div>
          </button>
        </div>
      </div>

      <div className="w-full mb-4">
        <h2 className="text-xl font-bold mb-3 text-slate-700 flex items-center gap-2 px-2 mt-4">
          <User size={24} className="text-emerald-500" />
          혼자 집중해서 하는 게임
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

          <button onClick={() => onNavigate('PATTERN')} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
              <BrainCircuit size={28} />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-slate-800">패턴 기억 게임</h3>
              <p className="text-sm text-slate-500">불이 켜지는 순서를 기억해 따라하세요</p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Login Screen ---
function LoginScreen({ onLogin }: { onLogin: (user: UserData) => void }) {
  const [tab, setTab] = useState<'INDIVIDUAL' | 'CENTER'>('CENTER');
  
  // Individual State
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [center, setCenter] = useState('');
  const [recentIndividuals, setRecentIndividuals] = useState<{name: string, birth: string, center: string}[]>([]);

  // Center State
  const [centerName, setCenterName] = useState('');
  const [recentCenters, setRecentCenters] = useState<string[]>([]);

  useEffect(() => {
    const savedCenters = localStorage.getItem('brain_game_recent_centers');
    if (savedCenters) {
      try {
        setRecentCenters(JSON.parse(savedCenters));
      } catch (e) {
        console.error("Failed to parse recent centers", e);
      }
    }

    const savedIndividuals = localStorage.getItem('brain_game_recent_individuals');
    if (savedIndividuals) {
      try {
        setRecentIndividuals(JSON.parse(savedIndividuals));
      } catch (e) {
        console.error("Failed to parse recent individuals", e);
      }
    }
  }, []);

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birth && center) {
      const newInd = { name, birth, center };
      const updatedInds = [newInd, ...recentIndividuals.filter(i => !(i.name === name && i.birth === birth && i.center === center))].slice(0, 5);
      setRecentIndividuals(updatedInds);
      localStorage.setItem('brain_game_recent_individuals', JSON.stringify(updatedInds));
      onLogin({ type: 'INDIVIDUAL', name, birth, center });
    }
  };

  const handleCenterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerName) {
      const updatedCenters = [centerName, ...recentCenters.filter(c => c !== centerName)].slice(0, 5);
      setRecentCenters(updatedCenters);
      localStorage.setItem('brain_game_recent_centers', JSON.stringify(updatedCenters));
      onLogin({ type: 'CENTER', name: centerName });
    }
  };

  const handleRecentCenterClick = (name: string) => {
    setCenterName(name);
  };

  const handleRecentIndividualClick = (ind: {name: string, birth: string, center: string}) => {
    setName(ind.name);
    setBirth(ind.birth);
    setCenter(ind.center);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setTab('CENTER')}
          className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'CENTER' ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50")}
        >
          센터 로그인
        </button>
        <button 
          onClick={() => setTab('INDIVIDUAL')}
          className={clsx("flex-1 py-4 text-center font-bold transition-colors", tab === 'INDIVIDUAL' ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50")}
        >
          개인전 참가
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
            {recentIndividuals.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">최근 로그인한 사용자</label>
                <div className="flex flex-wrap gap-2">
                  {recentIndividuals.map((ind, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRecentIndividualClick(ind)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                    >
                      {ind.name} ({ind.center})
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            {recentCenters.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">최근 로그인한 센터</label>
                <div className="flex flex-wrap gap-2">
                  {recentCenters.map((name, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRecentCenterClick(name)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

function RankingScreen({ scores, onRefresh }: { scores: ScoreEntry[], onRefresh?: () => void }) {
  const [tab, setTab] = useState<'INDIVIDUAL' | 'CENTER'>('CENTER');
  const [selectedGame, setSelectedGame] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl landscape:max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-[85vh] sm:h-[80vh] landscape:h-[90vh]">
      <div className="bg-amber-400 p-6 landscape:p-3 text-center relative flex flex-col landscape:flex-row items-center justify-center gap-2">
        <Trophy size={48} className="mx-auto landscape:mx-0 text-amber-100 mb-2 landscape:mb-0 landscape:w-8 landscape:h-8" />
        <h2 className="text-3xl landscape:text-xl font-black text-amber-900">명예의 전당</h2>
        {onRefresh && (
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="absolute top-6 right-6 landscape:top-1/2 landscape:-translate-y-1/2 landscape:right-4 p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
            title="새로고침"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={clsx(isRefreshing && "animate-spin", "landscape:w-4 landscape:h-4")}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
          </button>
        )}
      </div>

      <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
        <button onClick={() => setTab('CENTER')} className={clsx("flex-1 py-4 landscape:py-2 text-center font-bold transition-colors text-sm sm:text-base", tab === 'CENTER' ? "bg-white text-amber-600 border-b-2 border-amber-500" : "text-slate-500 hover:bg-slate-100")}>
          센터별 랭킹
        </button>
        <button onClick={() => setTab('INDIVIDUAL')} className={clsx("flex-1 py-4 landscape:py-2 text-center font-bold transition-colors text-sm sm:text-base", tab === 'INDIVIDUAL' ? "bg-white text-amber-600 border-b-2 border-amber-500" : "text-slate-500 hover:bg-slate-100")}>
          개인전 랭킹
        </button>
      </div>

      <div className="bg-white border-b border-slate-100 px-4 py-3 landscape:py-2 overflow-x-auto whitespace-nowrap flex gap-2 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {GAME_TYPES.map(game => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={clsx(
              "px-4 py-1.5 landscape:py-1 rounded-full text-sm landscape:text-xs font-bold transition-colors",
              selectedGame === game.id 
                ? "bg-amber-100 text-amber-700 border border-amber-200" 
                : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
            )}
          >
            {game.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 landscape:p-3 bg-slate-50">
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

function LandscapeGameWrapper({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) {
  const [isStarted, setIsStarted] = useState(false);

  if (!isStarted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full h-full flex flex-col items-center justify-center p-4 landscape:p-2">
        <div className="bg-white p-6 sm:p-8 landscape:p-4 rounded-3xl shadow-xl max-w-sm landscape:max-w-2xl w-full border border-slate-100 text-center landscape:text-left relative overflow-hidden flex flex-col landscape:flex-row items-center gap-2 landscape:gap-6">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500 landscape:w-2 landscape:h-full" />
          
          <div className="flex flex-col items-center justify-center landscape:pl-4">
            <div className="bg-indigo-50 w-20 h-20 sm:w-24 sm:h-24 landscape:w-20 landscape:h-20 rounded-full flex items-center justify-center mb-4 landscape:mb-0 text-indigo-600 shadow-inner shrink-0">
              <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 landscape:w-10 landscape:h-10 rotate-90" />
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full">
            <h2 className="text-xl sm:text-2xl landscape:text-xl font-black text-slate-800 mb-1 sm:mb-2 landscape:mb-1">{title}</h2>
            <p className="text-sm sm:text-base landscape:text-sm text-slate-500 font-medium mb-4 landscape:mb-2">2인용 협동/대결 게임</p>
            
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 landscape:p-3 mb-6 landscape:mb-3 border border-slate-100">
              <p className="text-sm sm:text-base landscape:text-sm text-slate-700 leading-relaxed font-bold">
                이 게임은 화면을 마주보고<br className="landscape:hidden" /> 함께 플레이하는 게임입니다.
              </p>
              <p className="text-indigo-600 font-black text-base sm:text-lg landscape:text-sm mt-2 bg-indigo-100/50 py-1.5 sm:py-2 landscape:py-1 px-4 rounded-xl inline-block">
                스마트폰을 가로로 돌려주시고,<br className="landscape:hidden" /> 오른쪽 아래 음악을 켜주세요!
              </p>
            </div>

            <div className="flex gap-3 justify-center landscape:justify-start">
              <button onClick={onBack} className="flex-1 landscape:flex-none landscape:w-28 py-3 sm:py-3.5 landscape:py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm sm:text-base landscape:text-sm">
                돌아가기
              </button>
              <button onClick={() => setIsStarted(true)} className="flex-1 landscape:flex-none landscape:w-40 py-3 sm:py-3.5 landscape:py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base landscape:text-sm">
                시작하기
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-indigo-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center landscape:hidden">1부터 {getTargetCount(level)}까지 순서대로 누르세요</h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full aspect-square landscape:max-w-[60vh] landscape:max-h-[60vh] mx-auto">
        {numbers.map((num, i) => {
          const isHidden = num === null || num < currentTarget;
          return (
            <button key={i} disabled={isHidden || isLevelClear} onPointerDown={() => handleNumberClick(num)}
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
  const [isShowing, setIsShowing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getPairCount = (lvl: number) => Math.min(2 + Math.floor(lvl / 2), 8); // L1: 2, L12+: 8

  const initLevel = (lvl: number) => {
    const pairCount = getPairCount(lvl);
    const selectedEmojis = emojis.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((content, i) => ({ id: i, content, isFlipped: true, isMatched: false }));
    setCards(deck);
    setSelectedIndices([]);
    setIsLevelClear(false);
    setIsShowing(true);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    if (isShowing) {
      timerRef.current = setTimeout(() => {
        setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
        setIsShowing(false);
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isShowing]);

  const handleCardClick = (index: number) => {
    if (isShowing || isLevelClear || selectedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newSelected = [...selectedIndices, index];

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (newCards[first].content === newCards[second].content) {
        // 맞았을 때 즉시 처리
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setSelectedIndices([]);
        
        if (newCards.every(c => c.isMatched)) {
          const earned = level * 15;
          setLevelScore(earned);
          setScore(prev => prev + earned);
          setIsLevelClear(true);
          if (level === 50) setIsGameOver(true);
        }
      } else {
        // 틀렸을 때만 딜레이
        setSelectedIndices(newSelected);
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            return updated;
          });
          setSelectedIndices([]);
        }, 500);
      }
    } else {
      setSelectedIndices(newSelected);
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center landscape:hidden">
        {isShowing ? <span className="text-rose-500">3초 동안 그림을 기억하세요!</span> : "같은 그림을 찾으세요"}
      </h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-4 gap-2 w-full aspect-square landscape:max-w-[60vh] landscape:max-h-[60vh] mx-auto">
        {cards.map((card, i) => (
          <button key={card.id} onPointerDown={() => handleCardClick(i)} disabled={card.isMatched || card.isFlipped || isLevelClear}
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-amber-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center landscape:hidden">순서대로 맞추세요</h2>
      
      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full aspect-square landscape:max-w-[60vh] landscape:max-h-[60vh] mx-auto bg-slate-200 p-1.5 sm:p-2 rounded-2xl">
        {tiles.map((tile, i) => (
          <button key={i} onPointerDown={() => handleTileClick(i)} disabled={tile === 0 || isLevelClear}
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
  { name: '노랑', color: '#eab308' },
  { name: '주황', color: '#f97316' },
  { name: '보라', color: '#a855f7' },
  { name: '분홍', color: '#ec4899' },
  { name: '검정', color: '#1f2937' },
  { name: '회색', color: '#6b7280' }
];

function ColorWordGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [word, setWord] = useState(COLORS[0]);
  const [ink, setInk] = useState(COLORS[1]);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [correctCount, setCorrectCount] = useState(0);

  const getColorCount = (lvl: number) => {
    return Math.min(9, 4 + Math.floor(lvl / 10));
  };

  const nextWord = (lvl: number) => {
    const count = getColorCount(lvl);
    const activeColors = COLORS.slice(0, count);
    const randomWord = activeColors[Math.floor(Math.random() * activeColors.length)];
    const randomInk = activeColors[Math.floor(Math.random() * activeColors.length)];
    setWord(randomWord);
    setInk(randomInk);
  };

  const initLevel = (lvl: number) => {
    setIsLevelClear(false);
    setTimeLeft(30);
    setLevelScore(0);
    setCorrectCount(0);
    nextWord(lvl);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLevelClear && !isGameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(timer);
            setIsLevelClear(true);
            if (level >= 50) setIsGameOver(true);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isLevelClear, isGameOver, timeLeft, level]);

  const handleColorClick = (selectedColor: string) => {
    if (isLevelClear || isGameOver || timeLeft <= 0) return;
    
    if (selectedColor === ink.name) {
      const earned = 10;
      setLevelScore(prev => prev + earned);
      setScore(prev => prev + earned);
      setCorrectCount(prev => prev + 1);
      nextWord(level);
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setLevelScore(prev => Math.max(0, prev - 5));
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  const activeColors = COLORS.slice(0, getColorCount(level));
  const gridCols = activeColors.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-rose-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 sm:mb-4 overflow-hidden">
        <div className="bg-rose-500 h-full transition-all duration-100" style={{ width: `${(timeLeft / 30) * 100}%` }} />
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:w-1/2">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 text-center landscape:hidden">글자의 <span className="text-rose-500">색상</span>을 맞추세요</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-2 text-center landscape:hidden">30초 동안 최대한 많이 맞추세요!</p>
          <p className="text-sm font-bold text-rose-500 mb-4 landscape:hidden">현재 단계 맞춘 횟수: {correctCount}번</p>
          <div className="h-24 landscape:h-20 flex items-center justify-center mb-6 landscape:mb-0">
            <span style={{ color: ink.color }} className="text-6xl sm:text-7xl landscape:text-5xl font-black tracking-widest drop-shadow-sm">
              {word.name}
            </span>
          </div>
        </div>

        <div className="w-full landscape:w-1/2 flex flex-col items-center justify-center">
          <div className={`grid ${gridCols} gap-2 sm:gap-3 w-full max-w-sm`}>
            {activeColors.map((c, i) => (
              <button key={i} onPointerDown={() => handleColorClick(c.name)} disabled={isLevelClear}
                className="py-3 landscape:py-2 rounded-xl text-lg font-bold text-slate-700 bg-white border-2 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
              >
                {c.name}
              </button>
            ))}
          </div>
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
    { id: 0, base: 'bg-red-400 border-4 border-transparent', active: 'bg-red-500 scale-110 border-4 border-white shadow-[0_0_40px_rgba(239,68,68,1)] z-10 brightness-125 ring-4 ring-red-400' },
    { id: 1, base: 'bg-blue-400 border-4 border-transparent', active: 'bg-blue-500 scale-110 border-4 border-white shadow-[0_0_40px_rgba(59,130,246,1)] z-10 brightness-125 ring-4 ring-blue-400' },
    { id: 2, base: 'bg-green-400 border-4 border-transparent', active: 'bg-green-500 scale-110 border-4 border-white shadow-[0_0_40px_rgba(34,197,94,1)] z-10 brightness-125 ring-4 ring-green-400' },
    { id: 3, base: 'bg-yellow-400 border-4 border-transparent', active: 'bg-yellow-400 scale-110 border-4 border-white shadow-[0_0_40px_rgba(250,204,21,1)] z-10 brightness-125 ring-4 ring-yellow-400' },
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-purple-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 text-center landscape:hidden">패턴 기억 게임</h2>
      <p className="text-sm sm:text-base text-slate-500 mb-6 text-center landscape:hidden">불이 켜지는 순서를 기억하고 따라 누르세요.</p>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col items-center">
        <div className="text-lg sm:text-xl font-bold text-purple-600 mb-4 sm:mb-8 h-6 sm:h-8">
          {isShowingPattern ? "순서를 기억하세요..." : (!isLevelClear && !isGameOver ? "따라 누르세요!" : "")}
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full aspect-square max-w-[300px] landscape:max-w-[55vh] landscape:max-h-[55vh] mx-auto p-3 sm:p-4 bg-slate-200 rounded-3xl">
          {colors.map((color) => (
            <button key={color.id} onPointerDown={() => handleBoxClick(color.id)} disabled={isShowingPattern || isLevelClear}
              className={clsx("rounded-2xl transition-all duration-200 relative",
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
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-cyan-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:w-1/2 w-full">
          <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 text-slate-800 text-center landscape:hidden">두뇌 회전 사칙연산</h2>
          <div className="h-32 landscape:h-20 flex items-center justify-center mb-10 landscape:mb-0 w-full bg-white rounded-3xl shadow-sm border border-slate-100">
            <span className="text-4xl sm:text-6xl landscape:text-4xl font-black text-slate-800 tracking-wider">
              {equation.num1} {equation.op} {equation.num2} = ?
            </span>
          </div>
        </div>

        <div className="w-full landscape:w-1/2 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
            {options.map((opt, i) => (
              <button key={i} onPointerDown={() => handleAnswer(opt)} disabled={isLevelClear}
                className="py-4 sm:py-5 landscape:py-2 rounded-2xl text-2xl sm:text-3xl landscape:text-xl font-bold text-slate-700 bg-white border-2 border-slate-200 shadow-sm hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 active:scale-95 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- 7. Odd One Out Game (다른 하나 찾기) ---
function OddOneOutGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [items, setItems] = useState<{id: number, emoji: string, isOdd: boolean}[]>([]);
  const [gridSize, setGridSize] = useState(2);
  const [timeLeft, setTimeLeft] = useState(10);

  const emojis = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🥝", "🍍", "🍔", "🍕", "🌭", "🌮", "🐶", "🐱", "🐭", "🐹"];

  const initLevel = (lvl: number) => {
    setIsLevelClear(false);
    setTimeLeft(10);
    const size = Math.min(2 + Math.floor((lvl - 1) / 3), 6); // 2x2 up to 6x6
    setGridSize(size);
    
    const totalItems = size * size;
    const baseEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    let oddEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    while (oddEmoji === baseEmoji) {
      oddEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    }

    const oddIndex = Math.floor(Math.random() * totalItems);
    const newItems = Array.from({ length: totalItems }).map((_, i) => ({
      id: i,
      emoji: i === oddIndex ? oddEmoji : baseEmoji,
      isOdd: i === oddIndex
    }));
    setItems(newItems);
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    if (isLevelClear || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLevelClear, isGameOver, level]);

  const handleItemClick = (isOdd: boolean) => {
    if (isLevelClear || isGameOver) return;
    if (isOdd) {
      const earned = level * 10 + timeLeft * 2;
      setLevelScore(earned);
      setScore(prev => prev + earned);
      setIsLevelClear(true);
      if (level === 50) setIsGameOver(true);
    } else {
      setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 sm:mb-4 overflow-hidden">
        <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(timeLeft / 10) * 100}%` }} />
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:hidden">
          <h2 className="text-lg sm:text-xl font-bold mb-6 landscape:mb-0 text-slate-800 text-center">다른 하나를 찾으세요!</h2>
        </div>

        <div className="w-full landscape:w-full flex items-center justify-center">
          <div 
            className="grid gap-2 w-full max-w-[300px] landscape:max-w-[60vh] landscape:max-h-[60vh] aspect-square mx-auto" 
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.isOdd)}
                className="aspect-square bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl sm:text-4xl landscape:text-2xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- 8. RPS Brain Game (가위바위보 두뇌 게임) ---
function RPSBrainGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [opponent, setOpponent] = useState<'✌️' | '✊' | '🖐️'>('✊');
  const [instruction, setInstruction] = useState<'WIN' | 'LOSE' | 'DRAW'>('WIN');
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  
  const choices: ('✌️' | '✊' | '🖐️')[] = ['✌️', '✊', '🖐️'];
  const instructions: ('WIN' | 'LOSE' | 'DRAW')[] = ['WIN', 'LOSE', 'DRAW'];

  const initRound = () => {
    setOpponent(choices[Math.floor(Math.random() * choices.length)]);
    setInstruction(instructions[Math.floor(Math.random() * instructions.length)]);
    setTimeLeft(Math.max(2, 5 - Math.floor(level / 10)));
  };

  const initLevel = (lvl: number) => {
    setIsLevelClear(false);
    setLevelScore(0);
    setRound(1);
    initRound();
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    if (isLevelClear || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLevelClear, isGameOver, round, level]);

  const handleChoice = (choice: '✌️' | '✊' | '🖐️') => {
    if (isLevelClear || isGameOver) return;
    
    let isCorrect = false;
    if (instruction === 'DRAW' && choice === opponent) isCorrect = true;
    if (instruction === 'WIN') {
      if ((choice === '✊' && opponent === '✌️') || (choice === '🖐️' && opponent === '✊') || (choice === '✌️' && opponent === '🖐️')) isCorrect = true;
    }
    if (instruction === 'LOSE') {
      if ((choice === '✌️' && opponent === '✊') || (choice === '✊' && opponent === '🖐️') || (choice === '🖐️' && opponent === '✌️')) isCorrect = true;
    }

    if (isCorrect) {
      if (round >= 5) {
        const earned = level * 15;
        setLevelScore(earned);
        setScore(prev => prev + earned);
        setIsLevelClear(true);
        if (level === 50) setIsGameOver(true);
      } else {
        setRound(r => r + 1);
        initRound();
      }
    } else {
      setIsGameOver(true);
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 sm:mb-4 overflow-hidden">
        <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(timeLeft / Math.max(2, 5 - Math.floor(level / 10))) * 100}%` }} />
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:w-1/2">
          <div className="text-center mb-8 landscape:mb-0">
            <div className="text-6xl landscape:text-5xl mb-4 landscape:mb-2">{opponent}</div>
            <h2 className={clsx("text-2xl sm:text-3xl font-black", 
              instruction === 'WIN' ? "text-blue-600" : 
              instruction === 'LOSE' ? "text-rose-600" : "text-emerald-600"
            )}>
              {instruction === 'WIN' ? "이기세요!" : instruction === 'LOSE' ? "지세요!" : "비기세요!"}
            </h2>
            <p className="text-slate-500 mt-2 font-bold landscape:hidden">{round} / 5 라운드</p>
          </div>
        </div>

        <div className="w-full landscape:w-1/2 flex items-center justify-center">
          <div className="flex gap-4 justify-center w-full">
            {choices.map(c => (
              <button key={c} onClick={() => handleChoice(c)} className="w-24 h-24 landscape:w-16 landscape:h-16 bg-white rounded-2xl shadow-md border-2 border-slate-100 text-5xl landscape:text-3xl hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all">
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- 9. Initial Consonant Quiz (초성 퀴즈) ---
const INITIAL_WORDS = [
  { word: "사과", initial: "ㅅㄱ", hint: "빨간 과일" },
  { word: "학교", initial: "ㅎㄱ", hint: "공부하는 곳" },
  { word: "바다", initial: "ㅂㄷ", hint: "여름에 가는 곳" },
  { word: "피자", initial: "ㅍㅈ", hint: "동그란 서양 음식" },
  { word: "우산", initial: "ㅇㅅ", hint: "비 올 때 쓰는 것" },
  { word: "안경", initial: "ㅇㄱ", hint: "눈이 나쁠 때 쓰는 것" },
  { word: "시계", initial: "ㅅㄱ", hint: "시간을 보는 것" },
  { word: "가방", initial: "ㄱㅂ", hint: "물건을 넣는 것" },
  { word: "사진", initial: "ㅅㅈ", hint: "추억을 남기는 것" },
  { word: "가족", initial: "ㄱㅈ", hint: "엄마, 아빠, 나" },
  { word: "친구", initial: "ㅊㄱ", hint: "나와 친한 사람" },
  { word: "사랑", initial: "ㅅㄹ", hint: "마음을 표현하는 말" },
  { word: "행복", initial: "ㅎㅂ", hint: "기분이 좋을 때" },
  { word: "건강", initial: "ㄱㄱ", hint: "아프지 않은 상태" },
  { word: "운동", initial: "ㅇㄷ", hint: "몸을 움직이는 것" },
  { word: "고양이", initial: "ㄱㅇㅇ", hint: "야옹야옹 우는 동물" },
  { word: "강아지", initial: "ㄱㅇㅈ", hint: "멍멍 우는 동물" },
  { word: "호랑이", initial: "ㅎㄹㅇ", hint: "어흥! 산중 호걸" },
  { word: "코끼리", initial: "ㅋㅋㄹ", hint: "코가 긴 동물" },
  { word: "기린", initial: "ㄱㄹ", hint: "목이 긴 동물" },
  { word: "원숭이", initial: "ㅇㅅㅇ", hint: "바나나를 좋아하는 동물" },
  { word: "토끼", initial: "ㅌㄲ", hint: "깡충깡충 뛰는 동물" },
  { word: "거북이", initial: "ㄱㅂㅇ", hint: "느릿느릿 걷는 동물" },
  { word: "돼지", initial: "ㄷㅈ", hint: "꿀꿀 우는 동물" },
  { word: "송아지", initial: "ㅅㅇㅈ", hint: "소의 새끼" },
  { word: "병아리", initial: "ㅂㅇㄹ", hint: "닭의 새끼, 삐약삐약" },
  { word: "비행기", initial: "ㅂㅎㄱ", hint: "하늘을 나는 탈것" },
  { word: "자동차", initial: "ㅈㄷㅊ", hint: "도로를 달리는 탈것" },
  { word: "자전거", initial: "ㅈㅈㄱ", hint: "페달을 밟아 타는 것" },
  { word: "기차", initial: "ㄱㅊ", hint: "칙칙폭폭 철길을 달리는 것" },
  { word: "지하철", initial: "ㅈㅎㅊ", hint: "땅속으로 다니는 기차" },
  { word: "선박", initial: "ㅅㅂ", hint: "바다를 건너는 탈것" },
  { word: "오토바이", initial: "ㅇㅌㅂㅇ", hint: "바퀴가 두 개인 엔진 탈것" },
  { word: "헬리콥터", initial: "ㅎㄹㅋㅌ", hint: "프로펠러로 나는 탈것" },
  { word: "컴퓨터", initial: "ㅋㅍㅌ", hint: "인터넷을 할 수 있는 기계" },
  { word: "스마트폰", initial: "ㅅㅁㅌㅍ", hint: "손에 들고 다니는 전화기" },
  { word: "텔레비전", initial: "ㅌㄹㅂㅈ", hint: "방송을 보는 기계" },
  { word: "냉장고", initial: "ㄴㅈㄱ", hint: "음식을 차갑게 보관하는 곳" },
  { word: "세탁기", initial: "ㅅㅌㄱ", hint: "옷을 빨아주는 기계" },
  { word: "에어컨", initial: "ㅇㅇㅋ", hint: "여름에 시원한 바람이 나오는 기계" },
  { word: "선풍기", initial: "ㅅㅍㄱ", hint: "날개가 돌아가며 바람을 내는 기계" },
  { word: "청소기", initial: "ㅊㅅㄱ", hint: "먼지를 빨아들이는 기계" },
  { word: "전자레인지", initial: "ㅈㅈㄹㅇㅈ", hint: "음식을 데우는 기계" },
  { word: "침대", initial: "ㅊㄷ", hint: "잠을 자는 가구" },
  { word: "책상", initial: "ㅊㅅ", hint: "공부하거나 일할 때 쓰는 가구" },
  { word: "의자", initial: "ㅇㅈ", hint: "앉을 때 쓰는 가구" },
  { word: "옷장", initial: "ㅇㅈ", hint: "옷을 걸어두는 가구" },
  { word: "신발장", initial: "ㅅㅂㅈ", hint: "신발을 보관하는 가구" },
  { word: "소파", initial: "ㅅㅍ", hint: "거실에 있는 푹신한 의자" },
  { word: "식탁", initial: "ㅅㅌ", hint: "밥을 먹을 때 쓰는 상" },
  { word: "거울", initial: "ㄱㅇ", hint: "내 얼굴을 비춰보는 것" },
  { word: "칫솔", initial: "ㅊㅅ", hint: "이를 닦을 때 쓰는 것" },
  { word: "치약", initial: "ㅊㅇ", hint: "칫솔에 묻혀 쓰는 것" },
  { word: "비누", initial: "ㅂㄴ", hint: "손을 씻을 때 거품을 내는 것" },
  { word: "수건", initial: "ㅅㄱ", hint: "물기를 닦는 천" },
  { word: "샴푸", initial: "ㅅㅍ", hint: "머리를 감을 때 쓰는 것" },
  { word: "휴지", initial: "ㅎㅈ", hint: "코를 풀거나 더러운 것을 닦는 종이" },
  { word: "연필", initial: "ㅇㅍ", hint: "글씨를 쓰는 도구" },
  { word: "지우개", initial: "ㅈㅇㄱ", hint: "연필 글씨를 지우는 것" },
  { word: "볼펜", initial: "ㅂㅍ", hint: "잉크가 나오는 필기도구" },
  { word: "필통", initial: "ㅍㅌ", hint: "연필과 지우개를 넣는 통" },
  { word: "공책", initial: "ㄱㅊ", hint: "글씨를 쓰는 종이 묶음" },
  { word: "가위", initial: "ㄱㅇ", hint: "종이를 자르는 도구" },
  { word: "딱풀", initial: "ㄸㅍ", hint: "종이를 붙이는 도구" },
  { word: "줄자", initial: "ㅈㅈ", hint: "길이를 재는 도구" },
  { word: "피아노", initial: "ㅍㅇㄴ", hint: "건반을 눌러 소리 내는 악기" },
  { word: "기타", initial: "ㄱㅌ", hint: "줄을 튕겨 소리 내는 악기" },
  { word: "바이올린", initial: "ㅂㅇㅇㄹ", hint: "활로 켜서 소리 내는 악기" },
  { word: "드럼", initial: "ㄷㄹ", hint: "채로 두드려 소리 내는 악기" },
  { word: "축구", initial: "ㅊㄱ", hint: "발로 공을 차는 스포츠" },
  { word: "농구", initial: "ㄴㄱ", hint: "손으로 공을 던져 넣는 스포츠" },
  { word: "야구", initial: "ㅇㄱ", hint: "방망이로 공을 치는 스포츠" },
  { word: "배구", initial: "ㅂㄱ", hint: "네트 너머로 공을 치는 스포츠" },
  { word: "수영", initial: "ㅅㅇ", hint: "물속에서 헤엄치는 스포츠" },
  { word: "태권도", initial: "ㅌㄱㄷ", hint: "발차기를 주로 하는 한국 무술" },
  { word: "김치", initial: "ㄱㅊ", hint: "배추로 만든 매콤한 한국 음식" },
  { word: "불고기", initial: "ㅂㄱㄱ", hint: "달콤한 간장 양념에 잰 고기" },
  { word: "비빔밥", initial: "ㅂㅂㅂ", hint: "밥에 여러 나물을 비벼 먹는 음식" },
  { word: "떡볶이", initial: "ㄸㅂㅇ", hint: "매콤하고 쫄깃한 분식" },
  { word: "김밥", initial: "ㄱㅂ", hint: "밥과 반찬을 김으로 만 음식" },
  { word: "라면", initial: "ㄹㅁ", hint: "꼬불꼬불한 면이 있는 국물 요리" },
  { word: "짜장면", initial: "ㅉㅈㅁ", hint: "검은 춘장 소스에 비벼 먹는 면" },
  { word: "짬뽕", initial: "ㅉㅃ", hint: "해물이 들어간 얼큰한 국물 면" },
  { word: "탕수육", initial: "ㅌㅅㅇ", hint: "돼지고기를 튀겨 새콤달콤한 소스에 버무린 요리" },
  { word: "치킨", initial: "ㅊㅋ", hint: "닭을 기름에 튀긴 요리" },
  { word: "햄버거", initial: "ㅎㅂㄱ", hint: "빵 사이에 고기 패티를 넣은 음식" },
  { word: "샌드위치", initial: "ㅅㄷㅇㅊ", hint: "식빵 사이에 재료를 넣은 음식" },
  { word: "아이스크림", initial: "ㅇㅇㅅㅋㄹ", hint: "차갑고 달콤한 간식" },
  { word: "초콜릿", initial: "ㅊㅋㄹ", hint: "카카오로 만든 달콤한 간식" },
  { word: "사탕", initial: "ㅅㅌ", hint: "입에 넣고 녹여 먹는 달콤한 간식" },
  { word: "과자", initial: "ㄱㅈ", hint: "바삭바삭한 간식" },
  { word: "식빵", initial: "ㅅㅃ", hint: "네모나고 하얀 빵" },
  { word: "우유", initial: "ㅇㅇ", hint: "젖소에서 짜낸 하얀 마실 거리" },
  { word: "주스", initial: "ㅈㅅ", hint: "과일을 짜서 만든 마실 거리" },
  { word: "커피", initial: "ㅋㅍ", hint: "원두를 볶아 내린 쓴 마실 거리" },
  { word: "생수", initial: "ㅅㅅ", hint: "페트병에 담긴 맑은 물" },
  { word: "태양", initial: "ㅌㅇ", hint: "낮에 하늘에 떠 있는 둥글고 밝은 것" },
  { word: "보름달", initial: "ㅂㄹㄷ", hint: "밤하늘에 둥글게 뜬 달" },
  { word: "별빛", initial: "ㅂㅂ", hint: "밤하늘에 반짝이는 빛" },
  { word: "구름", initial: "ㄱㄹ", hint: "하늘에 떠 있는 하얀 솜 같은 것" },
  { word: "소나기", initial: "ㅅㄴㄱ", hint: "갑자기 세차게 내리는 비" },
  { word: "함박눈", initial: "ㅎㅂㄴ", hint: "굵고 탐스럽게 내리는 눈" },
  { word: "바람", initial: "ㅂㄹ", hint: "공기가 움직이는 것" },
  { word: "무지개", initial: "ㅁㅈㄱ", hint: "비 온 뒤 하늘에 생기는 일곱 빛깔" },
  { word: "등산", initial: "ㄷㅅ", hint: "산에 오르는 일" },
  { word: "강물", initial: "ㄱㅁ", hint: "바다로 흘러가는 큰 물줄기" },
  { word: "나무", initial: "ㄴㅁ", hint: "숲에 있는 키가 큰 식물" },
  { word: "해바라기", initial: "ㅎㅂㄹㄱ", hint: "해를 향해 피는 노란 꽃" },
  { word: "잡초", initial: "ㅈㅊ", hint: "가꾸지 않아도 저절로 자라는 풀" },
  { word: "벚꽃", initial: "ㅂㄲ", hint: "봄에 피는 연분홍색 꽃" },
  { word: "여름", initial: "ㅇㄹ", hint: "덥고 땀이 나는 계절" },
  { word: "가을", initial: "ㄱㅇ", hint: "단풍이 들고 선선한 계절" },
  { word: "겨울", initial: "ㄱㅇ", hint: "춥고 눈이 내리는 계절" },
  { word: "병원", initial: "ㅂㅇ", hint: "아플 때 치료를 받으러 가는 곳" },
  { word: "약국", initial: "ㅇㄱ", hint: "약을 짓거나 사는 곳" },
  { word: "경찰서", initial: "ㄱㅊㅅ", hint: "도둑을 잡고 치안을 유지하는 곳" },
  { word: "소방서", initial: "ㅅㅂㅅ", hint: "불을 끄고 구조 활동을 하는 곳" },
  { word: "우체국", initial: "ㅇㅊㄱ", hint: "편지나 소포를 보내는 곳" },
  { word: "은행", initial: "ㅇㅎ", hint: "돈을 맡기거나 빌리는 곳" },
  { word: "도서관", initial: "ㄷㅅㄱ", hint: "책을 빌려 읽는 곳" },
  { word: "영화관", initial: "ㅇㅎㄱ", hint: "큰 화면으로 영화를 보는 곳" },
  { word: "미술관", initial: "ㅁㅅㄱ", hint: "그림이나 조각을 전시하는 곳" },
  { word: "박물관", initial: "ㅂㅁㄱ", hint: "역사적인 유물을 전시하는 곳" },
];

function InitialQuizGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [currentWord, setCurrentWord] = useState(INITIAL_WORDS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);

  const initRound = () => {
    const wordObj = INITIAL_WORDS[Math.floor(Math.random() * INITIAL_WORDS.length)];
    setCurrentWord(wordObj);
    
    const optionCount = Math.min(4 + Math.floor((level - 1) / 5) * 2, 12);
    const wrongOptionsCount = optionCount - 1;
    
    const wrongOptions = INITIAL_WORDS.filter(w => w.word !== wordObj.word).sort(() => Math.random() - 0.5).slice(0, wrongOptionsCount).map(w => w.word);
    setOptions([wordObj.word, ...wrongOptions].sort(() => Math.random() - 0.5));
    setTimeLeft(Math.max(5, 15 - Math.floor(level / 5)));
  };

  const initLevel = (lvl: number) => {
    setIsLevelClear(false);
    setLevelScore(0);
    setRound(1);
    initRound();
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    if (isLevelClear || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLevelClear, isGameOver, round, level]);

  const handleChoice = (choice: string) => {
    if (isLevelClear || isGameOver) return;
    
    if (choice === currentWord.word) {
      if (round >= 3) {
        const earned = level * 20;
        setLevelScore(earned);
        setScore(prev => prev + earned);
        setIsLevelClear(true);
        if (level === 50) setIsGameOver(true);
      } else {
        setRound(r => r + 1);
        initRound();
      }
    } else {
      setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 sm:mb-4 overflow-hidden">
        <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(timeLeft / Math.max(5, 15 - Math.floor(level / 5))) * 100}%` }} />
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:w-1/2">
          <div className="text-center mb-8 landscape:mb-0 w-full">
            <div className="text-5xl landscape:text-4xl font-black text-slate-800 mb-2 tracking-widest">{currentWord.initial}</div>
            <div className="text-lg landscape:text-base text-slate-500 font-medium bg-slate-100 py-2 px-4 rounded-full inline-block">힌트: {currentWord.hint}</div>
            <p className="text-slate-400 mt-4 font-bold landscape:hidden">{round} / 3 문제</p>
          </div>
        </div>

        <div className="w-full landscape:w-1/2 flex items-center justify-center">
          <div className={clsx("grid gap-2 w-full max-w-sm", options.length >= 8 ? "grid-cols-3" : "grid-cols-2")}>
            {options.map(opt => (
              <button key={opt} onClick={() => handleChoice(opt)} className={clsx("bg-white rounded-2xl shadow-sm border-2 border-slate-100 font-bold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:scale-95 transition-all", options.length >= 8 ? "py-2 text-lg landscape:text-base" : "py-4 landscape:py-2 text-2xl landscape:text-xl")}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- 10. Flanker Task Game (방해꾼 화살표) ---
function FlankerTaskGame({ onFinish, initialLevel, onSaveLevel }: { onFinish: (score: number) => void, initialLevel: number, onSaveLevel: (level: number) => void }) {
  const [level, setLevel] = useState(initialLevel);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [isLevelClear, setIsLevelClear] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [arrows, setArrows] = useState<string[]>([]);
  const [centerDirection, setCenterDirection] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);

  const initRound = () => {
    const isCenterLeft = Math.random() > 0.5;
    setCenterDirection(isCenterLeft ? 'LEFT' : 'RIGHT');
    
    // Congruent (all same) or Incongruent (center different)
    const isIncongruent = Math.random() > 0.3; // 70% chance of being tricky
    
    const centerArrow = isCenterLeft ? '◀' : '▶';
    const flankerArrow = isIncongruent ? (isCenterLeft ? '▶' : '◀') : centerArrow;
    
    setArrows([flankerArrow, flankerArrow, centerArrow, flankerArrow, flankerArrow]);
    setTimeLeft(Math.max(2, 5 - Math.floor(level / 10)));
  };

  const initLevel = (lvl: number) => {
    setIsLevelClear(false);
    setLevelScore(0);
    setRound(1);
    initRound();
  };

  useEffect(() => { initLevel(initialLevel); }, [initialLevel]);

  useEffect(() => {
    if (isLevelClear || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLevelClear, isGameOver, round, level]);

  const handleChoice = (dir: 'LEFT' | 'RIGHT') => {
    if (isLevelClear || isGameOver) return;
    
    if (dir === centerDirection) {
      if (round >= 5) {
        const earned = level * 15;
        setLevelScore(earned);
        setScore(prev => prev + earned);
        setIsLevelClear(true);
        if (level === 50) setIsGameOver(true);
      } else {
        setRound(r => r + 1);
        initRound();
      }
    } else {
      setIsGameOver(true);
    }
  };

  const nextLevel = () => {
    const next = level + 1;
    setLevel(next);
    onSaveLevel(next);
    initLevel(next);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md landscape:max-w-3xl flex flex-col items-center relative min-h-[400px] landscape:min-h-0 landscape:h-full landscape:justify-center">
      <div className="flex justify-between items-center w-full mb-2 sm:mb-4 px-4 landscape:mb-2">
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-emerald-600">{level}단계 / 50단계</div>
        {score > 0 && (
          <button onClick={() => onFinish(score)} className="px-2 py-1 sm:px-3 sm:py-1.5 landscape:px-2 landscape:py-1 bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm landscape:text-xs font-bold hover:bg-slate-300 transition-colors shadow-sm">
            저장하고 끝내기
          </button>
        )}
        <div className="text-base sm:text-lg landscape:text-sm font-bold text-slate-600">점수: {score}</div>
      </div>
      
      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 sm:mb-4 overflow-hidden">
        <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(timeLeft / Math.max(2, 5 - Math.floor(level / 10))) * 100}%` }} />
      </div>

      {(isLevelClear || isGameOver) && (
        <LevelComplete level={level} score={levelScore} onNext={nextLevel} isGameOver={isGameOver} isLevelClear={isLevelClear} totalScore={score} onFinish={() => onFinish(score)} />
      )}

      <div className="w-full flex flex-col landscape:flex-row items-center justify-center gap-4 landscape:gap-8 flex-1">
        <div className="flex flex-col items-center justify-center landscape:w-1/2">
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-slate-800 text-center landscape:hidden">가운데 화살표 방향을 누르세요!</h2>
          <p className="text-slate-500 mb-4 landscape:mb-8 font-bold text-center landscape:hidden">{round} / 5 라운드</p>

          <div className="flex justify-center items-center gap-2 mb-8 landscape:mb-0 bg-white py-6 px-8 landscape:py-4 landscape:px-6 rounded-3xl shadow-sm border border-slate-100">
            {arrows.map((arr, i) => (
              <span key={i} className={clsx("text-4xl sm:text-5xl landscape:text-3xl font-black", i === 2 ? "text-rose-500 scale-125" : "text-slate-300")}>
                {arr}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full landscape:w-1/2 flex items-center justify-center">
          <div className="flex gap-4 justify-center w-full max-w-sm">
            <button onClick={() => handleChoice('LEFT')} className="flex-1 py-6 landscape:py-3 bg-white rounded-2xl shadow-md border-2 border-slate-100 text-4xl landscape:text-3xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all">
              ◀
            </button>
            <button onClick={() => handleChoice('RIGHT')} className="flex-1 py-6 landscape:py-3 bg-white rounded-2xl shadow-md border-2 border-slate-100 text-4xl landscape:text-3xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all">
              ▶
            </button>
          </div>
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
