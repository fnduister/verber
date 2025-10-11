// Audio feedback service for success and failure sounds

export type AudioType = 'success' | 'failure' | 'endgameSuccess' | 'endgameFailure';

interface AudioConfig {
  volume: number;
  enabled: boolean;
  preload: boolean;
}

// Audio sprite map: [startTime in ms, duration in ms]
type SpriteMap = Record<string, [number, number]>;

const positifEndgameSpriteMap: SpriteMap = {
  'ss1': [0, 3000],
  'ss2': [3000, 3000],
  'ss3': [6000, 3000],
  'ss4': [12000, 3000],
  'ss5': [15000, 3000],
  'ss6': [18000, 3000],
  'ss7': [21000, 3000],
  'ss8': [24000, 3000],
  'ss9': [27000, 3000],
  'ss10': [30000, 3000]
};

const positifEndgameKeys = ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6', 'ss7', 'ss8', 'ss9', 'ss10'];

const negatifEndgameSpriteMap: SpriteMap = {
  'ss1': [0, 3000],
  'ss2': [3000, 3000],
  'ss3': [6000, 3000],
  'ss4': [9000, 3000],
  'ss5': [15000, 3000],
  'ss6': [18000, 3000],
  'ss7': [21000, 3000],
  'ss8': [24000, 3000],
  'ss9': [12000, 3000],
  'ss10': [27000, 3000],
  'ss11': [30000, 3000],
};

const negatifEndgameKeys = ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6', 'ss7', 'ss8', 'ss9', 'ss10', 'ss11'];

const positifSpriteMap: SpriteMap = {
  'ss1': [0, 2000],
  'ss2': [3000, 2000],
  'ss3': [6000, 2000],
  'ss4': [12000, 2000],
  'ss5': [15000, 2000],
  'ss6': [18000, 2000],
  'ss7': [21000, 2000],
  'ss8': [27000, 2000],
  'ss9': [33000, 2000],
  'ss10': [36000, 2000],
  'ss11': [42000, 2000],
  'ss12': [48000, 2000]
};

const positifKeys = ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6', 'ss7', 'ss8', 'ss9', 'ss10', 'ss11', 'ss12'];

const negatifSpriteMap: SpriteMap = {
  'ss1': [0, 1500],
  'ss2': [1500, 1500],
  'ss3': [4500, 1500],
  'ss4': [6000, 1500],
  'ss5': [7500, 1500],
  'ss6': [9000, 1500],
  'ss7': [3000, 1500],
};

const negatifKeys = ['ss1', 'ss2', 'ss3', 'ss4', 'ss5', 'ss6', 'ss7'];

class AudioService {
  private audioElements: Map<AudioType, HTMLAudioElement> = new Map();
  private config: AudioConfig = {
    volume: 0.7,
    enabled: true,
    preload: true
  };
  private loadingStatus: Record<string, boolean> = {};

  constructor() {
    console.log('🎵 AudioService: Constructor called');
    this.initializeAudioElements();
    this.loadUserPreferences();
    console.log('🎵 AudioService: Constructor complete', { enabled: this.config.enabled, volume: this.config.volume });
  }

  private initializeAudioElements(): void {
    // Use paths from the public folder (accessible via browser)
    const audioSources = {
      success: '/audio/positif1_mixdown.mp3',
      failure: '/audio/negatif1.mp3',
      endgameSuccess: '/audio/positifEndgame_mixdown.mp3',
      endgameFailure: '/audio/negatifEndgame_mixdown.mp3'
    };

    console.log('🎵 AudioService: Creating audio elements', audioSources);
    Object.entries(audioSources).forEach(([type, src]) => {
      console.log(`🎵 AudioService: Creating audio element for ${type} with src: ${src}`);
      const audio = new Audio();
      audio.volume = this.config.volume;
      audio.preload = this.config.preload ? 'auto' : 'none';
      
      // Set the source after creating the element
      audio.src = src;
      
      // Add comprehensive error handling
      audio.addEventListener('error', (e) => {
        console.error(`🎵 Failed to load audio for ${type}:`, {
          error: e,
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState,
          error_code: audio.error?.code,
          error_message: audio.error?.message
        });
      });

      audio.addEventListener('loadstart', () => {
        console.log(`🎵 Started loading audio for ${type}`);
      });

      audio.addEventListener('loadeddata', () => {
        console.log(`🎵 Audio data loaded for ${type}`);
      });

      // Add load event for debugging
      audio.addEventListener('canplaythrough', () => {
        console.log(`🎵 Audio loaded successfully for ${type}`);
      });

      audio.addEventListener('loadedmetadata', () => {
        console.log(`🎵 Audio metadata loaded for ${type}, duration: ${audio.duration}s`);
      });

      this.audioElements.set(type as AudioType, audio);
    });
    console.log('🎵 AudioService: Audio elements created', this.audioElements.size);
  }

  private loadUserPreferences(): void {
    try {
      const savedVolume = localStorage.getItem('verber-audio-volume');
      const savedEnabled = localStorage.getItem('verber-audio-enabled');
      
      if (savedVolume !== null) {
        this.config.volume = parseFloat(savedVolume);
      }
      
      if (savedEnabled !== null) {
        this.config.enabled = savedEnabled === 'true';
      }

      // Update all audio elements with loaded preferences
      this.audioElements.forEach(audio => {
        audio.volume = this.config.volume;
      });
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
    }
  }

  private saveUserPreferences(): void {
    try {
      localStorage.setItem('verber-audio-volume', this.config.volume.toString());
      localStorage.setItem('verber-audio-enabled', this.config.enabled.toString());
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  }

  /**
   * Get sprite map and keys for audio type
   */
  private getAudioSprite(type: AudioType): { spriteMap: SpriteMap; keys: string[] } {
    switch (type) {
      case 'success':
        return { spriteMap: positifSpriteMap, keys: positifKeys };
      case 'failure':
        return { spriteMap: negatifSpriteMap, keys: negatifKeys };
      case 'endgameSuccess':
        return { spriteMap: positifEndgameSpriteMap, keys: positifEndgameKeys };
      case 'endgameFailure':
        return { spriteMap: negatifEndgameSpriteMap, keys: negatifEndgameKeys };
      default:
        return { spriteMap: positifSpriteMap, keys: positifKeys };
    }
  }

  /**
   * Play a specific audio sprite
   */
  private playSprite(audio: HTMLAudioElement, startTime: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTimeSeconds = startTime / 1000;
      const durationSeconds = duration / 1000;
      
      console.log('🎵 Playing audio sprite', { startTimeSeconds, durationSeconds });

      // Set up event handler to stop playback after duration
      const stopPlayback = () => {
        audio.pause();
        audio.removeEventListener('timeupdate', onTimeUpdate);
        console.log('🎵 Audio sprite playback stopped');
        resolve();
      };

      const onTimeUpdate = () => {
        if (audio.currentTime >= startTimeSeconds + durationSeconds) {
          stopPlayback();
        }
      };

      // Add timeupdate listener
      audio.addEventListener('timeupdate', onTimeUpdate);

      // Set start position and play
      audio.currentTime = startTimeSeconds;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Audio sprite started playing');
          })
          .catch((error) => {
            console.warn('🎵 Failed to play audio sprite:', error);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            resolve();
          });
      } else {
        console.log('🎵 Audio play() returned undefined for sprite');
        audio.removeEventListener('timeupdate', onTimeUpdate);
        resolve();
      }

      // Fallback timeout in case timeupdate doesn't fire
      setTimeout(() => {
        if (!audio.paused) {
          stopPlayback();
        }
      }, durationSeconds * 1000 + 100); // Add small buffer
    });
  }

  /**
   * Play audio feedback using sprite system
   * @param type Type of audio to play
   * @param options Optional configuration for this specific playback
   */
  public play(type: AudioType, options?: { volume?: number; force?: boolean }): Promise<void> {
    return new Promise((resolve) => {
      console.log('🎵 AudioService.play() called', { type, options, enabled: this.config.enabled, volume: this.config.volume });
      
      // Check if audio is disabled and not forced
      if (!this.config.enabled && !options?.force) {
        console.log('🎵 Audio disabled, skipping playback');
        resolve();
        return;
      }

      const audio = this.audioElements.get(type);
      if (!audio) {
        console.warn(`🎵 Audio element not found for type: ${type}`, { availableTypes: Array.from(this.audioElements.keys()) });
        resolve();
        return;
      }

      console.log('🎵 Audio element found, attempting to play sprite', { type, readyState: audio.readyState });

      try {
        // Set volume (use custom volume if provided)
        if (options?.volume !== undefined) {
          audio.volume = Math.max(0, Math.min(1, options.volume));
        }

        // Get sprite information
        const { spriteMap, keys } = this.getAudioSprite(type);
        
        // Select random sprite
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const [startTime, duration] = spriteMap[randomKey];
        
        console.log('🎵 Selected random sprite', { type, randomKey, startTime, duration });

        // Play the selected sprite
        this.playSprite(audio, startTime, duration).then(resolve);
        
      } catch (error) {
        console.warn(`🎵 Error playing ${type} audio sprite:`, error);
        resolve();
      }
    });
  }

  /**
   * Play success sound
   * @param isEndgame Whether this is an end-game success
   */
  public playSuccess(isEndgame: boolean = false): Promise<void> {
    const type: AudioType = isEndgame ? 'endgameSuccess' : 'success';
    console.log('🎵 AudioService: Playing success sound', { type, isEndgame, enabled: this.config.enabled, volume: this.config.volume });
    return this.play(type);
  }

  /**
   * Play failure sound
   * @param isEndgame Whether this is an end-game failure
   */
  public playFailure(isEndgame: boolean = false): Promise<void> {
    const type: AudioType = isEndgame ? 'endgameFailure' : 'failure';
    console.log('🎵 AudioService: Playing failure sound', { type, isEndgame, enabled: this.config.enabled, volume: this.config.volume });
    return this.play(type);
  }

  /**
   * Set volume for all audio elements
   * @param volume Volume level (0-1)
   */
  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      audio.volume = this.config.volume;
    });
    this.saveUserPreferences();
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.config.volume;
  }

  /**
   * Enable or disable audio
   * @param enabled Whether audio should be enabled
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveUserPreferences();
  }

  /**
   * Check if audio is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Test audio playbook
   */
  public testAudio(type: AudioType = 'success'): Promise<void> {
    return this.play(type, { force: true });
  }

  /**
   * Diagnose audio loading issues
   */
  public diagnoseAudio(): void {
    console.log('🎵 AudioService Diagnostic Report:');
    this.audioElements.forEach((audio, type) => {
      console.log(`🎵 ${type}:`, {
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState,
        duration: audio.duration,
        error: audio.error,
        paused: audio.paused
      });
    });
  }

  /**
   * Test if audio files are accessible
   */
  public async testAudioAccess(): Promise<void> {
    const testPromises = Array.from(this.audioElements.entries()).map(([type, audio]) => {
      return new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(`🎵 Timeout loading ${type}`);
          resolve();
        }, 5000);

        const onLoad = () => {
          clearTimeout(timeout);
          console.log(`🎵 ${type} loaded successfully`);
          resolve();
        };

        const onError = (e: Event) => {
          clearTimeout(timeout);
          console.error(`🎵 ${type} failed to load:`, e);
          resolve();
        };

        audio.addEventListener('canplaythrough', onLoad, { once: true });
        audio.addEventListener('error', onError, { once: true });
        
        // Force load
        audio.load();
      });
    });

    await Promise.all(testPromises);
    console.log('🎵 Audio access test completed');
  }

  /**
   * Preload all audio files
   */
  public preloadAudio(): void {
    this.audioElements.forEach((audio, type) => {
      if (audio.readyState < 2) { // HAVE_CURRENT_DATA
        audio.load();
      }
    });
  }

  /**
   * Get audio loading status
   */
  public getLoadingStatus(): Record<AudioType, boolean> {
    const status: Record<AudioType, boolean> = {} as Record<AudioType, boolean>;
    
    this.audioElements.forEach((audio, type) => {
      status[type] = audio.readyState >= 2; // HAVE_CURRENT_DATA or better
    });

    return status;
  }
}

// Create singleton instance
export const audioService = new AudioService();

// Export for React components
export default audioService;