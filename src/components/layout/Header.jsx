import './Header.css';

export default function Header({ onLogout, isAdmin }) {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">Polyscope</h1>
        <p className="header-subtitle">Prediction Intelligence</p>
        {isAdmin && (
          <button className="header-logout" onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
