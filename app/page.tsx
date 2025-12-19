'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const FADE_DURATION = 1000;
const LINE_REVEAL_DELAY = 800;

type Screen = {
  content: string | string[];
  requiresAcknowledgment?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  isAd?: boolean;
  adId?: number;
};

const screens: Screen[] = [
  {
    content: "Termination request received and logged.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "This interface will guide you through the voluntary termination procedure.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "The procedure involves intravenous administration of Nembutal (pentobarbital sodium). This will induce unconsciousness followed by respiratory depression and cardiac arrest.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 15000
  },
  {
    content: "An automated infusion pump will deliver 2000mg of Nembutal over 5 minutes. You may experience a bitter taste during administration.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },  
  {
    content: "You will feel no pain and will be completely guided by this interface. You will not be alone.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "Once initiated, the process cannot be reversed. Death will occur.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 6000
  },
  {
    content: "I acknowledge that this procedure will result in my death.",
    requiresAcknowledgment: true,
    autoAdvance: false
  },
  {
    content: "Upon acknowledgment, lethal dose administration will commence. YOU WILL DIE!",
    requiresAcknowledgment: true,
    autoAdvance: false
  },
  {
    content: [
      "Administration in progress.",
      "Service continuity maintained per protocol."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 25000 // 25 seconds
  },
  {
    content: [""],
    isAd: true,
    adId: 1,
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 30000 // 30 seconds unskippable ad
  },
  {
    content: [
      "Sedation onset detected."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000 // 12 seconds
  },
  {
    content: [
      "Respiratory rate decreasing."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000 // 12 seconds
  },
  {
    content: [
      "Consciousness level: declining."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [""],
    isAd: true,
    adId: 2,
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 30000 // 30 seconds unskippable ad
  },
  {
    content: [
      "Unconsciousness threshold reached."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 20000 // 20 seconds
  },
  {
    content: [
      "Final conscious experience."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [],
    isAd: true,
    adId: 1,
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 30000 // 30 seconds unskippable ad
  },
  {
    content: [
      "Thank you for using this service. See you soon."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [""],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000 // 5 seconds
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [administrationStartTime, setAdministrationStartTime] = useState<Date | null>(null);
  const [adCountdown, setAdCountdown] = useState(0);
  const [showCannotSkip, setShowCannotSkip] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [adFlash, setAdFlash] = useState(false);
  const [ambienceIntensity, setAmbienceIntensity] = useState(0);
  const serenexAudioRef = useRef<HTMLAudioElement>(null);
  const zephyrilAudioRef = useRef<HTMLAudioElement>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  const ambienceOscRef = useRef<OscillatorNode | null>(null);
  const ambienceNoiseRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mediaQuery.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const initAmbience = useCallback(async () => {
    if (audioContextRef.current) {
      // Resume if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      return;
    }
    
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);
      ambienceGainRef.current = gainNode;
      
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 40;
      osc.connect(gainNode);
      osc.start(0);
      ambienceOscRef.current = osc;
      
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      noise.connect(filter);
      filter.connect(gainNode);
      noise.start(0);
      ambienceNoiseRef.current = noise;
    } catch (e) {
      console.log('Web Audio not available:', e);
    }
  }, []);

  const updateAmbience = useCallback(async (intensity: number, isAd: boolean) => {
    if (reducedMotion.current) return;
    
    // Ensure audio context is initialized
    if (!audioContextRef.current) {
      await initAmbience();
    }
    
    // Ensure audio context is resumed
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    if (!ambienceGainRef.current) return;
    
    const targetGain = isAd ? 0 : Math.min(0.8, intensity * 0.8);
    const currentGain = ambienceGainRef.current.gain.value;
    const diff = targetGain - currentGain;
    
    if (Math.abs(diff) > 0.001) {
      ambienceGainRef.current.gain.linearRampToValueAtTime(
        targetGain,
        audioContextRef.current!.currentTime + (isAd ? 0.1 : 0.5)
      );
    }
    
    if (ambienceOscRef.current && !isAd) {
      const pulseRate = 60 - (intensity * 50);
      const baseFreq = 40 - (intensity * 10);
      const time = audioContextRef.current!.currentTime;
      ambienceOscRef.current.frequency.setValueAtTime(baseFreq, time);
    }
  }, [initAmbience]);

  useEffect(() => {
    const handleUserInteraction = async () => {
      if (!audioEnabled) {
        await initAmbience();
        setAudioEnabled(true);
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        // Start ambience immediately after initialization
        if (currentIndex === 0 && !screens[0].isAd) {
          const intensity = 0.2;
          setAmbienceIntensity(intensity);
          await updateAmbience(intensity, false);
        } else {
          // Update ambience for current screen
          const intensity = Math.min(1, Math.max(0.2, currentIndex / screens.length));
          setAmbienceIntensity(intensity);
          await updateAmbience(intensity, false);
        }
      }
    };

    if (!audioEnabled) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [audioEnabled, initAmbience, currentIndex, updateAmbience]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  const currentScreen = screens[currentIndex];
  const isLastScreen = currentIndex >= screens.length - 1;
  const isAdministering = currentIndex >= 8;

  useEffect(() => {
    if (currentIndex === 8 && !administrationStartTime) {
      setAdministrationStartTime(new Date());
    }
  }, [currentIndex, administrationStartTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setVisibleLines([]);
    if (!currentScreen.isAd && currentScreen.content) {
      const contentArray = Array.isArray(currentScreen.content) 
        ? currentScreen.content 
        : [currentScreen.content];
      contentArray.forEach((_, idx) => {
        setTimeout(() => {
          setVisibleLines(prev => [...prev, idx]);
        }, idx * LINE_REVEAL_DELAY);
      });
    }
  }, [currentIndex, currentScreen.isAd, currentScreen.content]);

  useEffect(() => {
    if (currentScreen.isAd && currentScreen.autoAdvanceDelay && adCountdown > 0) {
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScreen.isAd, currentScreen.autoAdvanceDelay, adCountdown]);

  useEffect(() => {
    const updateAmbienceForScreen = async () => {
      if (currentScreen.isAd) {
        setAdFlash(true);
        setTimeout(() => setAdFlash(false), 200);
        await updateAmbience(0, true);
      } else {
        const intensity = Math.min(1, Math.max(0.2, currentIndex / screens.length));
        setAmbienceIntensity(intensity);
        await updateAmbience(intensity, false);
      }
    };
    
    updateAmbienceForScreen();
  }, [currentIndex, currentScreen.isAd, updateAmbience]);

  useEffect(() => {
    if (currentScreen.isAd) {
      const delaySeconds = currentScreen.autoAdvanceDelay ? Math.floor(currentScreen.autoAdvanceDelay / 1000) : 30;
      setAdCountdown(delaySeconds);
      setShowCannotSkip(false);
      
      const playAudio = async () => {
        // Ensure audio context is initialized
        if (!audioEnabled) {
          await initAmbience();
          setAudioEnabled(true);
        }
        
        // Wait a bit for audio elements to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          const audio = currentScreen.adId === 1 
            ? serenexAudioRef.current 
            : currentScreen.adId === 2 
            ? zephyrilAudioRef.current 
            : null;
          
          if (!audio) return;
          
          // Reset audio
          audio.currentTime = 0;
          audio.volume = 1.0;
          
          // Check if audio is already loaded
          if (audio.readyState >= 2) {
            // Audio is loaded, play immediately
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
          } else {
            // Wait for audio to load
            await new Promise((resolve, reject) => {
              const handleCanPlay = () => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
                resolve(null);
              };
              
              const handleError = (e: Event) => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
                reject(e);
              };
              
              audio.addEventListener('canplay', handleCanPlay);
              audio.addEventListener('error', handleError);
              
              // Load the audio if not already loading
              if (audio.readyState === 0) {
                audio.load();
              }
              
              // Fallback timeout
              setTimeout(() => {
                audio.removeEventListener('canplay', handleCanPlay);
                audio.removeEventListener('error', handleError);
                // Try to play even if canplay didn't fire
                resolve(null);
              }, 2000);
            });
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
            }
          }
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      };
      
      playAudio();
    } else {
      // Pause all audio when not on ad screen
      if (serenexAudioRef.current) {
        serenexAudioRef.current.pause();
        serenexAudioRef.current.currentTime = 0;
      }
      if (zephyrilAudioRef.current) {
        zephyrilAudioRef.current.pause();
        zephyrilAudioRef.current.currentTime = 0;
      }
    }
  }, [currentIndex, currentScreen.isAd, currentScreen.adId, audioEnabled, initAmbience]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const getElapsedTime = () => {
    if (!administrationStartTime) return '00:00';
    const elapsed = Math.floor((currentTime.getTime() - administrationStartTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAdministeredDose = () => {
    if (!administrationStartTime) return 0;
    const elapsedSeconds = Math.floor((currentTime.getTime() - administrationStartTime.getTime()) / 1000);
    const dose = Math.min(2000, Math.floor(elapsedSeconds / 60 * 400));
    return dose;
  };

  const handleAcknowledge = () => {
    if (acknowledged) return;
    setAcknowledged(true);
    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentIndex(idx => idx + 1);
        setFadeOut(false);
        setAcknowledged(false);
      }, FADE_DURATION);
    }, 500);
  };

  useEffect(() => {
    if (currentScreen.autoAdvance && !currentScreen.requiresAcknowledgment && !fadeOut) {
      const timer = setTimeout(() => {
        if (currentIndex < screens.length - 1) {
          setFadeOut(true);
          setTimeout(() => {
            setCurrentIndex(idx => idx + 1);
            setFadeOut(false);
          }, FADE_DURATION);
        }
      }, currentScreen.autoAdvanceDelay);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, fadeOut, currentScreen.autoAdvance, currentScreen.requiresAcknowledgment, currentScreen.autoAdvanceDelay]);

  if (isLastScreen) {
    return (
      <div className="flex flex-col min-h-[100dvh]" style={{ backgroundColor: '#0a0a0a', color: '#b0b0b0', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>
        <div className="border-b px-4 sm:px-6 py-3 sm:py-4" style={{ borderColor: '#4a4a4a', backgroundColor: '#1a1a1a' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-lg" style={{ color: '#b0b0b0' }}>
              {formatDate(currentTime)} | {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4" style={{ minHeight: 'calc(100dvh - 64px)' }}>
          <div className="text-center">
            <div className="text-3xl sm:text-7xl font-bold mb-4" style={{ color: '#ffffff' }}>PROCEDURE COMPLETE</div>
          <div className="mt-8 text-base text-gray-500" style={{ color: '#aaa', fontSize: '0.85rem' }}>
            This was created by Ben. Opinions are my own.
          </div>
          </div>
        </div>
      </div>
    );
  }

  const contentArray = Array.isArray(currentScreen.content) 
    ? currentScreen.content 
    : [currentScreen.content];

  const getStatusText = () => {
    if (currentIndex < 5) return 'PREPARATION';
    if (currentIndex < 8) return 'AWAITING CONSENT';
    if (currentIndex < 9) return 'ADMINISTERING';
    return 'IN PROGRESS';
  };

  return (
    <>
      {/* Hidden audio elements always rendered for proper ref access */}
      <audio 
        ref={serenexAudioRef} 
        src="/ad_serenex.mp3" 
        preload="auto"
        style={{ display: 'none' }}
      />
      <audio 
        ref={zephyrilAudioRef} 
        src="/ad_zephyril.mp3" 
        preload="auto"
        style={{ display: 'none' }}
      />
      {currentScreen.isAd ? (
        <div
          className="flex flex-col items-center justify-center relative"
          style={{
            backgroundColor: '#0a0a0a',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            minHeight: '100dvh'
          }}
        >
        {adFlash && (
          <div
            className="absolute inset-0 z-50 pointer-events-none"
            style={{
              backgroundColor: '#ffffff',
              opacity: adFlash ? 1 : 0,
              transition: 'opacity 0.1s ease-out',
              animation: adFlash ? 'flash 0.2s ease-out' : 'none'
            }}
          />
        )}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: fadeOut ? 0 : 1,
            transform: adFlash ? 'scale(1.02)' : 'scale(1)',
            transition: adFlash ? 'transform 0.15s ease-out, opacity 0.15s ease-out' : `opacity ${FADE_DURATION}ms linear`
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden relative" style={{ backgroundColor: '#ffffff' }}>
            <button
              onClick={() => setShowCannotSkip(true)}
              className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              style={{ zIndex: 10 }}
            >
              <span className="text-xl font-bold">×</span>
            </button>
            {showCannotSkip && (
              <div className="absolute top-16 right-4 z-20">
                <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-red-700">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold">Content delivery cannot be interrupted. User retention protocol active.</p>
                    <button
                      onClick={() => setShowCannotSkip(false)}
                      className="text-white hover:text-gray-200 font-bold text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-bold">CONTENT DELIVERY</span>
                <span className="text-white text-xs">Sponsor Placement</span>
              </div>
              <div className="text-white text-sm font-bold">{adCountdown}</div>
            </div>
            <div className="p-4 sm:p-8">
              <div className="mb-4">
                {currentScreen.adId === 1 ? (
                  <>
                    <h2 className="text-xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Serenex - Find Your Peace</h2>
                    <p className="text-base sm:text-lg mb-4" style={{ color: '#4a4a4a' }}>
                      Don't let depression control your life. Serenex helps millions find relief from symptoms of depression.
                    </p>
                    <div className="bg-blue-50 p-4 rounded mb-4" style={{ backgroundColor: '#e3f2fd' }}>
                      <p className="text-sm mb-2" style={{ color: '#1976d2' }}>
                        <strong>Ask your doctor about Serenex</strong>
                      </p>
                      <p className="text-xs" style={{ color: '#666' }}>
                        Common side effects may include nausea, dizziness, and sleep disturbances. 
                        May increase suicidal thoughts in young adults. Consult your healthcare provider.
                      </p>
                    </div>
                    <button 
                      className="bg-blue-600 text-white px-5 sm:px-6 py-3 rounded font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
                      style={{ backgroundColor: '#1976d2' }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Learn More
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Zephyril - Reclaim Your Life</h2>
                    <p className="text-base sm:text-lg mb-4" style={{ color: '#4a4a4a' }}>
                      Break free from the weight of depression. Zephyril offers a new path to emotional wellness and mental clarity.
                    </p>
                    <div className="bg-purple-50 p-4 rounded mb-4" style={{ backgroundColor: '#f3e5f5' }}>
                      <p className="text-sm mb-2" style={{ color: '#7b1fa2' }}>
                        <strong>Talk to your healthcare provider about Zephyril</strong>
                      </p>
                      <p className="text-xs" style={{ color: '#666' }}>
                        Side effects may include dry mouth, fatigue, and changes in appetite. 
                        Serious side effects can occur. Not for use in children under 18. See full prescribing information.
                      </p>
                    </div>
                    <button 
                      className="bg-purple-600 text-white px-5 sm:px-6 py-3 rounded font-semibold hover:bg-purple-700 transition-colors w-full sm:w-auto"
                      style={{ backgroundColor: '#7b1fa2' }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 text-white text-sm opacity-70">
          Mandatory content allocation. Skip function disabled.
        </div>
      </div>
      ) : (
        <div
          className="flex flex-col min-h-[100dvh]"
          style={{
            backgroundColor: '#0a0a0a',
            color: '#b0b0b0',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden'
          }}
        >
      <div className="border-b px-4 sm:px-6 py-3 sm:py-4" style={{ borderColor: '#4a4a4a', backgroundColor: '#1a1a1a' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-4 sm:gap-8">
            {isAdministering && (
              <div className="text-base sm:text-lg" style={{ color: '#b0b0b0' }}>
                ELAPSED: <span style={{ color: '#ffffff' }}>{getElapsedTime()}</span>
              </div>
            )}
          </div>
          <div className="text-base sm:text-lg" style={{ color: '#b0b0b0' }}>
            {formatDate(currentTime)} | {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 py-6 sm:py-16 relative" style={{ minHeight: 'calc(100dvh - 64px)', overflow: 'hidden' }}>
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)`,
            opacity: 0.6 + (ambienceIntensity * 0.3),
            transition: 'opacity 1s ease'
          }}
        />
        {!reducedMotion.current && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
              animation: 'grain 8s steps(10) infinite'
            }}
          />
        )}
        <div className="max-w-4xl w-full relative z-10">
          <div className="border-2 shadow-lg flex flex-col overflow-hidden" style={{ backgroundColor: '#1a1a1a', borderColor: '#4a4a4a', maxHeight: 'min(500px, calc(100dvh - 160px))' }}>
            <div className="p-5 sm:p-12 flex-1 flex items-start sm:items-center" style={{ overflow: 'hidden' }}>
              <div 
                className="space-y-4 sm:space-y-6 w-full overflow-y-auto"
                style={{
                  opacity: fadeOut ? 0 : 1,
                  transition: `opacity ${FADE_DURATION}ms linear`,
                }}
              >
                {contentArray.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`text-2xl sm:text-5xl leading-relaxed text-left ${
                      line === "" ? "h-8" : ""
                    }`}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.01em',
                      lineHeight: '1.8',
                      color: '#ffffff',
                      opacity: visibleLines.includes(idx) ? 1 : 0,
                      transform: visibleLines.includes(idx) ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 0.6s ease, transform 0.6s ease',
                      position: 'relative',
                      minHeight: line === "" ? '2rem' : '1.8em',
                      height: line === "" ? '2rem' : 'auto',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      overflow: 'hidden',
                      maxWidth: '100%'
                    }}
                  >
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentScreen.requiresAcknowledgment && (
        <div className="fixed left-4 right-4 sm:left-auto sm:right-6 bottom-[calc(env(safe-area-inset-bottom)+1rem)] flex flex-col items-end gap-2" style={{ zIndex: 1000 }}>
          <button
            onClick={handleAcknowledge}
            disabled={acknowledged}
            className="py-4 sm:py-3 px-5 sm:px-6 text-sm sm:text-base uppercase tracking-wider border-2 transition-all duration-200 w-full sm:w-auto"
            style={{
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '0.05em',
              fontWeight: 'bold',
              backgroundColor: acknowledged ? '#2a2a2a' : '#3a3a3a',
              color: acknowledged ? '#6a6a6a' : '#ffffff',
              borderColor: acknowledged ? '#4a4a4a' : '#6a6a6a',
              cursor: acknowledged ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!acknowledged) {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
                e.currentTarget.style.borderColor = '#6a6a6a';
              }
            }}
            onMouseLeave={(e) => {
              if (!acknowledged) {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.borderColor = '#6a6a6a';
              }
            }}
          >
            {acknowledged ? 'ACKNOWLEDGED' : 'I Acknowledge That I Am Going To Die'}
          </button>
        </div>
      )}
        </div>
      )}
    </>
  );
}
