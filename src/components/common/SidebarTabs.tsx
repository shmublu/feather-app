// src/components/common/SidebarTabs.tsx

import React from 'react';
import SidebarFiction from '../fiction/SidebarFiction';
import SidebarWiki from '../wiki/SidebarWiki';
import type { WikiTerms } from '../../types';
import styles from './SidebarTabs.module.css';

interface SidebarTabsProps {
  isMobileMenuOpen: boolean;
  fictionTitle: string;
  fictionWordCount: number;
  wikiTerms: WikiTerms;
  selectedTermKey: string | null;
  onSelectTerm: (termKey: string) => void;
  activeTab: 'editor' | 'wiki';
  onTabChange: (tab: 'editor' | 'wiki') => void;
}

const SidebarTabs: React.FC<SidebarTabsProps> = ({
  isMobileMenuOpen,
  fictionTitle,
  fictionWordCount,
  wikiTerms,
  selectedTermKey,
  onSelectTerm,
  activeTab,
  onTabChange,
}) => {

  return (
    <div className={`${styles.wrapper} ${isMobileMenuOpen ? styles.open : styles.closed}`}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'editor' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('editor')}
        >
          Editor
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'wiki' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('wiki')}
        >
          Wiki
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'editor' ? (
          <SidebarFiction
            isMobileMenuOpen={true}
            title={fictionTitle}
            currentWordCount={fictionWordCount}
          />
        ) : (
          <SidebarWiki
            terms={wikiTerms}
            onSelectTerm={onSelectTerm}
            selectedTermKey={selectedTermKey}
            isMobileMenuOpen={true}
          />
        )}
      </div>
    </div>
  );
};

export default SidebarTabs;
