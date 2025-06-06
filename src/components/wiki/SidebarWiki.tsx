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

  // reindex terms based on key "text"-id where id is index of term

  const filteredTerms = terms.filter(term =>
      term.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort();

  console.log('terms', terms);
  console.log('filteredTerms', filteredTerms);

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
          filteredTerms.map(term => (
            <button
              key={term.text}
              className={`${styles.navItem} ${term.text === selectedTermKey ? styles.navItemActive : ''}`}
              onClick={() => onSelectTerm(term.text)}
            >
              {term.title}
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