import { useState, useEffect, useCallback } from 'react';

const PAGES = [
  { key: 'forecast', label: 'Forecast' },
  { key: 'map', label: 'Map' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'about', label: 'About' },
];

export default function Nav({ activePage = 'forecast', setPage }) {
  const [open, setOpen] = useState(false);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onKeyDown]);

  function navigate(pageKey) {
    if (setPage) setPage(pageKey);
    setOpen(false);
  }

  return (
    <>
      <style>{`
        .nav-links { display: flex; }
        .nav-hamburger { display: none; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
        .nav-link:focus-visible,
        .nav-close:focus-visible,
        .nav-hamburger-btn:focus-visible,
        .overlay-link:focus-visible {
          outline: 2px solid rgba(255,255,255,0.6);
          outline-offset: 3px;
        }
        .nav-link:hover { color: rgba(255,255,255,0.85) !important; cursor: pointer; }
        .overlay-link:hover { color: #fff !important; cursor: pointer; }
        .nav-hamburger-btn:hover,
        .nav-close:hover { color: #fff !important; }
      `}</style>
      <nav style={styles.nav}>
        <div style={styles.inner}>
          <a
            style={styles.logo}
            aria-label="CA AQI Forecast home"
            onClick={() => navigate('forecast')}
          >
            CA AQI{' '}
            <span style={styles.logoLight}>Forecast</span>
          </a>

          <ul style={styles.linkList} className="nav-links" role="list">
            {PAGES.map(({ key, label }) => (
              <li key={key}>
                <a
                  className="nav-link"
                  style={key === activePage ? styles.linkActive : styles.link}
                  aria-current={key === activePage ? 'page' : undefined}
                  onClick={() => navigate(key)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-hamburger">
            <button
              className="nav-hamburger-btn"
              style={styles.hamburger}
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            className="nav-close"
            style={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
          <ul style={styles.overlayList} role="list">
            {PAGES.map(({ key, label }) => (
              <li key={key}>
                <a
                  style={key === activePage ? styles.overlayLinkActive : styles.overlayLink}
                  aria-current={key === activePage ? 'page' : undefined}
                  className="overlay-link"
                  onClick={() => navigate(key)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <rect y="0"  width="22" height="2" rx="1" fill="currentColor" />
      <rect y="7"  width="22" height="2" rx="1" fill="currentColor" />
      <rect y="14" width="22" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="1" x2="1" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '10px 16px',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(22px) saturate(160%)',
    WebkitBackdropFilter: 'blur(22px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '20px',
    padding: '12px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: '16px',
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '0.2px',
    flexShrink: 0,
    cursor: 'pointer',
  },
  logoLight: {
    fontWeight: 300,
    color: 'rgba(255,255,255,0.55)',
  },
  linkList: {
    display: 'flex',
    gap: '32px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  link: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 400,
    fontSize: '14px',
    color: 'rgba(255,255,255,0.50)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    outline: 'none',
    borderRadius: '4px',
    padding: '2px 4px',
  },
  linkActive: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 500,
    fontSize: '14px',
    color: '#ffffff',
    textDecoration: 'none',
    outline: 'none',
    borderRadius: '4px',
    padding: '2px 4px',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    lineHeight: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    background: 'rgba(4,10,4,0.96)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    lineHeight: 0,
  },
  overlayList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
  },
  overlayLink: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 300,
    fontSize: '36px',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
  overlayLinkActive: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 300,
    fontSize: '36px',
    color: '#ffffff',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    cursor: 'pointer',
  },
};
