import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'idle' | 'countdown' | 'metering' | 'result';

type LeaderboardEntry = {
  name: string;
  magnitude: number;
  title: string;
  timestamp: number;
};

type Result = {
  magnitude: number;
  label: string;
  title: string;
  emoji: string;
};

const STORAGE_KEY = 'burp-richter-scale:leaderboard';
const MAX_SAMPLES = 110;

const bands = [
  { max: 0.9, label: '0.0 — Did you even try?', title: 'The Silent Snack', emoji: '😶' },
  { max: 1.8, label: '1.4 — A polite hiccup in a library', title: 'Baron of Barely', emoji: '🙂' },
  { max: 2.9, label: '2.4 — Detected by nearby biscuits', title: 'The Crumb Disturber', emoji: '😮' },
  { max: 4.1, label: '3.2 — Felt by pets and suspicious curtains', title: 'Count Belchula', emoji: '😲' },
  { max: 5.3, label: '4.8 — Felt by next of kin', title: 'Lord of the Belch', emoji: '😳' },
  { max: 6.5, label: '5.9 — Crockery considering legal action', title: 'The Dining-Room Tremor', emoji: '😵' },
  { max: 7.6, label: '6.8 — Windows rattle, neighbours tut', title: 'Dame Rumblegut', emoji: '🤯' },
  { max: 8.7, label: '8.1 — Tectonic event in the snack aisle', title: 'The Gastric Godzilla', emoji: '🌋' },
  { max: 9.5, label: '9.0 — Structural burp advisory issued', title: 'Commander Aftershock', emoji: '🔥' },
  { max: 10, label: '9.6 — THE BIG ONE — evacuate the building', title: 'The Burpocalypse', emoji: '💥' },
] as const;

const cheekyNames = [
  'Barry McBurpface',
  'Dame Belchington',
  'Sir Burps-a-Lot',
  'The Carbonated One',
  'Professor Windpipe',
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundOne = (value: number) => Math.round(value * 10) / 10;

function bandFor(magnitude: number) {
  return bands.find((band) => magnitude <= band.max) ?? bands[bands.length - 1];
}

function dbToMagnitude(db: number) {
  const floor = -62;
  const ceiling = -7;
  const normalised = clamp((db - floor) / (ceiling - floor), 0, 1);
  return clamp(Math.pow(normalised, 1.35) * 10, 0, 10);
}

function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return parsed
      .filter(
        (entry) =>
          typeof entry.name === 'string' &&
          typeof entry.magnitude === 'number' &&
          typeof entry.title === 'string' &&
          typeof entry.timestamp === 'number',
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Saving a silly score should never break the meter.
  }
}

function polar(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

function arcPath(startAngle: number, endAngle: number, radius: number) {
  const start = polar(startAngle, radius);
  const end = polar(endAngle, radius);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function getAudioContextClass() {
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? audioWindow.webkitAudioContext;
}

function drawWaveform(canvas: HTMLCanvasElement | null, samples: number[]) {
  if (!canvas) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * ratio));
  const height = Math.max(1, Math.floor(rect.height * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#10130f';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = 'rgba(132, 204, 22, 0.16)';
  context.lineWidth = 1 * ratio;

  for (let i = 1; i < 4; i += 1) {
    const y = (height / 4) * i;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (samples.length < 2) {
    return;
  }

  context.strokeStyle = '#bef264';
  context.lineWidth = 2 * ratio;
  context.shadowBlur = 10 * ratio;
  context.shadowColor = 'rgba(190, 242, 100, 0.55)';
  context.beginPath();

  samples.forEach((sample, index) => {
    const x = (index / (MAX_SAMPLES - 1)) * width;
    const y = height - (clamp(sample, 0, 10) / 10) * (height * 0.86) - height * 0.07;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.stroke();
}

function RichterDial({
  magnitude,
  peak,
  armed,
}: {
  magnitude: number;
  peak: number;
  armed: boolean;
}) {
  const startAngle = -135;
  const endAngle = 135;
  const liveAngle = startAngle + (clamp(magnitude, 0, 10) / 10) * (endAngle - startAngle);
  const peakAngle = startAngle + (clamp(peak, 0, 10) / 10) * (endAngle - startAngle);
  const needleAngle = liveAngle;
  const visibleEnd = Math.max(startAngle + 0.01, liveAngle);
  const peakInner = polar(peakAngle, 112);
  const peakOuter = polar(peakAngle, 134);

  return (
    <div className={peak >= 7.5 && armed ? 'dial-wobble' : undefined}>
      <svg
        className="mx-auto block h-auto w-full max-w-[350px]"
        viewBox="-170 -150 340 300"
        role="img"
        aria-label={`Live burp magnitude ${magnitude.toFixed(1)} out of 10`}
      >
        <defs>
          <linearGradient id="richterArc" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="52%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <filter id="needleGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.8" result="colouredBlur" />
            <feMerge>
              <feMergeNode in="colouredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={arcPath(startAngle, endAngle, 122)} stroke="#2f3a24" strokeWidth="18" fill="none" />
        <path
          d={arcPath(startAngle, visibleEnd, 122)}
          stroke="url(#richterArc)"
          strokeLinecap="round"
          strokeWidth="18"
          fill="none"
        />

        {Array.from({ length: 11 }, (_, index) => {
          const angle = startAngle + index * 27;
          const outer = polar(angle, 134);
          const inner = polar(angle, index % 5 === 0 ? 107 : 115);
          const label = polar(angle, 91);
          return (
            <g key={index}>
              <line
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
                stroke={index % 5 === 0 ? '#f7fee7' : '#6b7d55'}
                strokeLinecap="round"
                strokeWidth={index % 5 === 0 ? 3 : 2}
              />
              {index % 5 === 0 ? (
                <text
                  x={label.x}
                  y={label.y + 5}
                  fill="#d9f99d"
                  fontSize="18"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {index}
                </text>
              ) : null}
            </g>
          );
        })}

        <line
          x1={peakInner.x}
          x2={peakOuter.x}
          y1={peakInner.y}
          y2={peakOuter.y}
          stroke="#fef08a"
          strokeLinecap="round"
          strokeWidth="5"
        />

        <g
          className="dial-needle"
          style={{ transform: `rotate(${needleAngle}deg)` }}
          filter="url(#needleGlow)"
        >
          <line x1="0" x2="0" y1="14" y2="-104" stroke="#fb7185" strokeLinecap="round" strokeWidth="7" />
          <line x1="0" x2="0" y1="14" y2="-98" stroke="#ffe4e6" strokeLinecap="round" strokeWidth="2" />
        </g>
        <circle cx="0" cy="0" r="18" fill="#1a2015" stroke="#d9f99d" strokeWidth="5" />

        <text x="0" y="52" fill="#f7fee7" fontSize="42" fontWeight="900" textAnchor="middle">
          {magnitude.toFixed(1)}
        </text>
        <text x="0" y="78" fill="#a3b18a" fontSize="14" fontWeight="700" textAnchor="middle">
          LIVE MAGNITUDE
        </text>
      </svg>
    </div>
  );
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState('3');
  const [liveMagnitude, setLiveMagnitude] = useState(0);
  const [peakMagnitude, setPeakMagnitude] = useState(0);
  const [message, setMessage] = useState('Ready for a geological burp.');
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);
  const [name, setName] = useState(cheekyNames[0]);
  const [saved, setSaved] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const [shake, setShake] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const samplesRef = useRef<number[]>(Array.from({ length: MAX_SAMPLES }, () => 0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const peakRef = useRef(0);
  const smoothDbRef = useRef(-62);
  const quietSinceRef = useRef<number | null>(null);
  const meteringStartedAtRef = useRef(0);
  const demoStartedAtRef = useRef(0);
  const finaliseRef = useRef<(peakOverride?: number) => void>(() => undefined);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const pushMagnitude = useCallback((magnitude: number) => {
    const next = clamp(magnitude, 0, 10);
    setLiveMagnitude(next);

    if (next > peakRef.current) {
      peakRef.current = next;
      setPeakMagnitude(next);
    }

    samplesRef.current = [...samplesRef.current.slice(1), next];
    drawWaveform(canvasRef.current, samplesRef.current);
  }, []);

  const cleanupRun = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (countdownTimerRef.current !== null) {
      window.clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close().catch(() => undefined);
    }
    audioContextRef.current = null;
    quietSinceRef.current = null;
  }, []);

  const resetMeters = useCallback(() => {
    peakRef.current = 0;
    smoothDbRef.current = -62;
    samplesRef.current = Array.from({ length: MAX_SAMPLES }, () => 0);
    setLiveMagnitude(0);
    setPeakMagnitude(0);
    drawWaveform(canvasRef.current, samplesRef.current);
  }, []);

  const finalise = useCallback(
    (peakOverride?: number) => {
      const peak = clamp(peakOverride ?? peakRef.current, 0, 10);
      cleanupRun();
      const magnitude = roundOne(peak);
      const band = bandFor(magnitude);
      const nextResult = {
        magnitude,
        label: band.label,
        title: band.title,
        emoji: band.emoji,
      };

      setResult(nextResult);
      setName(cheekyNames[Math.floor(magnitude) % cheekyNames.length]);
      setSaved(false);
      setShareNotice('');
      setMessage('Result locked. The instruments are pretending to be professional.');
      phaseRef.current = 'result';
      setPhase('result');
      setLiveMagnitude(magnitude);
      setPeakMagnitude(magnitude);

      if (magnitude >= 7.5) {
        setShake(true);
        if (shakeTimerRef.current !== null) {
          window.clearTimeout(shakeTimerRef.current);
        }
        shakeTimerRef.current = window.setTimeout(() => setShake(false), 520);
      }
    },
    [cleanupRun],
  );

  useEffect(() => {
    finaliseRef.current = finalise;
  }, [finalise]);

  const startFrameLoop = useCallback(
    (demo: boolean) => {
      meteringStartedAtRef.current = performance.now();
      demoStartedAtRef.current = performance.now();
      quietSinceRef.current = null;
      phaseRef.current = 'metering';
      setPhase('metering');
      setMessage(demo ? 'Demo burp incoming. Stand well back.' : 'Metering armed. Give it the beans.');

      const data = analyserRef.current ? new Uint8Array(analyserRef.current.fftSize) : null;

      const tick = (time: number) => {
        if (phaseRef.current !== 'metering') {
          return;
        }

        let magnitude = 0;
        if (demo) {
          const elapsed = (time - demoStartedAtRef.current) / 1000;
          const envelope = Math.exp(-Math.pow((elapsed - 1.45) / 0.78, 2));
          const wobble = Math.sin(elapsed * 18) * 0.45 + Math.sin(elapsed * 31) * 0.22;
          magnitude = clamp(envelope * 8.8 + Math.max(0, wobble) + 0.4, 0, 9.3);
          if (elapsed > 4.4) {
            finaliseRef.current(peakRef.current);
            return;
          }
        } else if (analyserRef.current && data) {
          analyserRef.current.getByteTimeDomainData(data);
          let sum = 0;
          for (const sample of data) {
            const centred = (sample - 128) / 128;
            sum += centred * centred;
          }
          const rms = Math.sqrt(sum / data.length);
          const db = 20 * Math.log10(Math.max(rms, 0.00001));
          smoothDbRef.current = smoothDbRef.current * 0.78 + db * 0.22;
          magnitude = dbToMagnitude(smoothDbRef.current);
        }

        pushMagnitude(magnitude);

        const elapsedMetering = time - meteringStartedAtRef.current;
        const settledThreshold = Math.max(1.15, peakRef.current * 0.35);
        if (elapsedMetering > 1100 && peakRef.current > 2.2 && magnitude < settledThreshold) {
          quietSinceRef.current ??= time;
          if (time - quietSinceRef.current > 1050) {
            finaliseRef.current(peakRef.current);
            return;
          }
        } else {
          quietSinceRef.current = null;
        }

        if (elapsedMetering > 9000) {
          finaliseRef.current(peakRef.current);
          return;
        }

        frameRef.current = requestAnimationFrame(tick);
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    [pushMagnitude],
  );

  const beginCountdown = useCallback(
    (demo: boolean) => {
      resetMeters();
      setResult(null);
      setShareNotice('');
      setFallbackMessage('');
      phaseRef.current = 'countdown';
      setPhase('countdown');

      const sequence = ['3', '2', '1', 'BURP!'];
      let index = 0;

      const advance = () => {
        setCountdown(sequence[index]);
        if (index === sequence.length - 1) {
          countdownTimerRef.current = window.setTimeout(() => startFrameLoop(demo), 520);
          return;
        }
        index += 1;
        countdownTimerRef.current = window.setTimeout(advance, 720);
      };

      advance();
    },
    [resetMeters, startFrameLoop],
  );

  const startMic = useCallback(async () => {
    cleanupRun();
    resetMeters();
    setResult(null);
    setSaved(false);
    setShareNotice('');
    setFallbackMessage('');
    setMessage('Warming up the burp seismograph...');

    const AudioContextClass = getAudioContextClass();
    const mediaDevices = navigator.mediaDevices;
    if (!window.isSecureContext || !mediaDevices?.getUserMedia || !AudioContextClass) {
      setMessage('Microphone access is not available here.');
      setFallbackMessage(
        'This needs HTTPS on a phone, or localhost during development. Demo mode uses a fake burp so the whole thing still works.',
      );
      phaseRef.current = 'idle';
      setPhase('idle');
      return;
    }

    try {
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      await audioContext.resume();
      const stream = await mediaDevices.getUserMedia({ audio: true });
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.2;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream;
      analyserRef.current = analyser;
      beginCountdown(false);
    } catch {
      cleanupRun();
      setMessage('The microphone said no.');
      setFallbackMessage(
        'No worries. Demo mode performs a ridiculous fake burp without recording, uploading, or sulking.',
      );
      phaseRef.current = 'idle';
      setPhase('idle');
    }
  }, [beginCountdown, cleanupRun, resetMeters]);

  const startDemo = useCallback(() => {
    cleanupRun();
    setMessage('Demo mode primed.');
    beginCountdown(true);
  }, [beginCountdown, cleanupRun]);

  const stopMetering = useCallback(() => {
    finalise(peakRef.current);
  }, [finalise]);

  const resetApp = useCallback(() => {
    cleanupRun();
    resetMeters();
    phaseRef.current = 'idle';
    setPhase('idle');
    setResult(null);
    setSaved(false);
    setShareNotice('');
    setFallbackMessage('');
    setMessage('Ready for another geological burp.');
  }, [cleanupRun, resetMeters]);

  const saveResult = useCallback(() => {
    if (!result || saved) {
      return;
    }
    const entry = {
      name: name.trim() || 'Anonymous Burper',
      magnitude: result.magnitude,
      title: result.title,
      timestamp: Date.now(),
    };
    const next = [...leaderboard, entry]
      .sort((a, b) => b.magnitude - a.magnitude || b.timestamp - a.timestamp)
      .slice(0, 10);
    setLeaderboard(next);
    saveLeaderboard(next);
    setSaved(true);
  }, [leaderboard, name, result, saved]);

  const clearLeaderboard = useCallback(() => {
    setLeaderboard([]);
    saveLeaderboard([]);
  }, []);

  const shareResult = useCallback(async () => {
    if (!result) {
      return;
    }

    const text = `I scored ${result.magnitude.toFixed(1)} on the Burp Richter Scale — ${result.title}. Beat that:`;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        setShareNotice('Shared.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareNotice('Copied!');
      } else {
        setShareNotice('Copy unavailable in this browser.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setShareNotice('Sharing had a wobble. Try copying from the address bar.');
    }
  }, [result]);

  useEffect(() => {
    drawWaveform(canvasRef.current, samplesRef.current);
    return () => {
      cleanupRun();
      if (shakeTimerRef.current !== null) {
        window.clearTimeout(shakeTimerRef.current);
      }
    };
  }, [cleanupRun]);

  const currentBand = bandFor(result?.magnitude ?? peakMagnitude);
  const isBusy = phase === 'countdown' || phase === 'metering';

  return (
    <main
      className={`min-h-screen overflow-x-hidden bg-[#10130f] px-3 py-4 text-lime-50 sm:px-4 ${
        shake ? 'screen-shake' : ''
      }`}
    >
      <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4">
        <header className="rounded-lg border border-lime-300/20 bg-[#171d12] p-4 shadow-glow">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">On-device burpology</p>
          <h1 className="mt-1 text-4xl font-black leading-none text-lime-50">Burp Richter Scale</h1>
          <p className="mt-3 text-sm leading-6 text-lime-100/80">
            Tap start, allow the mic, then unleash a burp. Audio is measured on your device only:
            no recording, no upload, no nonsense.
          </p>
        </header>

        <section className="rounded-lg border border-lime-300/20 bg-[#151a11] p-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300/75">Richter dial</p>
              <p className="mt-1 text-sm text-lime-100/70">{message}</p>
            </div>
            <div className="min-w-[72px] rounded-md border border-amber-200/30 bg-amber-200/10 px-2 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">Peak</p>
              <p className="text-2xl font-black text-amber-100">{peakMagnitude.toFixed(1)}</p>
            </div>
          </div>

          <div className="relative mt-2">
            <RichterDial magnitude={liveMagnitude} peak={peakMagnitude} armed={phase === 'metering'} />
            {phase === 'countdown' ? (
              <div className="absolute inset-0 grid place-items-center rounded-lg bg-[#10130f]/75 backdrop-blur-sm">
                <div className="result-slam text-center">
                  <p className="text-7xl font-black text-amber-200">{countdown}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-lime-100/80">
                    brace the crockery
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-lime-300/20 bg-[#151a11] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300/75">Seismograph</p>
            <p className="text-xs font-bold text-lime-100/60">live loudness trace</p>
          </div>
          <canvas
            ref={canvasRef}
            className="h-24 w-full rounded-md border border-lime-300/20 bg-[#10130f]"
            aria-label="Live scrolling seismograph waveform"
          />
        </section>

        <section className="rounded-lg border border-lime-300/20 bg-[#171d12] p-3">
          {fallbackMessage ? (
            <div className="mb-3 rounded-md border border-amber-200/30 bg-amber-200/10 p-3 text-sm leading-6 text-amber-50">
              {fallbackMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
            {phase === 'idle' || phase === 'result' ? (
              <button
                className={`min-h-12 rounded-md bg-lime-300 px-4 py-3 text-base font-black text-[#151a11] shadow-glow ${
                  phase === 'idle' ? 'idle-wiggle' : ''
                }`}
                type="button"
                onClick={startMic}
              >
                Start / Allow mic
              </button>
            ) : null}

            {phase === 'metering' ? (
              <button
                className="min-h-12 rounded-md bg-rose-400 px-4 py-3 text-base font-black text-[#151a11]"
                type="button"
                onClick={stopMetering}
              >
                Stop
              </button>
            ) : null}

            <button
              className="min-h-12 rounded-md border border-amber-200/40 bg-amber-200/10 px-4 py-3 text-base font-black text-amber-100"
              type="button"
              onClick={isBusy ? resetApp : startDemo}
            >
              {isBusy ? 'Cancel' : 'Demo fake-burp'}
            </button>
          </div>

          <p className="mt-3 text-sm font-bold leading-6 text-lime-100/75">{currentBand.label}</p>
        </section>

        {result ? (
          <section className="rounded-lg border border-rose-300/25 bg-[#20130f] p-4">
            <div className="grid grid-cols-[78px_1fr] items-center gap-3">
              <div
                className="emoji-pop grid aspect-square place-items-center rounded-md bg-rose-300/10 text-5xl"
                aria-hidden="true"
              >
                <span className="block" style={{ transform: `scale(${1 + result.magnitude / 18})` }}>
                  {result.emoji}
                </span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">Result</p>
                <p className="result-slam text-6xl font-black leading-none text-rose-200">
                  {result.magnitude.toFixed(1)}
                </p>
              </div>
            </div>
            <h2 className="mt-3 text-2xl font-black text-lime-50">{result.title}</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-lime-100/80">{result.label}</p>

            <div className="mt-4 grid gap-2">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-lime-300/75" htmlFor="burper-name">
                Burper name
              </label>
              <input
                id="burper-name"
                className="min-h-12 rounded-md border border-lime-300/20 bg-[#10130f] px-3 text-base font-bold text-lime-50 outline-none focus:border-lime-300"
                value={name}
                maxLength={32}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                <button
                  className="min-h-12 rounded-md bg-lime-300 px-4 py-3 font-black text-[#151a11] disabled:opacity-55"
                  type="button"
                  disabled={saved}
                  onClick={saveResult}
                >
                  {saved ? 'Saved' : 'Save score'}
                </button>
                <button
                  className="min-h-12 rounded-md border border-rose-200/40 bg-rose-200/10 px-4 py-3 font-black text-rose-100"
                  type="button"
                  onClick={shareResult}
                >
                  Share / copy
                </button>
              </div>
              {shareNotice ? <p className="text-sm font-bold text-amber-100">{shareNotice}</p> : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-lime-300/20 bg-[#151a11] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-lime-50">Local leaderboard</h2>
            <button
              className="min-h-11 rounded-md border border-lime-300/20 px-3 text-sm font-black text-lime-100 disabled:opacity-50"
              type="button"
              disabled={leaderboard.length === 0}
              onClick={clearLeaderboard}
            >
              Clear
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-sm leading-6 text-lime-100/70">No legendary burps saved yet.</p>
          ) : (
            <ol className="grid gap-2">
              {leaderboard.map((entry, index) => (
                <li
                  className="grid grid-cols-[34px_1fr_58px] items-center gap-2 rounded-md border border-lime-300/10 bg-[#10130f] p-2"
                  key={`${entry.timestamp}-${entry.name}`}
                >
                  <span className="text-center text-sm font-black text-amber-200">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-lime-50">{entry.name}</span>
                    <span className="block truncate text-xs font-bold text-lime-100/60">{entry.title}</span>
                  </span>
                  <span className="text-right text-xl font-black text-rose-200">{entry.magnitude.toFixed(1)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
