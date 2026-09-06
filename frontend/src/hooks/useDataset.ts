import { useEffect } from 'react';
import { useOceanStore } from '../store/oceanStore';
import { fetchDatasetMetadata, fetchHealth, fetchSlice } from '../services/api';

export function useDataset() {
  const {
    selectedScenario,
    selectedVariable,
    selectedTimeIndex,
    selectedDepth,
    dataset,
    setDataset,
    setBackendOnline,
    setLoading,
    setError,
    setCurrentSlice,
  } = useOceanStore();

  // 1. Fetch metadata on scenario change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        try {
          const health = await fetchHealth();
          if (health.status === 'ok' && isMounted) {
            setBackendOnline(true);
          }
        } catch {
          if (isMounted) setBackendOnline(false);
        }

        const metadata = await fetchDatasetMetadata(selectedScenario);
        if (isMounted) {
          setDataset(metadata);
          setBackendOnline(true);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to connect to ocean model backend');
        }
      }
    }

    loadData();

    const interval = setInterval(async () => {
      try {
        const health = await fetchHealth();
        if (isMounted) setBackendOnline(health.status === 'ok');
      } catch {
        if (isMounted) setBackendOnline(false);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedScenario, setDataset, setBackendOnline, setLoading, setError]);

  // 2. Fetch active 2D horizontal slice when coordinates change
  useEffect(() => {
    let isMounted = true;

    async function loadSliceData() {
      if (!dataset) return;

      // Find depth index matching selectedDepth
      const depthValues = dataset.coordinates.depth.values;
      const depthIdx = depthValues.findIndex((d) => Math.abs(d - selectedDepth) < 0.1);
      const safeDepthIdx = depthIdx >= 0 ? depthIdx : 0;

      try {
        const slice = await fetchSlice(
          selectedVariable,
          selectedTimeIndex,
          safeDepthIdx,
          selectedScenario
        );
        if (isMounted) {
          setCurrentSlice(slice);
        }
      } catch (err) {
        console.warn('Could not fetch slice data:', err);
      }
    }

    loadSliceData();

    return () => {
      isMounted = false;
    };
  }, [dataset, selectedVariable, selectedTimeIndex, selectedDepth, selectedScenario, setCurrentSlice]);
}
