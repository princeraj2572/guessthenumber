import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, Target, TrendingUp, TrendingDown, Trophy, Zap, Award, Clock,
  Volume2, VolumeX, Share2, Download, Settings, Users, Brain, Flame,
  Star, Medal, Crown, Sparkles, ChevronRight, Info, X, Check, AlertCircle
} from 'lucide-react';

export default function UltimateNumberGame() {
  // Core game state
  const [difficulty, setDifficulty] = useState('medium');
  const [secretNumber, setSecretNumber] = useState(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(100);
  const [maxTries, setMaxTries] = useState(7);
  const [timeStarted, setTimeStarted] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showHint, setShowHint] = useState(false);
  
  // Game modes
  const [gameMode, setGameMode] = useState('classic'); // classic, timeAttack, survival, daily
  const [survivalLives, setSurvivalLives] = useState(3);
  const [timeAttackScore, setTimeAttackScore] = useState(0);
  const [timeAttackRemaining, setTimeAttackRemaining] = useState(120);
  
  // UI state
  const [theme, setTheme] = useState('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [animateWin, setAnimateWin] = useState(false);
  
  // Multiplayer
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(null);
  const [player2Score, setPlayer2Score] = useState(null);
  
  // Custom range
  const [customMode, setCustomMode] = useState(false);
  const [customMin, setCustomMin] = useState(0);
  const [customMax, setCustomMax] = useState(100);
  const [customTries, setCustomTries] = useState(7);
  
  // Statistics with more tracking
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('ultimateGameStats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: null,
      fastestWin: null,
      totalGuesses: 0,
      currentStreak: 0,
      bestStreak: 0,
      byDifficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
      timeOfDayWins: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      totalPlayTime: 0
    };
  });
  
  // Achievements
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem('gameAchievements');
    return saved ? JSON.parse(saved) : {
      speedDemon: false,      // Win in under 30 seconds
      sharpshooter: false,    // Win in 3 guesses or fewer
      persistent: false,      // Play 50 games
      perfectStreak: false,   // Win 5 games in a row
      allDifficulties: false, // Win on all difficulties
      noHints: false,         // Win without using hints
      survivor: false,        // Win survival mode
      timeAttacker: false,    // Score 10+ in time attack
      speedster: false,       // Win in under 15 seconds
      master: false           // Win 100 games
    };
  });
  
  // Daily challenge
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyNumber, setDailyNumber] = useState(null);
  const [dailyCompleted, setDailyCompleted] = useState(false);

  // Difficulty configurations
  const difficulties = {
    easy: { max: 50, tries: 10, name: 'Easy', color: 'from-green-500 to-emerald-500' },
    medium: { max: 100, tries: 7, name: 'Medium', color: 'from-blue-500 to-cyan-500' },
    hard: { max: 200, tries: 5, name: 'Hard', color: 'from-orange-500 to-red-500' },
    expert: { max: 500, tries: 5, name: 'Expert', color: 'from-purple-500 to-pink-500' }
  };

  // Themes
  const themes = {
    default: {
      name: 'Cosmic',
      bg: 'from-indigo-900 via-purple-900 to-pink-900',
      accent: 'from-pink-500 to-purple-500'
    },
    ocean: {
      name: 'Ocean',
      bg: 'from-blue-900 via-cyan-900 to-teal-900',
      accent: 'from-cyan-400 to-blue-500'
    },
    forest: {
      name: 'Forest',
      bg: 'from-green-900 via-emerald-900 to-teal-900',
      accent: 'from-emerald-400 to-green-500'
    },
    sunset: {
      name: 'Sunset',
      bg: 'from-orange-900 via-red-900 to-pink-900',
      accent: 'from-orange-400 to-pink-500'
    },
    neon: {
      name: 'Neon',
      bg: 'from-black via-purple-950 to-black',
      accent: 'from-fuchsia-500 to-cyan-500'
    },
    dark: {
      name: 'Dark',
      bg: 'from-gray-900 via-slate-900 to-zinc-900',
      accent: 'from-gray-400 to-slate-500'
    }
  };

  const currentTheme = themes[theme];

  // Audio context for sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const sounds = {
      higher: { freq: 400, duration: 0.1 },
      lower: { freq: 300, duration: 0.1 },
      correct: { freq: 800, duration: 0.3 },
      wrong: { freq: 200, duration: 0.2 },
      win: { freq: 1000, duration: 0.5 }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    oscillator.frequency.value = sound.freq;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
  };

  // Confetti effect
  const triggerConfetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
      }, i * 30);
    }
  };

  const createConfettiPiece = (color) => {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = color;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = 'all 3s ease-out';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.style.top = window.innerHeight + 'px';
      confetti.style.left = (parseInt(confetti.style.left) + (Math.random() - 0.5) * 200) + 'px';
      confetti.style.opacity = '0';
      confetti.style.transform = `rotate(${Math.random() * 720}deg)`;
    }, 10);
    
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 3000);
  };

  // Daily challenge number generation
  const getDailyNumber = (max) => {
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % (max + 1);
  };

  // Initialize game
  useEffect(() => {
    if (isDailyChallenge) {
      const config = difficulties[difficulty];
      const daily = getDailyNumber(config.max);
      setDailyNumber(daily);
      setSecretNumber(daily);
      
      const completedToday = localStorage.getItem('dailyCompleted');
      const today = new Date().toDateString();
      setDailyCompleted(completedToday === today);
    } else {
      startNewGame();
    }
  }, [difficulty, isDailyChallenge]);

  // Timer effects
  useEffect(() => {
    if (gameStatus === 'playing' && timeStarted) {
      const interval = setInterval(() => {
        setTimeTaken(Math.floor((Date.now() - timeStarted) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStatus, timeStarted]);

  // Time attack timer
  useEffect(() => {
    if (gameMode === 'timeAttack' && gameStatus === 'playing' && timeAttackRemaining > 0) {
      const interval = setInterval(() => {
        setTimeAttackRemaining(prev => {
          if (prev <= 1) {
            setGameStatus('lost');
            setFeedback(`Time's up! Final score: ${timeAttackScore}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameMode, gameStatus, timeAttackRemaining, timeAttackScore]);

  const startNewGame = () => {
    if (customMode) {
      const newSecret = Math.floor(Math.random() * (customMax - customMin + 1)) + customMin;
      setSecretNumber(newSecret);
      setMinRange(customMin);
      setMaxRange(customMax);
      setMaxTries(customTries);
    } else {
      const config = difficulties[difficulty];
      const newSecret = Math.floor(Math.random() * (config.max + 1));
      setSecretNumber(newSecret);
      setMinRange(0);
      setMaxRange(config.max);
      setMaxTries(config.tries);
    }
    
    setCurrentGuess('');
    setGuessHistory([]);
    setFeedback('');
    setGameStatus('playing');
    setTimeStarted(Date.now());
    setTimeTaken(0);
    setShowHint(false);
    setAnimateWin(false);
    
    if (gameMode === 'survival') {
      setSurvivalLives(3);
    } else if (gameMode === 'timeAttack') {
      setTimeAttackRemaining(120);
    }
    
    if (isMultiplayer) {
      setCurrentPlayer(1);
      setPlayer1Score(null);
      setPlayer2Score(null);
    }
  };

  const handleGuess = () => {
    if (gameStatus !== 'playing') return;
    
    const guess = parseInt(currentGuess);
    const effectiveMax = customMode ? customMax : maxRange;
    const effectiveMin = customMode ? customMin : minRange;
    
    if (isNaN(guess) || guess < effectiveMin || guess > effectiveMax) {
      setFeedback(`Please enter a number between ${effectiveMin} and ${effectiveMax}`);
      playSound('wrong');
      return;
    }

    // Check for duplicate guess
    if (guessHistory.includes(guess)) {
      setFeedback('You already guessed that number!');
      playSound('wrong');
      return;
    }

    const newHistory = [...guessHistory, guess];
    setGuessHistory(newHistory);

    if (guess === secretNumber) {
      // WIN!
      setGameStatus('won');
      setFeedback('🎉 Correct!');
      setAnimateWin(true);
      playSound('win');
      triggerConfetti();
      
      if (isMultiplayer) {
        if (currentPlayer === 1) {
          setPlayer1Score(newHistory.length);
          setCurrentPlayer(2);
          setTimeout(() => {
            startNewGame();
          }, 2000);
        } else {
          setPlayer2Score(newHistory.length);
          // Determine winner
          if (player1Score < newHistory.length) {
            setFeedback(`🏆 Player 1 wins! (${player1Score} vs ${newHistory.length} guesses)`);
          } else if (player1Score > newHistory.length) {
            setFeedback(`🏆 Player 2 wins! (${newHistory.length} vs ${player1Score} guesses)`);
          } else {
            setFeedback(`🤝 It's a tie! (Both ${player1Score} guesses)`);
          }
        }
      } else {
        updateStats(true, newHistory.length, timeTaken);
        checkAchievements(newHistory.length, timeTaken);
        
        if (gameMode === 'timeAttack') {
          setTimeAttackScore(prev => prev + 1);
          setTimeout(() => startNewGame(), 1500);
        }
      }
      
      if (isDailyChallenge) {
        const today = new Date().toDateString();
        localStorage.setItem('dailyCompleted', today);
        setDailyCompleted(true);
      }
    } else {
      // Wrong guess
      if (gameMode === 'survival') {
        setSurvivalLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameStatus('lost');
            setFeedback(`Game Over! The number was ${secretNumber}`);
            playSound('wrong');
            updateStats(false, newHistory.length, timeTaken);
          }
          return newLives;
        });
      }
      
      if (newHistory.length >= maxTries && gameMode !== 'survival') {
        setGameStatus('lost');
        setFeedback(`Game Over! The number was ${secretNumber}`);
        playSound('wrong');
        updateStats(false, newHistory.length, timeTaken);
      } else {
        if (guess < secretNumber) {
          setFeedback('Higher');
          setMinRange(Math.max(minRange, guess + 1));
          playSound('higher');
        } else {
          setFeedback('Lower');
          setMaxRange(Math.min(maxRange, guess - 1));
          playSound('lower');
        }
      }
    }
    
    setCurrentGuess('');
  };

  const updateStats = (won, guesses, time) => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
      bestScore: won && (stats.bestScore === null || guesses < stats.bestScore) ? guesses : stats.bestScore,
      fastestWin: won && (stats.fastestWin === null || time < stats.fastestWin) ? time : stats.fastestWin,
      totalGuesses: stats.totalGuesses + guesses,
      currentStreak: won ? stats.currentStreak + 1 : 0,
      bestStreak: won && stats.currentStreak + 1 > stats.bestStreak ? stats.currentStreak + 1 : stats.bestStreak,
      byDifficulty: {
        ...stats.byDifficulty,
        [difficulty]: stats.byDifficulty[difficulty] + (won ? 1 : 0)
      },
      timeOfDayWins: {
        ...stats.timeOfDayWins,
        [timeOfDay]: stats.timeOfDayWins[timeOfDay] + (won ? 1 : 0)
      },
      totalPlayTime: stats.totalPlayTime + time
    };
    
    setStats(newStats);
    localStorage.setItem('ultimateGameStats', JSON.stringify(newStats));
  };

  const checkAchievements = (guesses, time) => {
    const newAchievements = { ...achievements };
    
    if (time < 30 && !achievements.speedDemon) {
      newAchievements.speedDemon = true;
      showAchievementNotification('Speed Demon', 'Won in under 30 seconds!');
    }
    
    if (guesses <= 3 && !achievements.sharpshooter) {
      newAchievements.sharpshooter = true;
      showAchievementNotification('Sharpshooter', 'Won in 3 guesses or fewer!');
    }
    
    if (stats.gamesPlayed + 1 >= 50 && !achievements.persistent) {
      newAchievements.persistent = true;
      showAchievementNotification('Persistent', 'Played 50 games!');
    }
    
    if (stats.currentStreak + 1 >= 5 && !achievements.perfectStreak) {
      newAchievements.perfectStreak = true;
      showAchievementNotification('Perfect Streak', 'Won 5 games in a row!');
    }
    
    if (!showHint && !achievements.noHints) {
      newAchievements.noHints = true;
      showAchievementNotification('No Hints', 'Won without using hints!');
    }
    
    if (time < 15 && !achievements.speedster) {
      newAchievements.speedster = true;
      showAchievementNotification('Speedster', 'Won in under 15 seconds!');
    }
    
    if (stats.gamesWon + 1 >= 100 && !achievements.master) {
      newAchievements.master = true;
      showAchievementNotification('Master', 'Won 100 games!');
    }
    
    const allDifficultiesWon = Object.values(stats.byDifficulty).every(count => count > 0);
    if (allDifficultiesWon && !achievements.allDifficulties) {
      newAchievements.allDifficulties = true;
      showAchievementNotification('All Difficulties', 'Won on all difficulty levels!');
    }
    
    setAchievements(newAchievements);
    localStorage.setItem('gameAchievements', JSON.stringify(newAchievements));
  };

  const showAchievementNotification = (title, description) => {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 10000; animation: slideIn 0.5s ease-out;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">🏆</div>
          <div>
            <div style="font-weight: bold; font-size: 16px;">${title}</div>
            <div style="font-size: 14px; opacity: 0.9;">${description}</div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.5s ease-out';
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
  };

  const getOptimalGuess = () => {
    return Math.floor((minRange + maxRange) / 2);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareResult = () => {
    const text = `🎯 Number Guessing Game
Difficulty: ${difficulties[difficulty].name}
Guesses: ${guessHistory.length}/${maxTries}
Time: ${formatTime(timeTaken)}
${gameStatus === 'won' ? '✅ Won!' : '❌ Lost'}

Can you beat my score?`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  const exportStats = () => {
    const csv = `Stat,Value
Games Played,${stats.gamesPlayed}
Games Won,${stats.gamesWon}
Win Rate,${stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) : 0}%
Best Score,${stats.bestScore || 'N/A'}
Fastest Win,${stats.fastestWin ? formatTime(stats.fastestWin) : 'N/A'}
Current Streak,${stats.currentStreak}
Best Streak,${stats.bestStreak}
Total Play Time,${formatTime(stats.totalPlayTime)}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-stats.csv';
    a.click();
  };

  const achievementsList = [
    { id: 'speedDemon', icon: '⚡', title: 'Speed Demon', desc: 'Win in under 30 seconds' },
    { id: 'sharpshooter', icon: '🎯', title: 'Sharpshooter', desc: 'Win in 3 guesses or fewer' },
    { id: 'persistent', icon: '🔥', title: 'Persistent', desc: 'Play 50 games' },
    { id: 'perfectStreak', icon: '💫', title: 'Perfect Streak', desc: 'Win 5 games in a row' },
    { id: 'allDifficulties', icon: '🌟', title: 'All Difficulties', desc: 'Win on all difficulty levels' },
    { id: 'noHints', icon: '🧠', title: 'No Hints', desc: 'Win without using hints' },
    { id: 'survivor', icon: '❤️', title: 'Survivor', desc: 'Win survival mode' },
    { id: 'timeAttacker', icon: '⏱️', title: 'Time Attacker', desc: 'Score 10+ in time attack' },
    { id: 'speedster', icon: '🚀', title: 'Speedster', desc: 'Win in under 15 seconds' },
    { id: 'master', icon: '👑', title: 'Master', desc: 'Win 100 games' }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && currentGuess) {
        handleGuess();
      } else if (e.key === 'r' && gameStatus !== 'playing') {
        startNewGame();
      } else if (e.key === 'h') {
        setShowHint(!showHint);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGuess, gameStatus, showHint]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="max-w-7xl w-full relative z-10">
        {/* Header with controls */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all"
            >
              <Settings className="w-6 h-6 text-white" />
            </button>
            
            <h1 className={`text-5xl font-bold text-white flex items-center gap-3 ${animateWin ? 'animate-pulse-slow' : ''}`}>
              <Target className="w-12 h-12" />
              Ultimate Number Game
            </h1>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-white/10 backdrop-blur-lg rounded-xl hover:bg-white/20 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
            </button>
          </div>
          
          <p className="text-purple-200">The most advanced number guessing experience!</p>
          
          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setShowTutorial(true)}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Tutorial
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Achievements ({Object.values(achievements).filter(Boolean).length}/10)
            </button>
            <button
              onClick={shareResult}
              disabled={guessHistory.length === 0}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white text-sm hover:bg-white/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={exportStats}
              className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg text-white text-sm hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Stats
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Game modes and settings */}
          <div className="lg:col-span-1 space-y-4">
            {/* Game Mode Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Game Mode
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'classic', icon: '🎯', name: 'Classic' },
                  { id: 'timeAttack', icon: '⏱️', name: 'Time Attack' },
                  { id: 'survival', icon: '❤️', name: 'Survival' },
                  { id: 'daily', icon: '📅', name: 'Daily Challenge' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setGameMode(mode.id);
                      setIsDailyChallenge(mode.id === 'daily');
                      startNewGame();
                    }}
                    className={`w-full py-2 px-3 rounded-lg font-semibold transition-all text-left flex items-center gap-2 ${
                      gameMode === mode.id || (isDailyChallenge && mode.id === 'daily')
                        ? 'bg-white text-purple-900 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
              <h3 className="text-white font-bold mb-3">🎨 Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`py-2 px-2 rounded-lg text-sm font-semibold transition-all ${
                      theme === key
                        ? 'bg-white text-purple-900 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplayer Toggle */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
              <button
                onClick={() => {
                  setIsMultiplayer(!isMultiplayer);
                  startNewGame();
                }}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  isMultiplayer
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Users className="w-5 h-5" />
                {isMultiplayer ? 'Multiplayer ON' : 'Single Player'}
              </button>
            </div>

            {/* Streak Display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between text-white">
                <div>
                  <div className="text-sm text-purple-200">Current Streak</div>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                    {stats.currentStreak}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-purple-200">Best Streak</div>
                  <div className="text-2xl font-bold">{stats.bestStreak}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Game Panel */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {/* Multiplayer indicator */}
            {isMultiplayer && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg border-2 border-white/30">
                <div className="text-white font-bold text-center text-lg">
                  {gameStatus === 'playing' ? (
                    <>Player {currentPlayer}'s Turn</>
                  ) : player1Score !== null && player2Score !== null ? (
                    <>Game Complete!</>
                  ) : (
                    <>Waiting for Player 2...</>
                  )}
                </div>
                {player1Score !== null && (
                  <div className="mt-2 text-center text-white">
                    Player 1: {player1Score} guesses
                    {player2Score !== null && ` | Player 2: ${player2Score} guesses`}
                  </div>
                )}
              </div>
            )}

            {/* Daily Challenge Banner */}
            {isDailyChallenge && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-lg border-2 border-yellow-400">
                <div className="text-white font-bold text-center flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Daily Challenge - {new Date().toLocaleDateString()}
                  {dailyCompleted && <Check className="w-5 h-5 text-green-400" />}
                </div>
              </div>
            )}

            {/* Difficulty Selector */}
            {!customMode && (
              <div className="mb-6">
                <label className="text-white font-semibold mb-2 block">Difficulty</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(difficulties).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setDifficulty(key);
                      }}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                        difficulty === key
                          ? 'bg-white text-purple-900 shadow-lg scale-105'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {config.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCustomMode(true)}
                  className="mt-2 w-full py-2 px-3 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
                >
                  Custom Range
                </button>
              </div>
            )}

            {/* Custom Range Settings */}
            {customMode && (
              <div className="mb-6 p-4 bg-white/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">Custom Settings</h3>
                  <button
                    onClick={() => setCustomMode(false)}
                    className="text-white hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-white text-sm">Min</label>
                    <input
                      type="number"
                      value={customMin}
                      onChange={(e) => setCustomMin(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded bg-white/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Max</label>
                    <input
                      type="number"
                      value={customMax}
                      onChange={(e) => setCustomMax(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 rounded bg-white/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm">Tries</label>
                    <input
                      type="number"
                      value={customTries}
                      onChange={(e) => setCustomTries(parseInt(e.target.value) || 7)}
                      className="w-full px-3 py-2 rounded bg-white/30 text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={startNewGame}
                  className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Apply & Start
                </button>
              </div>
            )}

            {/* Game Info Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-purple-200 text-xs">
                  {gameMode === 'survival' ? 'Lives' : gameMode === 'timeAttack' ? 'Score' : 'Tries Left'}
                </div>
                <div className="text-2xl font-bold text-white">
                  {gameMode === 'survival' ? `${survivalLives}❤️` : 
                   gameMode === 'timeAttack' ? timeAttackScore :
                   maxTries - guessHistory.length}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-purple-200 text-xs">Range</div>
                <div className="text-xl font-bold text-white">
                  {minRange}-{maxRange}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-purple-200 text-xs flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {gameMode === 'timeAttack' ? 'Remaining' : 'Time'}
                </div>
                <div className="text-xl font-bold text-white">
                  {gameMode === 'timeAttack' ? formatTime(timeAttackRemaining) : formatTime(timeTaken)}
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="text-purple-200 text-xs">Guesses</div>
                <div className="text-2xl font-bold text-white">
                  {guessHistory.length}
                </div>
              </div>
            </div>

            {/* Range Visualizer */}
            <div className="mb-6">
              <div className="relative h-12 bg-white/20 rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500/50 to-blue-500/50"
                  style={{
                    left: `${(minRange / (customMode ? customMax : difficulties[difficulty].max)) * 100}%`,
                    width: `${((maxRange - minRange) / (customMode ? customMax : difficulties[difficulty].max)) * 100}%`
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  Possible Range: {minRange} - {maxRange}
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-6 p-4 rounded-lg text-center font-bold text-lg ${
                gameStatus === 'won' 
                  ? 'bg-green-500/30 text-green-100 border-2 border-green-400' 
                  : gameStatus === 'lost'
                  ? 'bg-red-500/30 text-red-100 border-2 border-red-400'
                  : 'bg-blue-500/30 text-blue-100 border-2 border-blue-400'
              } flex items-center justify-center gap-2`}>
                {feedback === 'Higher' && <TrendingUp className="w-6 h-6" />}
                {feedback === 'Lower' && <TrendingDown className="w-6 h-6" />}
                {gameStatus === 'won' && <Trophy className="w-6 h-6" />}
                {feedback}
              </div>
            )}

            {/* Input */}
            {gameStatus === 'playing' && (
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                    placeholder={`Enter ${minRange}-${maxRange}`}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border-2 border-white/30 focus:border-white focus:outline-none text-lg"
                    min={minRange}
                    max={maxRange}
                    autoFocus
                  />
                  <button
                    onClick={handleGuess}
                    className={`px-6 py-3 bg-gradient-to-r ${currentTheme.accent} text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105`}
                  >
                    Guess
                  </button>
                </div>
                
                {/* Hint */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-purple-200 hover:text-white text-sm underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <Brain className="w-4 h-4" />
                    {showHint ? 'Hide' : 'Show'} Optimal Guess (H key)
                  </button>
                  {showHint && (
                    <div className="mt-2 text-yellow-300 font-semibold flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      Binary Search: Try {getOptimalGuess()}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center text-purple-200 text-xs">
                  Press Enter to guess • R to restart • H for hint
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {gameStatus !== 'playing' && !isMultiplayer && (
              <button
                onClick={startNewGame}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 mb-4"
              >
                <RefreshCw className="w-5 h-5" />
                Play Again (R key)
              </button>
            )}

            {/* Guess History */}
            {guessHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  Your Guesses:
                  <span className="text-sm text-purple-200">
                    ({guessHistory.length} {guessHistory.length === 1 ? 'try' : 'tries'})
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guessHistory.map((guess, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                        guess === secretNumber
                          ? 'bg-green-500 text-white shadow-lg scale-110'
                          : guess < secretNumber
                          ? 'bg-red-400/60 text-white'
                          : 'bg-blue-400/60 text-white'
                      }`}
                      style={{
                        animation: idx === guessHistory.length - 1 ? 'pulse 0.5s' : 'none'
                      }}
                    >
                      {guess}
                      {guess !== secretNumber && (
                        <span className="ml-1 text-xs">
                          {guess < secretNumber ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statistics Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Stats
              </h2>
              
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Games Played</div>
                  <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.gamesPlayed > 0 
                      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
                      : 0}%
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Best Score</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {stats.bestScore !== null ? (
                      <>
                        <Medal className="w-5 h-5 text-yellow-400" />
                        {stats.bestScore} tries
                      </>
                    ) : '-'}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Fastest Win</div>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    {stats.fastestWin !== null ? (
                      <>
                        <Zap className="w-5 h-5 text-yellow-400" />
                        {formatTime(stats.fastestWin)}
                      </>
                    ) : '-'}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Total Time Played</div>
                  <div className="text-xl font-bold text-white">
                    {formatTime(stats.totalPlayTime)}
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-200 text-sm mb-1">Wins by Difficulty</div>
                  <div className="space-y-1 mt-2">
                    {Object.entries(stats.byDifficulty).map(([diff, count]) => (
                      <div key={diff} className="flex justify-between text-white text-sm">
                        <span className="capitalize">{diff}:</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Reset all statistics?')) {
                      const resetStats = {
                        gamesPlayed: 0,
                        gamesWon: 0,
                        bestScore: null,
                        fastestWin: null,
                        totalGuesses: 0,
                        currentStreak: 0,
                        bestStreak: 0,
                        byDifficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
                        timeOfDayWins: { morning: 0, afternoon: 0, evening: 0, night: 0 },
                        totalPlayTime: 0
                      };
                      setStats(resetStats);
                      localStorage.setItem('ultimateGameStats', JSON.stringify(resetStats));
                    }
                  }}
                  className="w-full py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/50 transition-all text-sm"
                >
                  Reset Stats
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pro Tips
              </h3>
              <ul className="text-purple-200 text-xs space-y-1">
                <li>• Use binary search for optimal strategy</li>
                <li>• Try Daily Challenge for global competition</li>
                <li>• Unlock all 10 achievements</li>
                <li>• Race against friends in multiplayer</li>
                <li>• Export your stats to track progress</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Info className="w-8 h-8" />
                  How to Play
                </h2>
                <button onClick={() => setShowTutorial(false)} className="text-white hover:text-red-300">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="space-y-6 text-white">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">🎯 Classic Mode</h3>
                  <p className="text-purple-200">The computer picks a random number. You have limited tries to guess it. After each guess, you'll get "Higher" or "Lower" hints.</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">⏱️ Time Attack</h3>
                  <p className="text-purple-200">Guess as many numbers as possible in 2 minutes. Each correct guess starts a new round. How high can you score?</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">❤️ Survival</h3>
                  <p className="text-purple-200">You start with 3 lives. Each wrong guess costs a life. Can you survive?</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">📅 Daily Challenge</h3>
                  <p className="text-purple-200">Everyone gets the same number each day. Complete it to compare with others!</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">💡 Pro Strategy</h3>
                  <p className="text-purple-200">Use <strong>binary search</strong>: Always guess the middle number of the remaining range. This is the mathematically optimal strategy and guarantees finding any number in the fewest guesses!</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-300">⌨️ Keyboard Shortcuts</h3>
                  <ul className="text-purple-200 space-y-1">
                    <li>• <strong>Enter</strong> - Submit guess</li>
                    <li>• <strong>R</strong> - Restart game</li>
                    <li>• <strong>H</strong> - Toggle hint</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => setShowTutorial(false)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Achievements
                  <span className="text-xl text-purple-300">
                    ({Object.values(achievements).filter(Boolean).length}/10)
                  </span>
                </h2>
                <button onClick={() => setShowAchievements(false)} className="text-white hover:text-red-300">
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievementsList.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievements[ach.id]
                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400'
                        : 'bg-white/10 border-white/20 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{ach.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-white flex items-center gap-2">
                          {ach.title}
                          {achievements[ach.id] && <Check className="w-5 h-5 text-green-400" />}
                        </div>
                        <div className="text-sm text-purple-200">{ach.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <div className="text-white text-center">
                  <div className="text-sm text-purple-200 mb-1">Achievement Progress</div>
                  <div className="text-3xl font-bold">
                    {Object.values(achievements).filter(Boolean).length} / {achievementsList.length}
                  </div>
                  <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                      style={{ width: `${(Object.values(achievements).filter(Boolean).length / achievementsList.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Settings className="w-7 h-7" />
                  Settings
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-white hover:text-red-300">
                  <X className="w-7 h-7" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">Sound Effects</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-14 h-7 rounded-full transition-all ${
                      soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      soundEnabled ? 'translate-x-8' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="text-white font-semibold mb-3">Default Difficulty</div>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 rounded bg-white/20 text-white border-2 border-white/30"
                  >
                    {Object.entries(difficulties).map(([key, config]) => (
                      <option key={key} value={key} className="bg-purple-900">
                        {config.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="text-white font-semibold mb-3">App Version</div>
                  <div className="text-purple-200 text-sm">v2.0.0 - Ultimate Edition</div>
                  <div className="text-purple-300 text-xs mt-1">
                    With 30+ features including multiplayer, achievements, daily challenges, and more!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Footer */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Game Modes
              </h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>🎯 <strong>Classic</strong> - Traditional gameplay</li>
                <li>⏱️ <strong>Time Attack</strong> - Beat the clock</li>
                <li>❤️ <strong>Survival</strong> - Limited lives</li>
                <li>📅 <strong>Daily</strong> - Global challenge</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Features
              </h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>👥 Multiplayer racing</li>
                <li>🏆 10 achievements to unlock</li>
                <li>🎨 6 beautiful themes</li>
                <li>📊 Detailed statistics</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Pro Tips
              </h3>
              <ul className="text-purple-200 text-sm space-y-1">
                <li>💡 Use binary search strategy</li>
                <li>⚡ Speed runs for achievements</li>
                <li>🔥 Build win streaks</li>
                <li>📈 Export & track progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
