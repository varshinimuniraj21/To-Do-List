import React, { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { Flame, Plus, Check, Sparkles, Award } from 'lucide-react';

export const HabitTrackerView = () => {
  const { activeSwatch, triggerToast } = useAppearance();

  const [habits, setHabits] = useState([
    { id: 1, name: 'Drink 2.5L Water', emoji: '💧', streak: 21, days: [true, true, true, true, true, true, false] },
    { id: 2, name: 'Morning Meditation (10m)', emoji: '🧘', streak: 14, days: [true, true, true, true, false, true, true] },
    { id: 3, name: 'Deep Work 2 Hours', emoji: '⚡', streak: 8, days: [true, true, true, true, true, false, true] },
    { id: 4, name: 'Evening Walk or Workout', emoji: '🌿', streak: 12, days: [true, false, true, true, true, true, true] },
    { id: 5, name: 'Read Book 20 mins', emoji: '📖', streak: 9, days: [false, true, true, true, true, true, true] }
  ]);

  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (habitId, dayIndex) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextDays = [...h.days];
          nextDays[dayIndex] = !nextDays[dayIndex];
          const newStreak = nextDays[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1);
          return { ...h, days: nextDays, streak: newStreak };
        }
        return h;
      })
    );
    triggerToast('Habit progress updated');
  };

  return (
    <div className="view-container">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Habit Tracker</h1>
          <p className="view-subtitle">Cultivate mindful routines and build lasting streaks</p>
        </div>

        <div className="habit-header-badge">
          <Award size={16} style={{ color: activeSwatch.primary }} />
          <span>Active Streak: 21 Days</span>
        </div>
      </div>

      <div className="glass-card habits-card">
        <div className="habits-table-header">
          <span className="col-habit-name">Habit</span>
          <div className="col-days-row">
            {weekLabels.map((w, idx) => (
              <span key={idx} className="day-name-cell">{w}</span>
            ))}
          </div>
          <span className="col-streak-badge">Streak</span>
        </div>

        <div className="habits-list-body">
          {habits.map((habit) => (
            <div key={habit.id} className="habit-row-item">
              <div className="habit-identity">
                <span className="habit-emoji-badge">{habit.emoji}</span>
                <span className="habit-name-text">{habit.name}</span>
              </div>

              <div className="habit-checkboxes-week">
                {habit.days.map((isDone, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`habit-check-bubble ${isDone ? 'checked' : ''}`}
                    onClick={() => toggleDay(habit.id, idx)}
                    style={
                      isDone
                        ? {
                            backgroundColor: activeSwatch.primary,
                            borderColor: activeSwatch.primary,
                            boxShadow: `0 2px 8px ${activeSwatch.glow}`
                          }
                        : {}
                    }
                  >
                    {isDone && <Check size={12} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>

              <div className="habit-streak-display">
                <Flame size={14} className="streak-flame" />
                <span>{habit.streak} d</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
