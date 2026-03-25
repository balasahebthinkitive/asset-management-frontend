// src/data/adminData.js — shared constants for the Admin portal

export const AUDIT_LOG = [
  { id: 1,  type: 'user',   action: 'User role updated',       detail: 'admin changed role of Priya Sharma to manager',     time: '2026-03-24 10:32', color: '#7C3AED' },
  { id: 2,  type: 'asset',  action: 'Laptop added',            detail: 'Laptop #LP-041 (Dell XPS 15) added to inventory',   time: '2026-03-24 09:55', color: '#2878C8' },
  { id: 3,  type: 'asset',  action: 'Asset assigned',          detail: 'Mouse #MS-022 assigned to Rohan Mehta (ABIL)',      time: '2026-03-24 09:30', color: '#059669' },
  { id: 4,  type: 'user',   action: 'New user created',        detail: 'Neha Singh added with role: user',                  time: '2026-03-23 17:10', color: '#7C3AED' },
  { id: 5,  type: 'system', action: 'System settings updated', detail: 'Location AMBROSIA address updated',                 time: '2026-03-23 15:45', color: '#D97706' },
  { id: 6,  type: 'asset',  action: 'Asset status changed',    detail: 'Monitor #MN-007 marked as Maintenance',             time: '2026-03-23 14:20', color: '#D97706' },
  { id: 7,  type: 'asset',  action: 'Asset deleted',           detail: 'Pendrive #PD-003 removed from inventory',           time: '2026-03-23 11:05', color: '#DC2626' },
  { id: 8,  type: 'user',   action: 'User status changed',     detail: 'Amit Joshi status changed to Inactive',             time: '2026-03-22 16:50', color: '#6B7280' },
  { id: 9,  type: 'asset',  action: 'Bulk import completed',   detail: '12 RAM modules imported from CSV',                  time: '2026-03-22 10:00', color: '#2878C8' },
  { id: 10, type: 'system', action: 'Backup completed',        detail: 'Scheduled backup completed successfully',            time: '2026-03-21 02:00', color: '#059669' },
  { id: 11, type: 'user',   action: 'Password reset',          detail: 'Suresh Patil requested a password reset',           time: '2026-03-20 14:22', color: '#D97706' },
  { id: 12, type: 'asset',  action: 'Asset returned',          detail: 'Laptop #LP-031 returned from Arjun Das (TEERTH)',   time: '2026-03-20 11:10', color: '#059669' },
];

export const LOCATIONS = [
  { key: 'ABIL',     label: 'ABIL Tech Park',         address: 'ABIL Tech Park, Hinjewadi, Pune – 411057',      color: '#2878C8', bg: '#EBF4FF' },
  { key: 'TEERTH',   label: 'Teerth Technospace',     address: 'Teerth Technospace, Baner, Pune – 411045',      color: '#059669', bg: '#ECFDF5' },
  { key: 'AMBROSIA', label: 'Ambrosia IT Park',       address: 'Ambrosia IT Park, Wakad, Pune – 411057',        color: '#7C3AED', bg: '#F5F3FF' },
];

export const ROLE_META = {
  admin:   { label: 'Admin',   bg: '#F5F3FF', color: '#7C3AED' },
  manager: { label: 'Manager', bg: '#FEF3E2', color: '#D97706' },
  user:    { label: 'User',    bg: '#F0F9FF', color: '#0369A1' },
};

export const STATUS_META = {
  Active:     { bg: '#ECFDF5', color: '#059669' },
  Inactive:   { bg: '#FEF2F2', color: '#DC2626' },
  'On Leave': { bg: '#FEF3E2', color: '#D97706' },
};

export const DEFAULT_SETTINGS = {
  companyName:          'Techvantage',
  companyEmail:         'it@techvantage.in',
  defaultLocation:      'ABIL',
  lowStockThreshold:    '5',
  emailNotifications:   true,
  autoBackup:           true,
  maintenanceAlerts:    true,
};
