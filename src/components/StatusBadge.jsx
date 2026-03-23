import React from 'react';

// ── Shared color maps — import these wherever you need badges ──

export const VENDOR_TYPE_COLORS = {
  Purchase: { bg: '#DBEAFE', color: '#1E40AF' },
  Rental:   { bg: '#FEF3C7', color: '#92400E' },
  Repair:   { bg: '#ECFDF5', color: '#065F46' },
};

export const VENDOR_ACTIVE_COLORS = {
  Active:   { bg: '#D1FAE5', color: '#065F46' },
  Inactive: { bg: '#FEE2E2', color: '#991B1B' },
};

export const TICKET_PRIORITY_COLORS = {
  Critical: { bg: '#FEE2E2', color: '#991B1B' },
  High:     { bg: '#FEF3C7', color: '#92400E' },
  Medium:   { bg: '#DBEAFE', color: '#1E40AF' },
  Low:      { bg: '#F3F4F6', color: '#374151' },
};

export const TICKET_STATUS_COLORS = {
  'Open':        { bg: '#FEF9C3', color: '#713F12' },
  'In Progress': { bg: '#DBEAFE', color: '#1E40AF' },
  'Resolved':    { bg: '#D1FAE5', color: '#065F46' },
  'Closed':      { bg: '#F3F4F6', color: '#374151' },
};

export const ASSET_STATUS_COLORS = {
  assigned:    { bg: '#D1FAE5', color: '#065F46' },
  available:   { bg: '#DCFCE7', color: '#166534' },
  maintenance: { bg: '#FEF3C7', color: '#92400E' },
  'not found': { bg: '#FEE2E2', color: '#991B1B' },
  sold:        { bg: '#F3F4F6', color: '#374151' },
  // Title-case variants (used by mobile/mouse data)
  Assigned:    { bg: '#D1FAE5', color: '#065F46' },
  Available:   { bg: '#DCFCE7', color: '#166534' },
  Maintenance: { bg: '#FEF3C7', color: '#92400E' },
  Disposal:    { bg: '#FEE2E2', color: '#991B1B' },
  'Not Working':{ bg: '#FEE2E2', color: '#991B1B' },
  'Not Found': { bg: '#FEE2E2', color: '#991B1B' },
};

const DEFAULT_COLOR = { bg: '#F3F4F6', color: '#6B7280' };

/**
 * Generic status/type badge.
 *
 * Usage:
 *   import StatusBadge, { TICKET_STATUS_COLORS } from '../components/StatusBadge';
 *   <StatusBadge value="Open" colorMap={TICKET_STATUS_COLORS} />
 */
const StatusBadge = ({ value, colorMap = {} }) => {
  const c = colorMap[value] || DEFAULT_COLOR;
  return (
    <span className="lp-type-badge" style={{ background: c.bg, color: c.color }}>
      {value || '—'}
    </span>
  );
};

export default StatusBadge;
