// src/components/fiction/SidebarFiction.tsx

import React from 'react';
import styles from './SidebarFiction.module.css';
import { BookOpen, Users, MapPin, Package, Search, PlusCircle } from 'lucide-react';

interface SidebarFictionProps {
  isMobileMenuOpen: boolean;
  title: string;
  currentWordCount: number;
}

const SidebarFiction: React.FC<SidebarFictionProps> = ({ isMobileMenuOpen, title, currentWordCount }) => {
  const navItems = [
    { name: "Codex", icon: BookOpen, count: 10, active: true, subItems: [{ name: "All", count: 10 }] },
    { name: "Characters", icon: Users, count: 3 },
    { name: "Locations", icon: MapPin, count: 2 },
    { name: "Objects/Items", icon: Package, count: 2 },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Searching codex:", e.target.value);
  };

  return (
    <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Feather</h1>
        <p className={styles.subtitle}>{title} - {currentWordCount} words</p>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search all entries..."
          className={`input-base ${styles.searchInput}`}
          onChange={handleSearch}
        />
        <Search className={styles.searchIcon} />
      </div>

      <div className={styles.buttonGroup}>
        <button className={`button-base ${styles.activeButton}`} onClick={() => alert('Codex clicked')}>Codex</button>
        <button className={`button-base ${styles.inactiveButton}`} onClick={() => alert('Snippets feature coming soon')}>Snippets</button>
        <button className={`button-base ${styles.inactiveButton}`} onClick={() => alert('Chats feature coming soon')}>Chats</button>
        <PlusCircle className={styles.plusIcon} onClick={() => alert('Add new entry!')} />
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className={styles.navItem}>
              <button
                type="button"
                className={`${styles.navLink} ${item.active ? styles.navLinkActive : ''}`}
                onClick={() => alert(`${item.name} panel not implemented`)}
              >
                <div className={styles.navLinkContent}>
                  <item.icon className={`icon ${item.active ? styles.navIconActive : styles.navIcon}`} />
                  <span>{item.name}</span>
                </div>
                {item.count !== undefined && <span className={styles.navCount}>{item.count}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarFiction;