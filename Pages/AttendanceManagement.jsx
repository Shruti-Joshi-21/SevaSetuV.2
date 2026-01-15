import React from 'react';
import AttendanceReview from './AttendanceReview';

// Re-export AttendanceReview as AttendanceManagement for admin
export default function AttendanceManagement() {
  return <AttendanceReview />;
}