
import React from 'react';

export const COLORS = {
  primary: '#EF4444', // Red
  secondary: '#EAB308', // Yellow
  bg: '#050505',
  card: '#0F0F0F',
};

export const NAVIGATION = [
  { name: 'Tournaments', path: '/', icon: '🏆' },
  { name: 'My Matches', path: '/my-matches', icon: '🎮' },
  { name: 'Profile', path: '/profile', icon: '👤' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
  { name: 'Wallet', path: '/wallet', icon: '💰' },
];

export const ADMIN_NAVIGATION = [
  { name: 'Dashboard', path: '/admin', icon: '📈' },
  { name: 'Manage Matches', path: '/admin/matches', icon: '⚙️' },
  { name: 'Payments', path: '/admin/payments', icon: '💳' },
];
