import { useState, useCallback } from 'react';
import { CameraState } from '../types/game';

export const useCameraController = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    currentViewMode: 'overview',
    isTransitioning: false,
    viewModes: {
      overview: {
        name: '概覽模式',
        position: { x: 0, y: 2, z: 4 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75,
      },
      gameplay: {
        name: '遊戲模式',
        position: { x: 0, y: 0.5, z: 2 },
        target: { x: 0, y: 0, z: 0 },
        fov: 60,
      },
    },
  });

  // 切換視角模式
  const switchViewMode = useCallback((mode: 'overview' | 'gameplay') => {
    setCameraState(prev => ({
      ...prev,
      currentViewMode: mode,
      isTransitioning: true,
    }));

    // 模擬過渡動畫
    setTimeout(() => {
      setCameraState(prev => ({
        ...prev,
        isTransitioning: false,
      }));
    }, 1000);
  }, []);

  // 切換到概覽模式
  const switchToOverview = useCallback(() => {
    switchViewMode('overview');
  }, [switchViewMode]);

  // 切換到遊戲模式
  const switchToGameplay = useCallback(() => {
    switchViewMode('gameplay');
  }, [switchViewMode]);

  return {
    cameraState,
    switchViewMode,
    switchToOverview,
    switchToGameplay,
  };
};
