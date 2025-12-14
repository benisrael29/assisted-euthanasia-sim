'use client';

import { useState, useEffect } from 'react';

const FADE_DURATION = 1000;

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
    content: "You have requested to end your life.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "This program will guide you through the process of ending your life.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "The procedure involves the administration of Nembutal, a drug that will induce deep sleep followed by respiratory arrest.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 15000
  },
  {
    content: "An infusion pump will administer 2000mg of Nembutal over 5 mins.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: "You may experience a slight bitter taste in your mouth as the drug is administered.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 6000
  },
  {
    content: "once started, the process is irreversible.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 6000
  },
  {
    content: "You acknowledge that this procedure will kill you.",
    requiresAcknowledgment: true,
    autoAdvance: false
  },
  {
    content: "After giving acknowledgement, you will be given a lethal dose of Nembutal and die.",
    requiresAcknowledgment: true,
    autoAdvance: false
  },  
  {
    content: [
      "The medication is being administered now."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 25000 // 25 seconds
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
      "You are beginning to feel drowsy..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000 // 12 seconds
  },
  {
    content: [
      "Your breathing is slowing..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000 // 12 seconds
  },
  {
    content: [
      "Your consciousness is fading..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [],
    isAd: true,
    adId: 2,
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 30000 // 30 seconds unskippable ad
  },
  {
    content: [
      "You are falling into a deep sleep..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 20000 // 20 seconds
  },
  {
    content: [
      "This is the last thing you will experience."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [
      "Goodbye."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 16000 // 16 seconds
  },
  {
    content: [""],
    requiresAcknowledgment: false,
    autoAdvance: false
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [administrationStartTime, setAdministrationStartTime] = useState<Date | null>(null);
  const [adCountdown, setAdCountdown] = useState(30);
  const [showCannotSkip, setShowCannotSkip] = useState(false);

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
    if (currentScreen.isAd && adCountdown > 0) {
      const timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (currentScreen.isAd && adCountdown === 0) {
      setAdCountdown(30);
    }
  }, [currentScreen.isAd, adCountdown]);

  useEffect(() => {
    if (currentScreen.isAd) {
      setAdCountdown(30);
      setShowCannotSkip(false);
    }
  }, [currentIndex]);

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

  const handleAcknowledgment = () => {
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
      <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#0a0a0a', color: '#b0b0b0', fontFamily: 'Arial, sans-serif' }}>
        <div className="border-b px-6 py-4" style={{ borderColor: '#4a4a4a', backgroundColor: '#1a1a1a' }}>
          <div className="flex items-center justify-between">
            <div className="text-lg" style={{ color: '#b0b0b0' }}>
              {formatDate(currentTime)} | {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl font-bold mb-4" style={{ color: '#ffffff' }}>PROCEDURE COMPLETE</div>
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

  if (currentScreen.isAd) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center relative"
        style={{
          backgroundColor: '#0a0a0a',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: fadeOut ? 0 : 1,
            transition: `opacity ${FADE_DURATION}ms linear`
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden relative" style={{ backgroundColor: '#ffffff' }}>
            <button
              onClick={() => setShowCannotSkip(true)}
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
              style={{ zIndex: 10 }}
            >
              <span className="text-xl font-bold">×</span>
            </button>
            {showCannotSkip && (
              <div className="absolute top-16 right-4 z-20">
                <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-red-700">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold">You cannot skip the ad</p>
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
                <span className="text-white text-sm font-bold">AD</span>
                <span className="text-white text-xs">Sponsored</span>
              </div>
              <div className="text-white text-sm font-bold">{adCountdown}</div>
            </div>
            <div className="p-8">
              <div className="mb-4">
                {currentScreen.adId === 1 ? (
                  <>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Serenex - Find Your Peace</h2>
                    <p className="text-lg mb-4" style={{ color: '#4a4a4a' }}>
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
                      className="bg-blue-600 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: '#1976d2' }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Learn More
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>Zephyril - Reclaim Your Life</h2>
                    <p className="text-lg mb-4" style={{ color: '#4a4a4a' }}>
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
                      className="bg-purple-600 text-white px-6 py-3 rounded font-semibold hover:bg-purple-700 transition-colors"
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
          Ad cannot be skipped
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: '#0a0a0a',
        color: '#b0b0b0',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div className="border-b px-6 py-4" style={{ borderColor: '#4a4a4a', backgroundColor: '#1a1a1a' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-lg" style={{ color: '#b0b0b0' }}>
              STATUS: <span className="font-bold" style={{ color: '#ffffff' }}>{getStatusText()}</span>
            </div>
            {isAdministering && (
              <div className="text-lg" style={{ color: '#b0b0b0' }}>
                ELAPSED: <span style={{ color: '#ffffff' }}>{getElapsedTime()}</span>
              </div>
            )}
          </div>
          <div className="text-lg" style={{ color: '#b0b0b0' }}>
            {formatDate(currentTime)} | {formatTime(currentTime)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-12 py-16">
        <div className="max-w-4xl w-full">
          <div className="border-2 shadow-lg" style={{ backgroundColor: '#1a1a1a', borderColor: '#4a4a4a' }}>
            <div className="p-12">
              <div 
                className="space-y-6"
                style={{
                  opacity: fadeOut ? 0 : 1,
                  transition: `opacity ${FADE_DURATION}ms linear`
                }}
              >
                {contentArray.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`text-5xl leading-relaxed text-left ${
                      line === "" ? "h-8" : ""
                    }`}
                    style={{
                      fontFamily: 'Arial, sans-serif',
                      letterSpacing: '0.01em',
                      lineHeight: '1.8',
                      color: '#ffffff'
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentScreen.requiresAcknowledgment && (
        <button
          onClick={handleAcknowledgment}
          disabled={acknowledged}
          className="fixed bottom-6 right-6 py-3 px-6 text-base uppercase tracking-wider border-2 transition-all duration-200"
          style={{
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '0.05em',
            fontWeight: 'bold',
            backgroundColor: acknowledged ? '#2a2a2a' : '#3a3a3a',
            color: acknowledged ? '#6a6a6a' : '#ffffff',
            borderColor: acknowledged ? '#4a4a4a' : '#6a6a6a',
            cursor: acknowledged ? 'not-allowed' : 'pointer',
            zIndex: 1000
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
          onMouseDown={(e) => {
            if (!acknowledged) {
              e.currentTarget.style.backgroundColor = '#5a5a5a';
            }
          }}
          onMouseUp={(e) => {
            if (!acknowledged) {
              e.currentTarget.style.backgroundColor = '#4a4a4a';
            }
          }}
        >
          {acknowledged ? 'ACKNOWLEDGED' : 'I Acknowledge That I Am Going To Die'}
        </button>
      )}
    </div>
  );
}
