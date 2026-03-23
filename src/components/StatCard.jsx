import React from 'react';

/**
 * Reusable stat card used across all management pages.
 *
 * Props:
 *   label    — e.g. "Total Vendors"
 *   value    — numeric or string value
 *   sub      — optional sub-text below value
 *   subColor — optional color override for sub text
 *   accent   — top-border + value color (default: var(--clr-primary))
 *   icon     — optional SVG/ReactNode rendered in colored circle
 */
const StatCard = ({ label, value, sub, subColor, accent, icon }) => {
  const color = accent || 'var(--clr-primary)';
  return (
    <div className="lp-stat-card" style={{ borderTopColor: color }}>
      <div className="lp-stat-card-inner">
        <div>
          <div className="lp-stat-lbl">{label}</div>
          <div className="lp-stat-val" style={{ color }}>{value}</div>
          {sub && (
            <div className="lp-stat-sub" style={{ color: subColor || 'var(--clr-text-muted)' }}>
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div className="lp-stat-icon" style={{ background: `${color}18`, color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
