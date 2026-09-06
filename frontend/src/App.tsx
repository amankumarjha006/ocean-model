import React from 'react';
import { useDataset } from './hooks/useDataset';
import { useOceanStore } from './store/oceanStore';
import { Header } from './components/layout/Header';
import { LeftControlPanel } from './components/layout/LeftControlPanel';
import { RightInfoPanel } from './components/layout/RightInfoPanel';
import { BottomTimeline } from './components/layout/BottomTimeline';
import { OceanViewport } from './components/visualization/OceanViewport';
import { AlertCircle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  useDataset();
  const { isLoading, error } = useOceanStore();

  return (
    <div className="ocean-app-root">
      <Header />

      <main className="ocean-app-body">
        <LeftControlPanel />
        
        <div className="center-stage">
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="loading-overlay">
              <Loader2 size={32} className="spin text-cyan" />
              <span>Loading INCOIS Ocean Model Dataset...</span>
            </div>
          )}

          <OceanViewport />
        </div>

        <RightInfoPanel />
      </main>

      <BottomTimeline />
    </div>
  );
};

export default App;
