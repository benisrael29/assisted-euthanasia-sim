'use client';

import { useState, useEffect } from 'react';

const FADE_DURATION = 1000;

type Screen = {
  content: string | string[];
  requiresAcknowledgment?: boolean;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
};

const screens: Screen[] = [
  {
    content: "You have requested to end your life.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000
  },
  {
    content: "This program will guide you through the process of ending your life.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000
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
    content: "The process is irreversible once it has started.",
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 6000
  },
  {
    content: "You understand that this procedure will result in your death.",
    requiresAcknowledgment: true,
    autoAdvance: false
  },
  {
    content: "After giving consent, you will be given a lethal dose of Nembutal.",
    requiresAcknowledgment: true,
    autoAdvance: false
  },  
  {
    content: [
      "The medication is being administered now."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 12000
  },
  {
    content: [
      "You are beginning to feel drowsy..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000
  },
  {
    content: [
      "Your breathing is slowing..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 5000
  },
  {
    content: [
      "Your consciousness is fading..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 7000
  },
  {
    content: [
      "You are falling into a deep sleep..."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 8000
  },
  {
    content: [
      "This is the last thing you will experience."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 7000
  },
  {
    content: [
      "Goodbye."
    ],
    requiresAcknowledgment: false,
    autoAdvance: true,
    autoAdvanceDelay: 7000
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
      <div className="flex min-h-screen flex-col font-mono" style={{ backgroundColor: '#0a0a0a', color: '#b0b0b0' }}>
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

  return (
    <div
      className="flex min-h-screen flex-col font-mono transition-opacity duration-1000"
      style={{
        backgroundColor: '#0a0a0a',
        color: '#b0b0b0',
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms linear`
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
              <div className="space-y-6">
                {contentArray.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`text-5xl leading-relaxed text-left ${
                      line === "" ? "h-8" : ""
                    }`}
                    style={{
                      fontFamily: 'monospace',
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
          className="fixed bottom-6 right-6 py-3 px-6 text-base font-mono uppercase tracking-wider border-2 transition-all duration-200"
          style={{
            fontFamily: 'monospace',
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
