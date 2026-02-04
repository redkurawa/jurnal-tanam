import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/lahan', label: 'Lahan', icon: '🏞️' },
    { path: '/tanaman', label: 'Tanaman', icon: '🌱' },
    { path: '/aktivitas', label: 'Aktivitas', icon: '📝' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="header-brand">
          <span className="brand-icon">🌱</span>
          <span className="brand-name">Jurnal Tanam</span>
        </div>
        <div className="header-user">
          {currentUser?.foto && (
            <img 
              src={currentUser.foto} 
              alt={currentUser.nama} 
              className="user-avatar"
            />
          )}
        </div>
      </header>

      {/* Sidebar for desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🌱</span>
          <span className="brand-name">Jurnal Tanam</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {currentUser?.foto && (
              <img 
                src={currentUser.foto} 
                alt={currentUser.nama} 
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <span className="user-name">{currentUser?.nama}</span>
              <span className="user-email">{currentUser?.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom Navigation for mobile */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
