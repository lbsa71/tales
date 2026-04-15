import { useState, useEffect, useRef } from 'react';
import './DebugOverlay.css';

interface LogEntry {
  id: number;
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  args: any[];
}

export const DebugOverlay = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const logIdRef = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      setLogs(prev => {
        const newLogs = [...prev, {
          id: logIdRef.current++,
          timestamp: Date.now(),
          level,
          message,
          args,
        }];
        // Keep only last 500 logs to prevent memory issues
        return newLogs.slice(-500);
      });
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.info = (...args: any[]) => {
      originalInfo(...args);
      addLog('info', ...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (!isMinimized && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isMinimized]);

  // Check URL for ?debug parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('debug')) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) {
    return null;
  }

  const clearLogs = () => {
    setLogs([]);
  };

  const playTestTone = async () => {
    console.log('[DebugOverlay] Playing test tone...');
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // audible ping
      gain.gain.value = 0.2; // modest volume
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
      osc.stop(ctx.currentTime + 1.1);
      osc.onended = () => ctx.close();
      console.log('[DebugOverlay] Test tone started');
    } catch (err) {
      console.error('[DebugOverlay] Failed to play test tone', err);
    }
  };

  const getLogLevelClass = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'log-error';
      case 'warn': return 'log-warn';
      case 'info': return 'log-info';
      default: return 'log-log';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className={`debug-overlay ${isMinimized ? 'minimized' : ''}`}>
      <div className="debug-header">
        <div className="debug-title">
          <span>🐛 Debug Console</span>
          <span className="debug-count">{logs.length} logs</span>
        </div>
        <div className="debug-controls">
          <button
            onClick={playTestTone}
            className="debug-button"
            title="Play 1s test tone"
          >
            🎵
          </button>
          <button 
            onClick={clearLogs}
            className="debug-button"
            title="Clear logs"
          >
            🗑️
          </button>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="debug-button"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="debug-button"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      {!isMinimized && (
        <div className="debug-content">
          {logs.length === 0 ? (
            <div className="debug-empty">No logs yet. Interact with the page to see logs.</div>
          ) : (
            <div className="debug-logs">
              {logs.map(log => (
                <div key={log.id} className={`debug-log ${getLogLevelClass(log.level)}`}>
                  <span className="debug-timestamp">{formatTimestamp(log.timestamp)}</span>
                  <span className="debug-level">[{log.level.toUpperCase()}]</span>
                  <span className="debug-message">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

