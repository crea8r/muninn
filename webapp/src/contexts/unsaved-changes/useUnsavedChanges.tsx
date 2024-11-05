import { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface UnsavedChangesConfig {
  // When true, shows confirmation dialog for navigation attempts
  enabled: boolean;
  // Custom message to show in the confirmation dialog
  message?: string;
  // Callback to run before allowing navigation
  onBeforeUnload?: () => Promise<boolean> | boolean;
  // Optional callback after user confirms navigation
  onConfirmNavigation?: () => void;
  // Pages/routes that should bypass the confirmation
  bypassUrls?: string[];
}

export type UnsavedChangesState = {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  shouldBlockNavigation: (location: any) => boolean;
};

export const useUnsavedChanges = (
  config: UnsavedChangesConfig
): UnsavedChangesState => {
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();

  const shouldBlockNavigation = useCallback(
    (nextLocation: any) => {
      // Don't block if feature is disabled or no unsaved changes
      if (!config.enabled || !isDirty) return false;

      // Don't block if navigating to bypass URLs
      if (config.bypassUrls?.includes(nextLocation.pathname)) return false;

      // Don't block if navigating to the same path (e.g., query param changes)
      if (nextLocation.pathname === location.pathname) return false;

      return true;
    },
    [config.enabled, isDirty, config.bypassUrls, location.pathname]
  );

  // Handle browser's back/forward buttons and page refresh
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (!config.enabled || !isDirty) return;

      // If there's a custom onBeforeUnload handler, call it
      if (config.onBeforeUnload) {
        const shouldBlock = await Promise.resolve(config.onBeforeUnload());
        if (!shouldBlock) return;
      }

      // Standard browser behavior for unsaved changes
      event.preventDefault();
      event.returnValue = ''; // Required for Chrome
      return ''; // Required for older browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [config, isDirty]);

  return {
    isDirty,
    setDirty: setIsDirty,
    shouldBlockNavigation,
  };
};
