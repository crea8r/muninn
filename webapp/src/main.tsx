import React, { Suspense, lazy } from 'react';
import LightweightLoading from './components/LightweightLoading';

// Lazy load the main App component
const App = lazy(() => import('./App'));

function Main() {
  return (
    <Suspense fallback={<LightweightLoading />}>
      <App />
    </Suspense>
  );
}

export default Main;
