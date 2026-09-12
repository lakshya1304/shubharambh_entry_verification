"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className="neon-text">SHUBHARAMBH 2.0</span>
      </div>
      <div className={styles.links}>
        <Link href="/" className={pathname === '/' ? styles.active : ''}>
          Terminal
        </Link>
        <Link href="/participants" className={pathname === '/participants' ? styles.active : ''}>
          Participants
        </Link>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            const pass = window.prompt("Enter admin password to access registration:");
            if (pass === 'Lakshya@2203') {
              window.location.href = "/register";
            } else if (pass !== null) {
              alert("Invalid password");
            }
          }}
          className={pathname === '/register' ? styles.active : ''}
        >
          Register
        </a>
      </div>
    </nav>
  );
}
