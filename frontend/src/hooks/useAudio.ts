import { useCallback, useEffect, useState } from 'react';
import { audioService, AudioType } from '../services/audioService';

export interface UseAudioReturn {
  playSuccess: (isEndgame?: boolean) => Promise<void>;
  playFailure: (isEndgame?: boolean) => Promise<void>;
  playAudio: (type: AudioType) => Promise<void>;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  volume: number;
  enabled: boolean;
  isLoading: boolean;
  testAudio: (type?: AudioType) => Promise<void>;
}

/**
 * React hook for audio feedback
 * Provides easy access to success/failure sounds with user preferences
 */
export const useAudio = (): UseAudioReturn => {
  const [volume, setVolumeState] = useState(audioService.getVolume());
  const [enabled, setEnabledState] = useState(audioService.isEnabled());
  const [isLoading, setIsLoading] = useState(true);

  // Check if audio files are loaded
  useEffect(() => {
    const checkLoading = () => {
      const status = audioService.getLoadingStatus();
      const allLoaded = Object.values(status).every(loaded => loaded);
      setIsLoading(!allLoaded);
    };

    // Initial check
    checkLoading();

    // Preload audio files
    audioService.preloadAudio();

    // Check loading status periodically
    const interval = setInterval(checkLoading, 500);

    // Cleanup after 10 seconds (audio should be loaded by then)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

    const playSuccess = useCallback(async (isEndgame: boolean = false): Promise<void> => {
        console.log('🎣 useAudio: playSuccess called', { isEndgame });
        return audioService.playSuccess(isEndgame);
    }, []);

    const playFailure = useCallback(async (isEndgame: boolean = false): Promise<void> => {
        console.log('🎣 useAudio: playFailure called', { isEndgame });
        return audioService.playFailure(isEndgame);
    }, []);  const playAudio = useCallback(async (type: AudioType): Promise<void> => {
    return audioService.play(type);
  }, []);

  const setVolume = useCallback((newVolume: number): void => {
    audioService.setVolume(newVolume);
    setVolumeState(newVolume);
  }, []);

  const setEnabled = useCallback((newEnabled: boolean): void => {
    audioService.setEnabled(newEnabled);
    setEnabledState(newEnabled);
  }, []);

  const testAudio = useCallback(async (type: AudioType = 'success'): Promise<void> => {
    return audioService.testAudio(type);
  }, []);

  return {
    playSuccess,
    playFailure,
    playAudio,
    setVolume,
    setEnabled,
    volume,
    enabled,
    isLoading,
    testAudio
  };
};