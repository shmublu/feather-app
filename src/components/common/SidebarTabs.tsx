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
  onSelectTerm: (termKey: string | null) => void;
  activeTab: 'fiction' | 'wiki';
  onTabChange: (tab: 'fiction' | 'wiki') => void;
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
          className={`${styles.tabButton} ${activeTab === 'fiction' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('fiction')}
        >
          Editor
        </button>
        {/* <button
          className={`${styles.tabButton} ${activeTab === 'wiki' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('wiki')}
        >
          Wiki
        </button> */}
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'fiction' ? (
          <SidebarFiction
            isMobileMenuOpen={true}
            title={fictionTitle}
            currentWordCount={fictionWordCount}
            onSelectTerm={onSelectTerm}
            selectedTermKey={selectedTermKey}
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
