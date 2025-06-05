// src/components/common/SidebarTabs.tsx

import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Search,
} from 'lucide-react';
import type { WikiTerms } from '../../types';
import styles from './SidebarTabs.module.css';
import fictionStyles from '../fiction/SidebarFiction.module.css';
import wikiStyles from '../wiki/SidebarWiki.module.css';

interface SidebarTabsProps {
  isMobileMenuOpen: boolean;
  fictionTitle: string;
  fictionWordCount: number;
  wikiTerms: WikiTerms;
  selectedTermKey: string | null;
  onSelectTerm: (termKey: string) => void;
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

  const navItems = [
    { name: 'Characters', icon: Users, count: 3 },
    { name: 'Locations', icon: MapPin, count: 2 },
    { name: 'Objects/Items', icon: Package, count: 2 },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const togglePanel = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  const [searchTerm, setSearchTerm] = useState<string>('');
  const filteredTerms = Object.keys(wikiTerms)
    .filter(
      key =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wikiTerms[key].description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort();

  return (
    <div className={`${styles.wrapper} ${isMobileMenuOpen ? styles.open : styles.closed}`}>
      <div className={styles.tabHeader}>
        <button
          className={`${styles.tabButton} ${activeTab === 'fiction' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('fiction')}
        >
          Fiction
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'wiki' ? styles.activeTab : ''}`}
          onClick={() => onTabChange('wiki')}
        >
          Wiki
        </button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'fiction' ? (
          <aside className={fictionStyles.sidebar}>
            <div className={fictionStyles.header}>
              <h1 className={fictionStyles.title}>Feather</h1>
              <p className={fictionStyles.subtitle}>
                {fictionTitle} – {fictionWordCount} words
              </p>
            </div>

            <div className={fictionStyles.accordion}>
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isOpen = openIndex === idx;

                return (
                  <div key={item.name} className={fictionStyles.accordionItem}>
                    <button
                      type="button"
                      className={fictionStyles.accordionHeader}
                      onClick={() => togglePanel(idx)}
                    >
                      <div className={fictionStyles.accordionHeaderContent}>
                        <Icon
                          className={
                            isOpen
                              ? `${fictionStyles.navIcon} ${fictionStyles.navIconActive}`
                              : fictionStyles.navIcon
                          }
                          size={18}
                        />
                        <span className={fictionStyles.accordionTitle}>{item.name}</span>
                      </div>

                      <div className={fictionStyles.accordionHeaderMeta}>
                        {item.count != null && (
                          <span className={fictionStyles.accordionCount}>{item.count}</span>
                        )}

                        {isOpen ? (
                          <ChevronUp size={16} className={fictionStyles.chevronIcon} />
                        ) : (
                          <ChevronDown size={16} className={fictionStyles.chevronIcon} />
                        )}
                      </div>
                    </button>

                    <div
                      className={
                        isOpen
                          ? `${fictionStyles.accordionContent} ${fictionStyles.accordionContentOpen}`
                          : fictionStyles.accordionContent
                      }
                    >
                      <ul className={fictionStyles.itemList}>
                        {Array.from({ length: item.count }).map((_, i) => (
                          <li key={i} className={fictionStyles.itemListEntry}>
                            {item.name} #{i + 1}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        ) : (
          <aside className={wikiStyles.sidebar}>
            <div className={wikiStyles.header}>
              <BookOpen className={wikiStyles.headerIcon} />
              <h2 className={wikiStyles.headerTitle}>Wiki Terms</h2>
            </div>
            <div className={wikiStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search terms..."
                className={`input-base ${wikiStyles.searchInput}`}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
              <Search className={wikiStyles.searchIcon} />
            </div>
            <nav className={wikiStyles.navList}>
              {filteredTerms.length > 0 ? (
                filteredTerms.map(key => (
                  <button
                    key={key}
                    className={`${wikiStyles.navItem} ${key === selectedTermKey ? wikiStyles.navItemActive : ''}`}
                    onClick={() => onSelectTerm(key)}
                  >
                    {key}
                  </button>
                ))
              ) : (
                <p className={wikiStyles.noResults}>No terms found.</p>
              )}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
};

export default SidebarTabs;
