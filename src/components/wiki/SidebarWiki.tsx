// src/components/wiki/SidebarWiki.tsx

import React, { useState } from 'react';
import styles from './SidebarWiki.module.css';
import { Search } from 'lucide-react';
import type { WikiTerms } from '../../types';

interface SidebarWikiProps {
  terms: WikiTerms;
  onSelectTerm: (termKey: string) => void;
  selectedTermKey: string | null;
  isMobileMenuOpen: boolean;
}

const SidebarWiki: React.FC<SidebarWikiProps> = ({ terms, onSelectTerm, selectedTermKey, isMobileMenuOpen }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTerms = Object.keys(terms)
    .filter(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase()) || 
      terms[key].description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort();

  return (
    <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wiki</h1>
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