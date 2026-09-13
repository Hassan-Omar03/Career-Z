import ThemeIcon from './ThemeIcon';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function AuthNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="dot"></span>
          <span className="logo-text">
            Career<span className="pk">Z.pk</span>
          </span>
        </Link>
        <div className="nav-actions">
          <button className="icon-btn" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </div>
    </header>
  );
}
