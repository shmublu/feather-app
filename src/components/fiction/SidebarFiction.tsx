// src/components/fiction/SidebarFiction.tsx

import React from 'react';
import styles from './SidebarFiction.module.css';
import { BookOpen, Users, MapPin, Package, Search, PlusCircle } from 'lucide-react';

interface SidebarFictionProps {
  isMobileMenuOpen: boolean;
  title: string;
  currentWordCount: number;
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  categoryCounts: Record<string, number>;
}

const SidebarFiction: React.FC<SidebarFictionProps> = ({ isMobileMenuOpen, title, currentWordCount, activeCategory, onCategorySelect, categoryCounts }) => {
  const navItems = [
    { name: "All", icon: BookOpen },
    { name: "Characters", icon: Users },
    { name: "Locations", icon: MapPin },
    { name: "Objects/Items", icon: Package },
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
        <button className={`button-base ${styles.activeButton}`}>Codex</button>
        <button className={`button-base ${styles.inactiveButton}`}>Snippets</button>
        <button className={`button-base ${styles.inactiveButton}`}>Chats</button>
        <PlusCircle className={styles.plusIcon} onClick={() => alert("Add new entry!")} />
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => {
            const active = item.name === activeCategory;
            const Count = categoryCounts[item.name] ?? 0;
            const Icon = item.icon;
            return (
              <li key={item.name} className={styles.navItem}>
                <button
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  onClick={() => onCategorySelect(item.name)}
                >
                  <div className={styles.navLinkContent}>
                    <Icon className={`icon ${active ? styles.navIconActive : styles.navIcon}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className={styles.navCount}>{Count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarFiction;