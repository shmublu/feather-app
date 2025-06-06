// src/components/fiction/SidebarFiction.tsx

import React, { useState } from "react";
import styles from "./SidebarFiction.module.css";
import {
  Users,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  Sword,
  Crown,
  Calendar,
} from "lucide-react";
import type { WikiTerms } from '../../types';

interface SidebarFictionProps {
  isMobileMenuOpen: boolean;
  title: string;
  currentWordCount: number;
  onSelectTerm: (termKey: string | null) => void;
  selectedTermKey: string | null;
  terms: WikiTerms;
}

// Map of category names to their corresponding icons
const categoryIcons = {
  Characters: Users,
  Locations: MapPin,
  Items: Package,
  Factions: Sword,
  Titles: Crown,
  Timeline: Calendar,
};

const SidebarFiction: React.FC<SidebarFictionProps> = ({
  isMobileMenuOpen,
  title,
  currentWordCount,
  onSelectTerm,
  selectedTermKey,
  terms,
}) => {
  // Process terms data
  const termsData: TermsData = terms;

  console.log('sidebarfiction terms', terms);
  
  // Get unique categories from the data
  const categories = [...new Set(termsData.map(term => term.category))];
  
  // Create categorized terms object
  const categorizedTerms = categories.reduce((acc, category) => {
    acc[category] = termsData.filter(term => term.category === category);
    return acc;
  }, {} as Record<string, Term[]>);

  // Define each accordion section with actual counts and appropriate icons
  const navItems = categories.map(category => ({
    name: category,
    icon: categoryIcons[category as keyof typeof categoryIcons] || Package, // Default to Package icon if no match
    items: categorizedTerms[category],
  }));

  // Track which panel is currently open (by index). `null` means none are open.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Toggle the accordion panel at `idx`
  const togglePanel = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <aside
      className={`
        ${styles.sidebar}
        ${isMobileMenuOpen ? styles.sidebarOpen : styles.sidebarClosed}
      `}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Editor</h1>
        <p className={styles.subtitle}>
          {title} – {currentWordCount} words
        </p>
      </div>

      {/* Accordion container */}
      <div className={styles.accordion}>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isOpen = openIndex === idx;

          return (
            <div key={item.name} className={styles.accordionItem}>
              {/* Accordion Header */}
              <button
                type="button"
                className={styles.accordionHeader}
                onClick={() => togglePanel(idx)}
              >
                <div className={styles.accordionHeaderContent}>
                  <Icon
                    className={
                      isOpen
                        ? `${styles.navIcon} ${styles.navIconActive}`
                        : styles.navIcon
                    }
                    size={18}
                  />
                  <span className={styles.accordionTitle}>{item.name}</span>
                </div>

                <div className={styles.accordionHeaderMeta}>
                  <span className={styles.accordionCount}>{item.items.length}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className={styles.chevronIcon} />
                  ) : (
                    <ChevronDown size={16} className={styles.chevronIcon} />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              <div
                className={
                  isOpen
                    ? `${styles.accordionContent} ${styles.accordionContentOpen}`
                    : styles.accordionContent
                }
              >
                <ul className={styles.itemList}>
                  {item.items.map((term) => (
                    <li 
                      key={term.text} 
                      className={`${styles.itemListEntry} ${selectedTermKey === term.text ? styles.activeItem : ''}`}
                      onClick={() => onSelectTerm(term.text)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectTerm(term.text);
                        }
                      }}
                    >
                      <div className={styles.termName}>{term.text}</div>
                      {/* <div className={styles.termDescription}>{term.description}</div> */}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarFiction;
