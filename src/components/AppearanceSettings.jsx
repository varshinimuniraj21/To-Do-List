import React, { useState } from 'react';
import {
  SWATCHES,
  FONTS,
  useAppearance
} from '../context/AppearanceContext';
import {
  ChevronDown,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Eye,
  Layers
} from 'lucide-react';
import { LivePreview } from './LivePreview';

export const AppearanceSettings = () => {
  const {
    settings,
    updateSetting,
    setDensityMode,
    resetToDefault,
    activeSwatch,
    triggerToast
  } = useAppearance();

  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  const themeOptions = ['System', 'Light', 'Dark'];

  return (
    <div className="appearance-page-container">
      {/* Top Header */}
      <header className="appearance-header">
        <div className="header-title-group">
          <h1 className="appearance-main-title">Appearance</h1>
          <p className="appearance-subtitle">
            Customize your watercolor glass theme, typography, and layout density
          </p>
        </div>

        <button
          type="button"
          className="reset-defaults-btn"
          onClick={resetToDefault}
          title="Restore reference defaults"
        >
          <RotateCcw size={14} className="reset-icon" />
          <span>Reset to default</span>
        </button>
      </header>

      {/* Grid: Left Settings Controls + Right Live Preview */}
      <div className="appearance-layout-grid">
        {/* Left Settings Panel */}
        <div className="appearance-controls-column">
          {/* 1. THEME */}
          <section className="settings-section">
            <label className="section-label">Theme</label>
            <div className="theme-segmented-control" role="radiogroup">
              {themeOptions.map((t) => {
                const isActive = settings.theme === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`theme-segment-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      updateSetting('theme', t);
                      triggerToast(`Theme set to ${t}`);
                    }}
                    role="radio"
                    aria-checked={isActive}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. COLOR SWATCHES */}
          <section className="settings-section">
            <label className="section-label">Swatch</label>
            <div className="swatches-row">
              {SWATCHES.map((swatch) => {
                const isSelected = settings.swatchId === swatch.id;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    className={`swatch-circle-btn ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      updateSetting('swatchId', swatch.id);
                      triggerToast(`Color theme updated to ${swatch.name}`);
                    }}
                    title={swatch.name}
                    aria-label={`Select ${swatch.name} swatch`}
                    style={{
                      background: swatch.preview
                    }}
                  >
                    {/* Glowing halo indicator when selected */}
                    {isSelected && (
                      <span
                        className="swatch-halo-aura"
                        style={{
                          borderColor: swatch.haloColor,
                          boxShadow: `0 0 16px ${swatch.glow}, 0 0 8px ${swatch.haloColor}`
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active swatch name displayed directly underneath in accent color, matching screenshot */}
            <div
              className="selected-swatch-label"
              style={{ color: activeSwatch.primary }}
            >
              {activeSwatch.label}
            </div>
          </section>

          {/* 3. DENSITY */}
          <section className="settings-section">
            <div className="section-label-row">
              <label className="section-label">Density</label>
              <div className="density-mode-pills">
                <button
                  type="button"
                  className={`density-pill ${settings.densityMode === 'Comfortable' ? 'active' : ''}`}
                  onClick={() => setDensityMode('Comfortable')}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`density-pill ${settings.densityMode === 'Compact' ? 'active' : ''}`}
                  onClick={() => setDensityMode('Compact')}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="density-slider-container">
              <div className="slider-track-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.density}
                  onChange={(e) => updateSetting('density', Number(e.target.value))}
                  className="glass-slider density-slider"
                  aria-label="Density slider"
                />
                <div
                  className="slider-filled-track"
                  style={{ width: `${settings.density}%` }}
                />
              </div>
              <div className="density-endpoints">
                <span>Comfortable</span>
                <span>Compact</span>
              </div>
            </div>
          </section>

          {/* 4. TYPEFACE */}
          <section className="settings-section typeface-section">
            <label className="section-label">Typeface</label>
            <div className="typeface-dropdown-wrapper">
              <button
                type="button"
                className="typeface-select-btn"
                onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={fontDropdownOpen}
              >
                <span className="current-font-name" style={{ fontFamily: `'${settings.font}', sans-serif` }}>
                  {settings.font}
                </span>
                <ChevronDown
                  size={16}
                  className={`dropdown-chevron ${fontDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {fontDropdownOpen && (
                <>
                  <div
                    className="dropdown-backdrop"
                    onClick={() => setFontDropdownOpen(false)}
                  />
                  <div className="typeface-options-menu" role="listbox">
                    {FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        className={`font-option-item ${settings.font === font.id ? 'is-selected' : ''}`}
                        onClick={() => {
                          updateSetting('font', font.id);
                          setFontDropdownOpen(false);
                          triggerToast(`Typeface changed to ${font.name}`);
                        }}
                        style={{ fontFamily: font.family }}
                        role="option"
                        aria-selected={settings.font === font.id}
                      >
                        <span className="font-item-text">{font.name}</span>
                        {settings.font === font.id && (
                          <Check size={14} className="font-check-icon" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 5. CORNER RADIUS */}
          <section className="settings-section">
            <label className="section-label">Corner radius</label>
            <div className="radius-control-row">
              <div className="radius-slider-wrapper">
                <input
                  type="range"
                  min="6"
                  max="28"
                  step="1"
                  value={settings.cornerRadius}
                  onChange={(e) => updateSetting('cornerRadius', Number(e.target.value))}
                  className="glass-slider radius-slider"
                  aria-label="Corner radius slider"
                />
                <div
                  className="slider-filled-track"
                  style={{ width: `${((settings.cornerRadius - 6) / (28 - 6)) * 100}%` }}
                />
                {/* Visual notch lines matching screenshot */}
                <div className="slider-ticks">
                  <span className="tick" style={{ left: '0%' }} />
                  <span className="tick" style={{ left: '25%' }} />
                  <span className="tick" style={{ left: '50%' }} />
                  <span className="tick" style={{ left: '75%' }} />
                  <span className="tick" style={{ left: '100%' }} />
                </div>
              </div>

              {/* Number display badge on right (16 in screenshot) */}
              <div className="radius-number-badge">
                {settings.cornerRadius}
              </div>
            </div>
          </section>

          {/* 6. ADDITIONAL SETTINGS (TOGGLES) */}
          <section className="settings-section toggles-section">
            {/* Reduce motion */}
            <div className="toggle-row-item">
              <div className="toggle-label-block">
                <span className="toggle-title">Reduce motion</span>
                <span className="toggle-subtitle">Reduce motion</span>
              </div>
              <button
                type="button"
                className={`glass-switch ${settings.reduceMotion ? 'is-checked' : ''}`}
                onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                role="switch"
                aria-checked={settings.reduceMotion}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* High contrast outlines */}
            <div className="toggle-row-item">
              <div className="toggle-label-block">
                <span className="toggle-title">High contrast outlines</span>
                <span className="toggle-subtitle">High contrast outlines</span>
              </div>
              <button
                type="button"
                className={`glass-switch ${settings.highContrastOutlines ? 'is-checked' : ''}`}
                onClick={() => updateSetting('highContrastOutlines', !settings.highContrastOutlines)}
                role="switch"
                aria-checked={settings.highContrastOutlines}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* Show row dividers */}
            <div className="toggle-row-item">
              <div className="toggle-label-block">
                <span className="toggle-title">Show row dividers</span>
                <span className="toggle-subtitle">Show row dividers and separators</span>
              </div>
              <button
                type="button"
                className={`glass-switch ${settings.showRowDividers ? 'is-checked' : ''}`}
                onClick={() => updateSetting('showRowDividers', !settings.showRowDividers)}
                role="switch"
                aria-checked={settings.showRowDividers}
              >
                <span className="switch-thumb" />
              </button>
            </div>

            {/* Use large sidebar icons */}
            <div className="toggle-row-item">
              <div className="toggle-label-block">
                <span className="toggle-title">Use large sidebar icons</span>
                <span className="toggle-subtitle">Use large sidebar icons</span>
              </div>
              <button
                type="button"
                className={`glass-switch ${settings.useLargeSidebarIcons ? 'is-checked' : ''}`}
                onClick={() => updateSetting('useLargeSidebarIcons', !settings.useLargeSidebarIcons)}
                role="switch"
                aria-checked={settings.useLargeSidebarIcons}
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </section>
        </div>

        {/* Right Live Preview Column */}
        <div className="appearance-preview-column">
          <LivePreview />
        </div>
      </div>
    </div>
  );
};
