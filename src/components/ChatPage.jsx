import { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api';

const WELCOME = "Hi! I'm your California air quality assistant. Ask me about any city, county, or place in California — I'll find the closest monitoring data and give you health-aware advice.";
const MAX_INPUT = 500;

// Map common California cities/places to their counties
const CITY_TO_COUNTY = {
  'los angeles': 'Los Angeles', 'la': 'Los Angeles', 'hollywood': 'Los Angeles',
  'beverly hills': 'Los Angeles', 'pasadena': 'Los Angeles', 'burbank': 'Los Angeles',
  'long beach': 'Los Angeles', 'compton': 'Los Angeles', 'inglewood': 'Los Angeles',
  'santa monica': 'Los Angeles', 'glendale': 'Los Angeles', 'pomona': 'Los Angeles',
  'san francisco': 'San Francisco', 'sf': 'San Francisco',
  'san diego': 'San Diego', 'sd': 'San Diego', 'la jolla': 'San Diego',
  'chula vista': 'San Diego', 'oceanside': 'San Diego', 'carlsbad': 'San Diego',
  'sacramento': 'Sacramento', 'sac': 'Sacramento', 'elk grove': 'Sacramento',
  'fresno': 'Fresno', 'clovis': 'Fresno',
  'bakersfield': 'Kern', 'kern': 'Kern',
  'riverside': 'Riverside', 'corona': 'Riverside', 'moreno valley': 'Riverside',
  'palm springs': 'Riverside', 'temecula': 'Riverside', 'murrieta': 'Riverside',
  'san jose': 'Santa Clara', 'sunnyvale': 'Santa Clara', 'cupertino': 'Santa Clara',
  'mountain view': 'Santa Clara', 'palo alto': 'Santa Clara', 'santa clara': 'Santa Clara',
  'milpitas': 'Santa Clara', 'gilroy': 'Santa Clara',
  'oakland': 'Alameda', 'berkeley': 'Alameda', 'fremont': 'Alameda',
  'hayward': 'Alameda', 'alameda': 'Alameda', 'livermore': 'Alameda',
  'san bernardino': 'San Bernardino', 'ontario': 'San Bernardino', 'rancho cucamonga': 'San Bernardino',
  'fontana': 'San Bernardino', 'victorville': 'San Bernardino',
  'anaheim': 'Orange', 'irvine': 'Orange', 'orange': 'Orange',
  'huntington beach': 'Orange', 'santa ana': 'Orange', 'fullerton': 'Orange',
  'costa mesa': 'Orange', 'newport beach': 'Orange',
  'stockton': 'San Joaquin', 'tracy': 'San Joaquin', 'lodi': 'San Joaquin',
  'modesto': 'Stanislaus', 'turlock': 'Stanislaus',
  'visalia': 'Tulare', 'tulare': 'Tulare',
  'merced': 'Merced',
  'santa barbara': 'Santa Barbara', 'sb': 'Santa Barbara', 'goleta': 'Santa Barbara',
  'santa cruz': 'Santa Cruz',
  'monterey': 'Monterey', 'salinas': 'Monterey', 'carmel': 'Monterey',
  'san mateo': 'San Mateo', 'redwood city': 'San Mateo', 'daly city': 'San Mateo',
  'ventura': 'Ventura', 'oxnard': 'Ventura', 'thousand oaks': 'Ventura',
  'simi valley': 'Ventura', 'camarillo': 'Ventura',
  'marin': 'Marin', 'san rafael': 'Marin', 'mill valley': 'Marin',
  'napa': 'Napa', 'sonoma': 'Sonoma', 'santa rosa': 'Sonoma',
  'solano': 'Solano', 'vallejo': 'Solano', 'fairfield': 'Solano',
  'placer': 'Placer', 'roseville': 'Placer', 'rocklin': 'Placer',
  'redding': 'Shasta', 'shasta': 'Shasta',
  'chico': 'Butte', 'butte': 'Butte', 'paradise': 'Butte',
  'yolo': 'Yolo', 'davis': 'Yolo',
  'imperial': 'Imperial', 'el centro': 'Imperial',
  'kings': 'Kings', 'hanford': 'Kings',
  'madera': 'Madera',
  'bishop': 'Inyo', 'inyo': 'Inyo', 'lone pine': 'Inyo',
  'mammoth': 'Mono', 'mono': 'Mono', 'mammoth lakes': 'Mono',
  'tahoe': 'Placer', 'lake tahoe': 'Placer',
  'death valley': 'Inyo',
  'yosemite': 'Madera',
  'joshua tree': 'San Bernardino', 'big bear': 'San Bernardino',
};

function detectLocation(message, stationList) {
  const lower = message.toLowerCase();

  // Check station place names first (e.g., "gilroy", "bakersfield", "portola")
  if (stationList) {
    for (const s of stationList) {
      const name = (s.name || '').toLowerCase();
      if (name && name.length > 2 && lower.includes(name)) {
        return { county: s.county, station_id: s.station_id };
      }
    }
  }

  // Check city/place mapping
  for (const [city, county] of Object.entries(CITY_TO_COUNTY)) {
    if (lower.includes(city)) return { county, station_id: '' };
  }

  // Check direct county names from station list
  if (stationList) {
    const counties = [...new Set(stationList.map(s => s.county))];
    for (const county of counties) {
      if (lower.includes(county.toLowerCase())) return { county, station_id: '' };
    }
  }

  return null;
}

export default function ChatPage({ stationList, county, stationId }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    // Detect location from message. If detected, use ONLY that (don't fall back to current page state).
    const detected = detectLocation(text, stationList);
    const chatCounty = detected ? detected.county : (county || 'Fresno');
    const chatStationId = detected ? detected.station_id : (stationId || '');

    try {
      const reply = await sendChat(text, chatCounty, chatStationId);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I could not connect to the AI service right now.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const suggestions = [
    "Is it safe to jog in LA today?",
    "Compare air quality across all counties",
    "What's the forecast for San Jose this week?",
    "Should I take my kids to the park in Bakersfield?",
  ];

  return (
    <>
      <style>{`
        .chatpage-wrap {
          padding: 16px;
          max-width: 800px;
          margin: 0 auto;
        }
        .chatpage-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          min-height: 70vh;
        }
        .chatpage-header {
          margin-bottom: 16px;
        }
        .chatpage-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 300;
          font-size: 28px;
          color: #ffffff;
          margin: 0 0 4px;
        }
        .chatpage-subtitle {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
        }
        .chatpage-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
          padding-right: 4px;
          margin-bottom: 16px;
          max-height: 50vh;
        }
        .chatpage-messages::-webkit-scrollbar { width: 2px; }
        .chatpage-messages::-webkit-scrollbar-track { background: transparent; }
        .chatpage-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 1px; }
        .bubble {
          max-width: 85%;
          padding: 12px 16px;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 16px;
        }
        .bubble-bot {
          align-self: flex-start;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.11);
          border-bottom-left-radius: 4px;
          color: rgba(255,255,255,0.88);
        }
        .bubble-user {
          align-self: flex-end;
          background: rgba(255,255,255,0.20);
          border: 1px solid rgba(255,255,255,0.18);
          border-bottom-right-radius: 4px;
          color: #ffffff;
        }
        .typing-dots {
          align-self: flex-start;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.11);
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.55);
          animation: blink 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
          40%            { opacity: 1;   transform: scale(1);    }
        }
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .suggestion-btn {
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 20px;
          padding: 6px 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .suggestion-btn:hover {
          background: rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.85);
        }
        .chatpage-input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .chatpage-input {
          flex: 1;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 16px;
          padding: 12px 16px;
          resize: none;
          outline: none;
          line-height: 1.5;
          min-height: 48px;
          max-height: 120px;
        }
        .chatpage-input::placeholder { color: rgba(255,255,255,0.30); }
        .chatpage-input:focus { border-color: rgba(255,255,255,0.28); }
        .chatpage-send {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .chatpage-send:hover:not(:disabled) { background: rgba(255,255,255,0.22); }
        .chatpage-send:disabled { opacity: 0.4; cursor: default; }
        .char-count {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          text-align: right;
          margin-top: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .dot { animation: none !important; opacity: 0.6; }
        }
        @media (max-width: 768px) {
          .chatpage-card { padding: 16px; min-height: 60vh; }
        }
      `}</style>

      <div className="chatpage-wrap">
        <div className="chatpage-card">
          <div className="chatpage-header">
            <h1 className="chatpage-title">AI Assistant</h1>
            <p className="chatpage-subtitle">
              Ask about any city or county in California — air quality, health advice, forecasts
            </p>
          </div>

          <div className="chatpage-messages" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role === 'bot' ? 'bubble-bot' : 'bubble-user'}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="typing-dots" aria-label="Assistant is typing">
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="suggestion-btn"
                  onClick={() => { setInput(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="chatpage-input-row">
              <textarea
                ref={inputRef}
                className="chatpage-input"
                placeholder="Ask about any place in California..."
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={onKeyDown}
                rows={1}
                aria-label="Chat input"
                disabled={loading}
              />
              <button
                className="chatpage-send"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M14 8L2 2l2.5 6L2 14l12-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            {input.length > MAX_INPUT * 0.8 && (
              <p className="char-count">{input.length}/{MAX_INPUT}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
