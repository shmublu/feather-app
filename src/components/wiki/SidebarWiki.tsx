// src/components/wiki/SidebarWiki.tsx

import React, { useState } from 'react';
import styles from './SidebarWiki.module.css';
import { BookOpen, Search } from 'lucide-react';
import type { WikiTerms } from '../../types';

interface SidebarWikiProps {
  terms: WikiTerms;
  onSelectTerm: (termKey: string) => void;
  selectedTermKey: string | null;
  isMobileMenuOpen: boolean;
  categoryFilter: string;
}

const SidebarWiki: React.FC<SidebarWikiProps> = ({ terms, onSelectTerm, selectedTermKey, isMobileMenuOpen, categoryFilter }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTerms = Object.keys(terms)
    .filter(key => {
      const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        terms[key].description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || terms[key].category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort();

  return (
    <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.header}>
        <BookOpen className={styles.headerIcon} />
        <h2 className={styles.headerTitle}>Wiki Terms</h2>
      </div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search terms..."
          className={`input-base ${styles.searchInput}`}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        <Search className={styles.searchIcon} />
      </div>
      <nav className={styles.navList}>
        {filteredTerms.length > 0 ? (
          filteredTerms.map(key => (
            <button
              key={key}
              className={`${styles.navItem} ${key === selectedTermKey ? styles.navItemActive : ''}`}
              onClick={() => onSelectTerm(key)}
            >
              {key}
            </button>
          ))
        ) : (
          <p className={styles.noResults}>No terms found.</p>
        )}
      </nav>
    </aside>
  );
};

export default SidebarWiki;