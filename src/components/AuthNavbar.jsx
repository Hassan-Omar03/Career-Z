import { Link } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa6';
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
          <button className="icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>
            {theme === 'dark' ? <FaMoon size={16} /> : <FaSun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
