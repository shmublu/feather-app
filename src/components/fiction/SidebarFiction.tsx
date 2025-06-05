// src/components/fiction/SidebarFiction.tsx

import React, { useState } from "react";
import styles from "./SidebarFiction.module.css";
import {
  BookOpen,
  Users,
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SidebarFictionProps {
  isMobileMenuOpen: boolean;
  title: string;
  currentWordCount: number;
}

const SidebarFiction: React.FC<SidebarFictionProps> = ({
  isMobileMenuOpen,
  title,
  currentWordCount,
}) => {
  // Define each accordion section
  const navItems = [
    { name: "Characters", icon: Users, count: 3 },
    { name: "Locations", icon: MapPin, count: 2 },
    { name: "Objects/Items", icon: Package, count: 2 },
  ];

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
        <h1 className={styles.title}>Feather</h1>
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
                  {item.count != null && (
                    <span className={styles.accordionCount}>{item.count}</span>
                  )}

                  {isOpen ? (
                    <ChevronUp size={16} className={styles.chevronIcon} />
                  ) : (
                    <ChevronDown size={16} className={styles.chevronIcon} />
                  )}
                </div>
              </button>

              {/* Accordion Content (shown only if `isOpen`) */}
              <div
                className={
                  isOpen
                    ? `${styles.accordionContent} ${styles.accordionContentOpen}`
                    : styles.accordionContent
                }
              >
                {/* Replace this with whatever content you actually need—e.g. a list of your characters, locations, etc. */}
                <ul className={styles.itemList}>
                  {/* Example placeholders; remove or replace with real data */}
                  {Array.from({ length: item.count }).map((_, i) => (
                    <li key={i} className={styles.itemListEntry}>
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
  );
};

export default SidebarFiction;
