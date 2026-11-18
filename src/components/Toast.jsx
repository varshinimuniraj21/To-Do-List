import React from 'react';
import { useAppearance } from '../context/AppearanceContext';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const Toast = () => {
  const { toastMessage, activeSwatch } = useAppearance();

  if (!toastMessage) return null;

  return (
    <div className="global-toast-container">
      <div
        className="global-toast-pill"
        style={{
          boxShadow: `0 8px 30px rgba(180, 150, 220, 0.35), 0 0 20px ${activeSwatch.glow}`
        }}
      >
        <span className="toast-emoji">👏</span>
        <span className="toast-message-text">{toastMessage}</span>
        <div
          className="toast-accent-dot"
          style={{ backgroundColor: activeSwatch.primary }}
        />
      </div>
    </div>
  );
};
