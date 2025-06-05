// src/components/common/Tooltip.tsx

import React from 'react';
import styles from './Tooltip.module.css';
import type { HoveredTermInfo } from '../../types';

interface TooltipProps {
  termInfo: HoveredTermInfo | null;
  isVisible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ termInfo, isVisible }) => {
  if (!isVisible || !termInfo) return null;

  const { term, description, x, y } = termInfo;

  let top = y + 15;
  let left = x + 15;

  if (typeof window !== 'undefined') {
    const tooltipApproxWidth = 250;
    const tooltipApproxHeight = 100;
    if (x + tooltipApproxWidth + 30 > window.innerWidth) {
      left = x - tooltipApproxWidth - 15;
    }
    if (y + tooltipApproxHeight + 30 > window.innerHeight) {
      top = y - tooltipApproxHeight - 15;
    }
  }

  return (
    <div
      className={styles.tooltip}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      <h4 className={styles.termTitle}>{term}</h4>
      <p className={styles.termDescription}>{description}</p>
    </div>
  );
};

export default Tooltip;