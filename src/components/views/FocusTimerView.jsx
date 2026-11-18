import React, { useState, useEffect } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { useTasks } from '../../context/TaskContext';
import { Play, Pause, RotateCcw, Sparkles, CheckCircle2, History } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FocusTimerView = () => {
  const { activeSwatch, settings, triggerToast } = useAppearance();
  const { recordFocusSession, focusStats } = useTasks();

  const [mode, setMode] = useState('focus'); // focus (25m), short (5m), long (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      handleSessionCompleted();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSessionCompleted = async () => {
    const duration = mode === 'focus' ? 25 : mode === 'short' ? 5 : 15;
    await recordFocusSession(duration, mode, 'Completed via Lumina Timer');
    setCompletedSessionsCount((prev) => prev + 1);
    triggerToast(`Focus session saved to MongoDB! (+${duration}m) 🌸`);

    if (!settings.reduceMotion) {
      confetti({ particleCount: 50, spread: 70 });
    }
  };

  const switchMode = (newMode, minutes) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  // Manual Complete Session for testing / fast completion
  const handleQuickComplete = async () => {
    setIsRunning(false);
    await handleSessionCompleted();
    resetTimer();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const todayMinutes = focusStats ? focusStats.todayMinutes : 0;
  const recentSessions = focusStats?.recentSessions || [];

  return (
    <div className="view-container focus-view">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Focus Timer</h1>
          <p className="view-subtitle">Enter a state of deep, undistracted flow (Saved to MongoDB)</p>
        </div>

        <div className="timer-header-stat">
          <Clock size={16} style={{ color: activeSwatch.primary }} />
          <span>Today's Total: <strong>{todayMinutes} mins</strong></span>
        </div>
      </div>

      <div className="glass-card timer-main-card">
        {/* Mode selector pills */}
        <div className="timer-mode-buttons">
          <button
            type="button"
            className={`timer-mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus', 25)}
          >
            Deep Focus (25m)
          </button>
          <button
            type="button"
            className={`timer-mode-btn ${mode === 'short' ? 'active' : ''}`}
            onClick={() => switchMode('short', 5)}
          >
            Short Break (5m)
          </button>
          <button
            type="button"
            className={`timer-mode-btn ${mode === 'long' ? 'active' : ''}`}
            onClick={() => switchMode('long', 15)}
          >
            Long Rest (15m)
          </button>
        </div>

        {/* Big circular display */}
        <div className="timer-visual-display">
          <div
            className="timer-circular-meter"
            style={{
              borderColor: activeSwatch.primary,
              boxShadow: `0 0 35px ${activeSwatch.glow}, inset 0 0 25px ${activeSwatch.glow}`
            }}
          >
            <div className="timer-numbers-block">
              <span className="big-time-string">{formattedTime}</span>
              <span className="timer-status-hint">
                {isRunning ? 'Flow state active' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="timer-control-row">
          <button
            type="button"
            className="timer-primary-toggle-btn"
            onClick={toggleTimer}
            style={{
              backgroundColor: activeSwatch.primary,
              boxShadow: `0 6px 20px ${activeSwatch.glow}`
            }}
          >
            {isRunning ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            type="button"
            className="timer-reset-icon-btn"
            onClick={resetTimer}
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>

          <button
            type="button"
            className="secondary-glass-btn"
            onClick={handleQuickComplete}
            title="Mark session as completed and save to MongoDB"
          >
            <CheckCircle2 size={16} />
            <span>Complete Session</span>
          </button>
        </div>

        {/* MongoDB Session History */}
        {recentSessions.length > 0 && (
          <div className="timer-history-block">
            <div className="history-header">
              <History size={15} />
              <h4>Recent Focus Sessions (MongoDB)</h4>
            </div>
            <div className="history-chips-row">
              {recentSessions.slice(0, 6).map((s) => (
                <div key={s._id} className="history-chip">
                  <span className="chip-time">{s.durationMinutes}m {s.mode}</span>
                  <span className="chip-date">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
