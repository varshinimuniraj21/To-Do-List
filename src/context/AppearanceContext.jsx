import React, { createContext, useContext, useState, useEffect } from 'react';

export const SWATCHES = [
  {
    id: 'rainbow',
    name: 'Pastel Rainbow',
    label: 'Rainbow',
    type: 'gradient',
    preview: 'linear-gradient(135deg, #ffb3ba 0%, #ffdfba 25%, #ffffba 50%, #baffc9 75%, #bae1ff 100%)',
    primary: '#9b72cf',
    glow: 'rgba(255, 180, 210, 0.6)',
    accentBg: 'linear-gradient(135deg, rgba(255, 179, 186, 0.45), rgba(186, 225, 255, 0.45))',
    haloColor: 'rgba(255, 180, 210, 0.9)'
  },
  {
    id: 'pearl',
    name: 'Pearl',
    label: 'Pearl',
    type: 'color',
    preview: 'radial-gradient(circle at 30% 30%, #ffffff, #f0eef8 60%, #e2ddf5)',
    primary: '#7c7689',
    glow: 'rgba(220, 215, 240, 0.7)',
    accentBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(230, 225, 245, 0.5))',
    haloColor: 'rgba(220, 215, 245, 0.95)'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    label: 'Lavender',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #ddd6fe, #c4b5fd 70%, #a78bfa)',
    primary: '#8b5cf6',
    glow: 'rgba(167, 139, 250, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(196, 181, 253, 0.4), rgba(167, 139, 250, 0.35))',
    haloColor: 'rgba(167, 139, 250, 0.9)'
  },
  {
    id: 'sage',
    name: 'Sage Green',
    label: 'Sage',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #bbf7d0, #86efac 70%, #4ade80)',
    primary: '#16a34a',
    glow: 'rgba(74, 222, 128, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(187, 247, 208, 0.45), rgba(74, 222, 128, 0.35))',
    haloColor: 'rgba(74, 222, 128, 0.9)'
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    label: 'Sky Blue',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #bae6fd, #7dd3fc 70%, #38bdf8)',
    primary: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(186, 230, 253, 0.45), rgba(56, 189, 248, 0.35))',
    haloColor: 'rgba(56, 189, 248, 0.9)'
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    label: 'Ocean',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #67e8f9, #22d3ee 50%, #06b6d4 85%, #0891b2)',
    primary: '#0891b2',
    glow: 'rgba(34, 211, 238, 0.85)',
    accentBg: 'linear-gradient(135deg, rgba(34, 211, 238, 0.5), rgba(8, 145, 178, 0.4))',
    haloColor: 'rgba(34, 211, 238, 1)'
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle',
    label: 'Periwinkle',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #c7d2fe, #a5b4fc 70%, #818cf8)',
    primary: '#4f46e5',
    glow: 'rgba(129, 140, 248, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(199, 210, 254, 0.45), rgba(129, 140, 248, 0.35))',
    haloColor: 'rgba(129, 140, 248, 0.9)'
  },
  {
    id: 'pink',
    name: 'Pink',
    label: 'Pink',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #fbcfe8, #f472b6 70%, #ec4899)',
    primary: '#db2777',
    glow: 'rgba(244, 114, 182, 0.7)',
    accentBg: 'linear-gradient(135deg, rgba(251, 207, 232, 0.45), rgba(236, 72, 153, 0.35))',
    haloColor: 'rgba(244, 114, 182, 0.9)'
  },
  {
    id: 'beige',
    name: 'Beige',
    label: 'Beige',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #fde68a, #d4a373 70%, #bc6c25)',
    primary: '#b45309',
    glow: 'rgba(212, 163, 115, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.5), rgba(212, 163, 115, 0.35))',
    haloColor: 'rgba(212, 163, 115, 0.9)'
  },
  {
    id: 'slate',
    name: 'Slate',
    label: 'Slate',
    type: 'color',
    preview: 'radial-gradient(circle at 35% 35%, #94a3b8, #64748b 70%, #475569)',
    primary: '#334155',
    glow: 'rgba(100, 116, 139, 0.65)',
    accentBg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.4), rgba(71, 85, 105, 0.35))',
    haloColor: 'rgba(100, 116, 139, 0.85)'
  }
];

export const FONTS = [
  { id: 'Inter', name: 'Inter', family: "'Inter', sans-serif" },
  { id: 'Poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
  { id: 'Nunito', name: 'Nunito', family: "'Nunito', sans-serif" },
  { id: 'Outfit', name: 'Outfit', family: "'Outfit', sans-serif" }
];

export const DEFAULT_SETTINGS = {
  theme: 'Light', // 'System' | 'Light' | 'Dark'
  swatchId: 'ocean', // Matches reference image
  density: 50, // 0 to 100: Comfortable (50) vs Compact (100) or Spacious (0)
  densityMode: 'Comfortable', // 'Comfortable' | 'Compact'
  font: 'Inter',
  cornerRadius: 16, // Matches reference image value 16
  reduceMotion: false,
  highContrastOutlines: true, // In reference screenshot, this toggle is ON
  showRowDividers: false, // In reference screenshot, this toggle is OFF
  useLargeSidebarIcons: true // In reference screenshot, this toggle is ON
};

const STORAGE_KEY = 'minimal_tasklist_appearance_v2';

const AppearanceContext = createContext(null);

export const AppearanceProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read saved settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState('Appearance');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Apply CSS Variables and Body Classes
  useEffect(() => {
    const root = document.documentElement;
    const activeSwatch = SWATCHES.find((s) => s.id === settings.swatchId) || SWATCHES[5];
    const activeFont = FONTS.find((f) => f.id === settings.font) || FONTS[0];

    // Theme mode
    let effectiveTheme = settings.theme;
    if (settings.theme === 'System') {
      effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'Dark'
        : 'Light';
    }

    root.setAttribute('data-theme', effectiveTheme.toLowerCase());
    root.setAttribute('data-contrast', settings.highContrastOutlines ? 'high' : 'normal');
    root.setAttribute('data-reduce-motion', settings.reduceMotion ? 'true' : 'false');
    root.setAttribute('data-row-dividers', settings.showRowDividers ? 'true' : 'false');

    // Font Family
    root.style.setProperty('--font-current', activeFont.family);
    document.body.style.fontFamily = activeFont.family;

    // Corner Radius
    root.style.setProperty('--card-radius', `${settings.cornerRadius}px`);
    root.style.setProperty('--button-radius', `${Math.max(6, Math.round(settings.cornerRadius * 0.65))}px`);
    root.style.setProperty('--pill-radius', '9999px');

    // Accent and Swatch Colors
    root.style.setProperty('--accent-primary', activeSwatch.primary);
    root.style.setProperty('--accent-glow', activeSwatch.glow);
    root.style.setProperty('--accent-halo', activeSwatch.haloColor);
    root.style.setProperty('--accent-bg', activeSwatch.accentBg);
    root.style.setProperty('--swatch-preview', activeSwatch.preview);

    // Density
    // density 0 = relaxed (spacing 18px), 50 = comfortable (14px), 100 = compact (9px)
    const factor = settings.density / 100;
    const spaceBase = 18 - factor * 9; // 18px down to 9px
    const cardPadding = 22 - factor * 10; // 22px down to 12px
    root.style.setProperty('--spacing-row', `${spaceBase}px`);
    root.style.setProperty('--padding-card', `${cardPadding}px`);
    root.style.setProperty('--density-factor', `${factor}`);

    // Large sidebar icons
    root.style.setProperty('--sidebar-icon-size', settings.useLargeSidebarIcons ? '23px' : '18px');
    root.style.setProperty('--sidebar-item-padding', settings.useLargeSidebarIcons ? '10px 14px' : '7px 12px');

    // Transition speed
    root.style.setProperty('--transition-speed', settings.reduceMotion ? '0s' : '0.22s');
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // auto sync density mode label
      if (key === 'density') {
        next.densityMode = value > 65 ? 'Compact' : 'Comfortable';
      }
      return next;
    });
  };

  const setDensityMode = (mode) => {
    if (mode === 'Compact') {
      updateSetting('density', 85);
      updateSetting('densityMode', 'Compact');
    } else {
      updateSetting('density', 40);
      updateSetting('densityMode', 'Comfortable');
    }
  };

  const resetToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    triggerToast('Settings restored to reference defaults');
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  return (
    <AppearanceContext.Provider
      value={{
        settings,
        updateSetting,
        setDensityMode,
        resetToDefault,
        activeTab,
        setActiveTab,
        toastMessage,
        triggerToast,
        activeSwatch: SWATCHES.find((s) => s.id === settings.swatchId) || SWATCHES[5]
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};
