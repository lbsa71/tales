import { useCallback, useEffect, useRef, useState } from 'react'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function titleFromSrc(src: string): string {
  const parts = src.replace(/\.wav$/i, '').split('/')
  const file = parts.at(-1) ?? src
  return file
    .replace(/_full$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getSeekBounds(el: HTMLAudioElement): { start: number; end: number } | null {
  if (isFinite(el.duration) && el.duration > 0) {
    return { start: 0, end: el.duration }
  }

  const ranges = el.seekable
  if (ranges.length === 0) return null

  const start = ranges.start(0)
  const end = ranges.end(ranges.length - 1)
  if (!isFinite(start) || !isFinite(end) || end <= start) return null

  return { start, end }
}

function formatTimeLabel(seconds: number): string {
  return isFinite(seconds) ? formatTime(seconds) : '--:--'
}

export function App() {
  const params = new URLSearchParams(window.location.search)
  const src = params.get('src')

  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioSrc = src
    ? /^(https?:)?\/\//i.test(src)
      ? src
      : `../${src.replace(/^\/+/, '')}`
    : null

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) {
      el.play()
    } else {
      el.pause()
    }
  }, [])

  const seek = useCallback((delta: number) => {
    const el = audioRef.current
    if (!el) return

    const bounds = getSeekBounds(el)
    if (!bounds) return

    el.currentTime = Math.max(bounds.start, Math.min(bounds.end, el.currentTime + delta))
    setCurrentTime(el.currentTime)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seek(-15)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seek(15)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, seek])

  if (!src) {
    return (
      <div style={styles.container}>
        <p style={styles.title}>No audio source.</p>
        <p style={styles.hint}>
          Add <code style={styles.code}>?src=stories/continue/audio/en/continue_full.wav</code> to the URL.
        </p>
      </div>
    )
  }

  const seekBounds = audioRef.current ? getSeekBounds(audioRef.current) : null
  const progress =
    seekBounds && seekBounds.end > seekBounds.start
      ? (currentTime - seekBounds.start) / (seekBounds.end - seekBounds.start)
      : duration > 0
        ? currentTime / duration
        : 0

  return (
    <div style={styles.container}>
      <p style={styles.title}>{titleFromSrc(src)}</p>

      <audio
        ref={audioRef}
        src={audioSrc!}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={e => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onDurationChange={e => setDuration((e.target as HTMLAudioElement).duration)}
        onError={() => setError('Could not load audio. Check the src parameter.')}
      />

      {error ? (
        <p style={{ ...styles.hint, color: '#ff6b6b' }}>{error}</p>
      ) : (
        <>
          <div
            style={styles.progressOuter}
            role="progressbar"
            aria-valuenow={Math.round(currentTime)}
            aria-valuemin={Math.round(seekBounds?.start ?? 0)}
            aria-valuemax={Math.round(seekBounds?.end ?? duration)}
            onClick={e => {
              const el = audioRef.current
              if (!el) return

              const bounds = getSeekBounds(el)
              if (!bounds) return

              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
              el.currentTime = bounds.start + ratio * (bounds.end - bounds.start)
              setCurrentTime(el.currentTime)
            }}
          >
            <div style={{ ...styles.progressInner, width: `${progress * 100}%` }} />
          </div>

          <p style={styles.time}>
            {formatTimeLabel(currentTime)} / {formatTimeLabel(seekBounds?.end ?? duration)}
          </p>

          <div style={styles.controls}>
            <button style={styles.seekBtn} onClick={() => seek(-30)} aria-label="Back 30 seconds">
              −30s
            </button>
            <button style={styles.playBtn} onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? '❚❚' : '▶'}
            </button>
            <button style={styles.seekBtn} onClick={() => seek(30)} aria-label="Forward 30 seconds">
              +30s
            </button>
          </div>

          <p style={styles.hint}>
            Space = play/pause · ← → = skip 15s
          </p>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    margin: 0,
    padding: '2rem',
    background: '#1a1a1a',
    color: '#f0f0f0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 600,
    marginBottom: '2rem',
    textAlign: 'center' as const,
    wordBreak: 'break-word' as const,
  },
  progressOuter: {
    width: '100%',
    maxWidth: '600px',
    height: '24px',
    background: '#333',
    borderRadius: '12px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  progressInner: {
    height: '100%',
    background: '#4dabf7',
    borderRadius: '12px',
    transition: 'width 0.3s linear',
    pointerEvents: 'none' as const,
  },
  time: {
    fontSize: 'clamp(1.2rem, 3vw, 2rem)',
    fontVariantNumeric: 'tabular-nums',
    margin: '1rem 0',
  },
  controls: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    margin: '1rem 0',
  },
  playBtn: {
    width: 'clamp(80px, 20vw, 140px)',
    height: 'clamp(80px, 20vw, 140px)',
    borderRadius: '50%',
    border: '3px solid #4dabf7',
    background: 'transparent',
    color: '#4dabf7',
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBtn: {
    padding: 'clamp(0.8rem, 2vw, 1.2rem) clamp(1rem, 3vw, 1.8rem)',
    borderRadius: '12px',
    border: '2px solid #555',
    background: 'transparent',
    color: '#ccc',
    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    cursor: 'pointer',
    fontWeight: 600,
  },
  hint: {
    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
    color: '#888',
    marginTop: '2rem',
  },
  code: {
    background: '#333',
    padding: '0.2em 0.5em',
    borderRadius: '4px',
    fontSize: '0.9em',
    wordBreak: 'break-all' as const,
  },
}
