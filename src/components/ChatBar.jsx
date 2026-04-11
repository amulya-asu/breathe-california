import { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api';

const WELCOME = 'Ask me about air quality, outdoor activities, or what to expect this week.';
const MAX_INPUT = 500;

export default function ChatBar({ county }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: WELCOME },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([{ role: 'bot', text: WELCOME }]);
  }, [county]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const reply = await sendChat(text, county);
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

  return (
    <>
      <style>{`
        .chat-wrap {
          padding: 0 16px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .chat-card {
          background: rgba(255,255,255,0.11);
          backdrop-filter: blur(32px) saturate(190%);
          -webkit-backdrop-filter: blur(32px) saturate(190%);
          border: 1px solid rgba(255,255,255,0.17);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chat-label {
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.48);
        }
        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 260px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.18) transparent;
          padding-right: 4px;
        }
        .chat-messages::-webkit-scrollbar       { width: 2px; }
        .chat-messages::-webkit-scrollbar-track  { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.18); border-radius: 1px; }
        .bubble {
          max-width: 80%;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          line-height: 1.55;
          border-radius: 14px;
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
          border-radius: 14px;
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
        .chat-input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .chat-input {
          flex: 1;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 14px;
          padding: 10px 14px;
          resize: none;
          outline: none;
          line-height: 1.5;
          min-height: 42px;
          max-height: 100px;
        }
        .chat-input::placeholder { color: rgba(255,255,255,0.30); }
        .chat-input:focus { border-color: rgba(255,255,255,0.28); }
        .chat-send {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .chat-send:hover:not(:disabled)  { background: rgba(255,255,255,0.22); }
        .chat-send:disabled { opacity: 0.4; cursor: default; }
        .chat-send:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }
        .char-count {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.28);
          text-align: right;
        }
        @media (prefers-reduced-motion: reduce) {
          .dot { animation: none !important; opacity: 0.6; }
        }
      `}</style>

      <div className="chat-wrap">
        <div className="chat-card">
          <span className="chat-label">Ask About Air Quality</span>

          <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`bubble ${m.role === 'bot' ? 'bubble-bot' : 'bubble-user'}`}
              >
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

          <div>
            <div className="chat-input-row">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder={`Ask about ${county} air quality…`}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={onKeyDown}
                rows={1}
                aria-label="Chat input"
                disabled={loading}
              />
              <button
                className="chat-send"
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
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

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M14 8L2 2l2.5 6L2 14l12-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
