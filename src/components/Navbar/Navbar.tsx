import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import styles from './Navbar.module.css';

const LINKS = [
  { to: '/', label: 'HOME', end: true },
  { to: '/divisions', label: 'DIVISIONS' },
  { to: '/facilities', label: 'FACILITIES' },
  { to: '/work-order', label: 'WORK ORDER' },
  { to: '/tracking', label: 'TRACKING' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} onClick={() => setOpen(false)}>
          <span className={styles.logoTop}>ENGINEERING</span>
          <span className={styles.logoBottom}>TAMAN SAFARI BOGOR</span>
        </Link>

        {/* desktop */}
        <nav className={styles.links} aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <Link to="/dashboard" className={styles.cta}>
            <LayoutDashboard size={15} />
            DASHBOARD
          </Link>
          <button
            type="button"
            className={styles.burger}
            onClick={() => setOpen((o) => !o)}
            aria-label="Buka menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* mobile */}
      {open && (
        <nav className={styles.mobile} aria-label="Navigasi utama (mobile)">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${styles.mLink} ${isActive ? styles.mLinkActive : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/dashboard" className={styles.mCta} onClick={() => setOpen(false)}>
            <LayoutDashboard size={15} /> DASHBOARD
          </Link>
        </nav>
      )}
    </header>
  );
}
