import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
    >
      <div className="theme-toggle-icon-wrap">
        {isDark ? (
          <Sun size={17} className="theme-sun-icon" />
        ) : (
          <Moon size={17} className="theme-moon-icon" />
        )}
      </div>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </button>
  );
};
