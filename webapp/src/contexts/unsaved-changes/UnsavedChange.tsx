import React, { createContext, useContext, ReactNode } from 'react';
import { Prompt } from 'react-router-dom';
import {
  useUnsavedChanges,
  UnsavedChangesConfig,
  UnsavedChangesState,
} from './useUnsavedChanges';

const UnsavedChangesContext = createContext<UnsavedChangesState | undefined>(
  undefined
);

export interface UnsavedChangesProviderProps extends UnsavedChangesConfig {
  children: ReactNode;
}

const DEFAULT_MESSAGE =
  'You have unsaved changes. Are you sure you want to leave this page?';

export const UnsavedChangesProvider: React.FC<UnsavedChangesProviderProps> = ({
  children,
  message = DEFAULT_MESSAGE,
  ...config
}) => {
  const unsavedChangesState = useUnsavedChanges(config);
  const { isDirty, shouldBlockNavigation } = unsavedChangesState;

  return (
    <UnsavedChangesContext.Provider value={unsavedChangesState}>
      {/* Prompt component from react-router-dom handles the navigation blocking */}
      <Prompt
        when={isDirty}
        message={(location) => {
          if (shouldBlockNavigation(location)) {
            return message;
          }
          return true;
        }}
      />
      {children}
    </UnsavedChangesContext.Provider>
  );
};

export const useUnsavedChangesContext = () => {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error(
      'useUnsavedChangesContext must be used within an UnsavedChangesProvider'
    );
  }
  return context;
};
