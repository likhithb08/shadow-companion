
import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const IDLE_THRESHOLD = 3 * 60 * 1000; // 3 minutes
const SWITCH_THRESHOLD = 6; // screens per minute
const AVOIDANCE_THRESHOLD = 3; // task updates without completion

export const useBehaviorAnalysis = () => {
  const { activityLog, logActivity, addSystemMessage, focusState, tasks } = useApp();
  const location = useLocation();
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPathRef = useRef(location.pathname);

  // 1. Navigation Tracking
  useEffect(() => {
    if (location.pathname !== lastPathRef.current) {
      logActivity('nav-switch', `Switched to ${location.pathname}`);
      lastPathRef.current = location.pathname;
    }
  }, [location, logActivity]);

  // 2. Idle Detection
  useEffect(() => {
    const resetIdle = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      
      // Only set idle timer if NOT in focus mode (focus mode implies passive working)
      if (!focusState.isActive) {
          idleTimeoutRef.current = setTimeout(() => {
            logActivity('idle-detected', 'User inactive for 3m');
            triggerIdleNudge();
          }, IDLE_THRESHOLD);
      }
    };

    // Reset on any logged activity
    if (activityLog.length > 0) {
        resetIdle();
    }

    return () => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [activityLog, focusState.isActive, logActivity]);

  // 3. Procrastination Logic
  useEffect(() => {
    if (focusState.isActive) return;

    const now = Date.now();
    const recentLogs = activityLog.filter(l => now - l.timestamp < 60000); // Last minute

    // Rule: Wandering (Excessive Switching)
    const switches = recentLogs.filter(l => l.action === 'nav-switch').length;
    if (switches > SWITCH_THRESHOLD) {
         // Debounce check: make sure we haven't nudged recently
         const lastNudge = recentLogs.find(l => l.details?.includes('drifting'));
         if (!lastNudge) {
             addSystemMessage("You're drifting between screens. Want to start a Focus Session?");
         }
    }

    // Rule: Avoidance (Moving tasks without doing them)
    // This is harder to track strictly without more specific log data, 
    // but we can check if many 'task-update' events happen without 'task-complete'
    const updates = recentLogs.filter(l => l.action === 'task-update').length;
    const completions = recentLogs.filter(l => l.action === 'task-complete').length;
    
    if (updates > AVOIDANCE_THRESHOLD && completions === 0) {
        const lastNudge = recentLogs.find(l => l.details?.includes('trouble'));
        if (!lastNudge) {
            addSystemMessage("Having trouble finishing tasks? Try breaking them down or using Focus Mode.");
        }
    }

  }, [activityLog, focusState.isActive, addSystemMessage]);

  // Nudge Functions
  const triggerIdleNudge = () => {
      // Don't nudge if on updates or feed (reading)
      if (location.pathname === '/updates' || location.pathname === '/feed') return;
      
      addSystemMessage("Still there? You've been idle for a while. Let's get back to it.");
  };
};
