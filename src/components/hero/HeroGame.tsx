import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { pixel, fontPixelDisplay, pixelCorners } from '../../styles/retro';

type LevelKey = 'firstName' | 'lastName' | 'email';
type Phase = 'intro' | 'playing' | 'cleared' | 'gameover' | 'won' | 'message' | 'done';

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEVEL_ORDER: LevelKey[] = ['firstName', 'lastName', 'email'];
const LEVEL_META: Record<LevelKey, { label: string; placeholder: string; title: string }> = {
  firstName: { label: 'First name', placeholder: 'Ada', title: 'LEVEL 1' },
  lastName: { label: 'Last name', placeholder: 'Lovelace', title: 'LEVEL 2' },
  email: { label: 'Email', placeholder: 'you@example.com', title: 'LEVEL 3 - BOSS' },
};

const MAX_MISSED = 3;
// Asteroids fall 25% faster than the original pace.
const ASTEROID_SPEED_MULT = 1.25;

// Client-side email delivery via EmailJS (https://www.emailjs.com/) - no
// backend needed, works on static hosting. Every submission sends TWO
// emails: a short thank-you auto-reply to the visitor, and a notification
// to the site owner with who reached out and what they said. See
// .env.example for the env vars and suggested template copy for each.
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_AUTOREPLY_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_AUTOREPLY_TEMPLATE_ID;
const EMAILJS_NOTIFY_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_NOTIFY_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const OWNER_EMAIL = process.env.REACT_APP_OWNER_EMAIL || 'abinav.binukumar@ontariotechu.net';

const emailjsSendOnce = async (templateId: string, templateParams: Record<string, string>): Promise<void> => {
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!res.ok) {
    throw new Error(`EmailJS request failed (${res.status}): ${await res.text()}`);
  }
};

// EmailJS's Gmail provider occasionally throws a transient "Internal error
// encountered" even when the service/template are fine - retry once after a
// beat before giving up, rather than failing a visitor's message over a blip.
const emailjsSend = async (templateId: string, templateParams: Record<string, string>): Promise<void> => {
  try {
    await emailjsSendOnce(templateId, templateParams);
  } catch (err) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await emailjsSendOnce(templateId, templateParams);
  }
};

const sendMessage = async (values: FormValues): Promise<void> => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_AUTOREPLY_TEMPLATE_ID || !EMAILJS_NOTIFY_TEMPLATE_ID) {
    // eslint-disable-next-line no-console
    console.warn('EmailJS is not configured (see .env.example) - logging instead of sending:', values);
    return;
  }

  const message = values.message.trim() || '(No message left - they just wanted to say hi!)';

  const [autoReply, notify] = await Promise.allSettled([
    emailjsSend(EMAILJS_AUTOREPLY_TEMPLATE_ID, {
      to_email: values.email,
      first_name: values.firstName,
      last_name: values.lastName,
    }),
    emailjsSend(EMAILJS_NOTIFY_TEMPLATE_ID, {
      to_email: OWNER_EMAIL,
      first_name: values.firstName,
      last_name: values.lastName,
      from_email: values.email,
      message,
    }),
  ]);

  // The owner notification is the important one - only fail loudly for that.
  if (notify.status === 'rejected') {
    throw notify.reason;
  }
  if (autoReply.status === 'rejected') {
    // eslint-disable-next-line no-console
    console.warn('Owner was notified, but the auto-reply to the visitor failed:', autoReply.reason);
  }
};

// -- Ship pixel art (also drawn on the hero rocket) --
const SHIP_ROWS = [
  '....K....',
  '...KWK...',
  '..KWWWK..',
  '..KWWWK..',
  '.KWWWWWK.',
  '.KWCCWWK.',
  '.KWCCWWK.',
  '.KWWWWWK.',
  'KWWWWWWWK',
  'KWPWWWPWK',
  'KPWWWWWPK',
  'KWWWWWWWK',
  '..K...K..',
  '..F...F..',
];
const SHIP_COLS = SHIP_ROWS[0].length;
const SHIP_ROW_COUNT = SHIP_ROWS.length;
const SHIP_CELL = 4;
const SHIP_HALF_W = (SHIP_COLS * SHIP_CELL) / 2;
const SHIP_HALF_H = (SHIP_ROW_COUNT * SHIP_CELL) / 2;
const SHIP_RADIUS = 15;

const SHIP_SPEED = 230;
const SHOT_SPEED = 340;
const FIRE_COOLDOWN = 0.16;
const INVINCIBLE_TIME = 1.1;
const BOSS_SHOT_SPEED = 190;
const BOSS_FIRE_COOLDOWN = 1.3;
const BOSS_SHOT_RADIUS = 7;
// Fiery orange-red so the boss's own projectiles read as distinct danger,
// separate from the player's cyan lettered shots and the purple boss body.
const BOSS_SHOT_COLOR = '#ff5b3b';

interface Asteroid {
  id: number;
  x: number;
  y: number;
  vy: number;
  r: number;
  seed: number;
  rotation: number;
  spin: number;
  boss: boolean;
  hp: number;
  maxHp: number;
}

interface Shot {
  id: number;
  x: number;
  y: number;
  rot: number;
  letter: string;
}

// The boss's own projectiles, fired back at the ship - visually distinct
// (fiery orange, no letter) from the player's cyan lettered shots.
interface BossShot {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  vy: number;
  size: number;
}

let uid = 0;
const nextId = () => ++uid;

const jaggedPoints = (seed: number, points = 9) =>
  Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const wobble = 0.72 + (Math.sin(seed * 12.9898 + i * 78.233) * 0.5 + 0.5) * 0.28;
    return { angle, wobble };
  });

// -- styles --

const shakeKeyframes = keyframes`
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5px, 3px); }
  50% { transform: translate(4px, -3px); }
  75% { transform: translate(-3px, -2px); }
`;

const Wrapper = styled.div<{ $shaking: boolean }>`
  width: 100%;
  height: 100%;
  min-height: 50vh;
  position: relative;
  overflow: hidden;
  touch-action: none;

  ${({ $shaking }) =>
    $shaking &&
    css`
      animation: ${shakeKeyframes} 0.3s ease;
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`;

const StyledCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const HUD = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-family: ${fontPixelDisplay};
  font-size: 0.55em;
  color: #fff;
  pointer-events: none;
  z-index: 3;
`;

const LevelTitle = styled.div`
  color: ${pixel.cyan};
  text-shadow: 0 0 6px rgba(242, 193, 78, 0.6);
`;

// HP hearts and the missed-asteroid blips sit side by side on one row so the
// HUD's left column stays a predictable height (the Back button, positioned
// independently, depends on that).
const StatsRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 6px;
`;

const StatGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatLabel = styled.span`
  font-size: 0.8em;
  color: #8c877d;
`;

const BlipRow = styled.div`
  display: flex;
  gap: 4px;
`;

const Heart = styled.span<{ $filled: boolean }>`
  width: 10px;
  height: 10px;
  background: ${({ $filled }) => ($filled ? pixel.purple : 'rgba(255,255,255,0.15)')};
  clip-path: ${pixelCorners(2)};
`;

const MissBlip = styled.span<{ $filled: boolean }>`
  width: 10px;
  height: 10px;
  background: ${({ $filled }) => ($filled ? '#ff4d6d' : 'rgba(255,255,255,0.15)')};
  clip-path: ${pixelCorners(2)};
`;

const AmmoLabel = styled.div`
  color: #fff;
  text-align: right;
`;

const BackButton = styled.button`
  position: absolute;
  top: 52px;
  left: 14px;
  background: rgba(20, 16, 28, 0.6);
  border: 2px solid ${pixel.purpleDark};
  color: #fff;
  font-family: ${fontPixelDisplay};
  font-size: 0.5em;
  padding: 8px 10px;
  cursor: pointer;
  z-index: 6;
  pointer-events: auto;

  &:hover {
    border-color: ${pixel.cyan};
    color: ${pixel.cyan};
  }
`;

const SkipLink = styled.button`
  position: absolute;
  top: 52px;
  right: 14px;
  background: rgba(20, 16, 28, 0.75);
  border: 1px solid #8c877d;
  color: #8c877d;
  font-family: 'RobotoMono', sans-serif;
  font-size: 0.8em;
  padding: 6px 12px;
  cursor: pointer;
  z-index: 5;
  pointer-events: auto;

  &:hover {
    border-color: ${pixel.cyan};
    color: ${pixel.cyan};
  }
`;

const CenterOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  text-align: center;
  background: rgba(10, 8, 12, 0.72);
  z-index: 5;
`;

const OverlayTitle = styled.h3`
  font-family: ${fontPixelDisplay};
  font-size: 1em;
  color: #fff;
  margin: 0;
`;

const bannerPop = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0; }
  40% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
`;

const ClearedBanner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: ${fontPixelDisplay};
  font-size: 1em;
  color: ${pixel.cyan};
  text-shadow: 0 0 10px rgba(242, 193, 78, 0.8);
  z-index: 5;
  pointer-events: none;
  animation: ${bannerPop} 0.4s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const OverlaySub = styled.p`
  color: ${pixel.cyan};
  font-family: 'RobotoMono', sans-serif;
  font-size: 1em;
  margin: 0;
`;

const FieldForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 260px;
`;

const FieldLabel = styled.label`
  color: #8c877d;
  font-family: 'RobotoMono', sans-serif;
  font-size: 0.95em;
  text-align: left;
`;

const TextInput = styled.input`
  background: ${pixel.bg};
  border: 2px solid ${pixel.purpleDark};
  color: #fff;
  padding: 10px 12px;
  font-family: 'RobotoMono', sans-serif;
  font-size: 1em;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${pixel.cyan};
  }
`;

const GameButton = styled.button`
  background: ${pixel.purple};
  border: 2px solid ${pixel.purple};
  color: #fff;
  padding: 10px 18px;
  font-family: ${fontPixelDisplay};
  font-size: 0.65em;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.15s ease;

  &:disabled {
    background: #3a342a;
    border-color: #3a342a;
    color: ${pixel.muted};
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: ${pixel.cyan};
    border-color: ${pixel.cyan};
  }

  &:not(:disabled):active {
    transform: translate(2px, 2px);
  }
`;

const SecondaryButton = styled(GameButton)`
  background: transparent;
  color: #8c877d;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const TouchControls = styled.div`
  position: absolute;
  bottom: 14px;
  left: 14px;
  display: grid;
  grid-template-columns: repeat(3, 34px);
  grid-template-rows: repeat(2, 34px);
  gap: 4px;
  z-index: 4;

  @media (min-width: 900px) {
    display: none;
  }
`;

const DPadButton = styled.button<{ $col: number; $row: number }>`
  grid-column: ${({ $col }) => $col};
  grid-row: ${({ $row }) => $row};
  background: rgba(217, 164, 65, 0.35);
  border: 1px solid ${pixel.purple};
  color: #fff;
  font-size: 0.9em;
  touch-action: none;
`;

const FireButtonTouch = styled.button`
  position: absolute;
  bottom: 20px;
  right: 18px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(242, 193, 78, 0.3);
  border: 2px solid ${pixel.cyan};
  color: #fff;
  font-family: ${fontPixelDisplay};
  font-size: 0.5em;
  z-index: 4;
  touch-action: none;

  @media (min-width: 900px) {
    display: none;
  }
`;

const MessageArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  background: ${pixel.bg};
  border: 2px solid ${pixel.purpleDark};
  color: #fff;
  padding: 10px 12px;
  font-family: 'RobotoMono', sans-serif;
  font-size: 1em;
  resize: vertical;
`;

interface HeroGameProps {
  /** Whether this side of the flip card is currently facing the user. */
  active?: boolean;
  /** Called when the player wants to flip back to the ship logo. */
  onExit?: () => void;
}

const HeroGame: React.FC<HeroGameProps> = ({ active = true, onExit }) => {
  const [level, setLevel] = useState<LevelKey>('firstName');
  const [phase, setPhase] = useState<Phase>('intro');
  const [values, setValues] = useState<FormValues>({ firstName: '', lastName: '', email: '', message: '' });
  const [inputDraft, setInputDraft] = useState('');
  const [hp, setHp] = useState(3);
  const [ammo, setAmmo] = useState(0);
  const [destroyed, setDestroyed] = useState(0);
  const [required, setRequired] = useState(0);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameOverReason, setGameOverReason] = useState<'hit' | 'ammo' | 'missed'>('hit');
  const [shaking, setShaking] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shipRef = useRef({ x: 0, y: 0 });
  const moveKeysRef = useRef(new Set<string>());
  const fireHeldRef = useRef(false);
  const fireCooldownRef = useRef(0);
  const invincibleUntilRef = useRef(0);
  const letterQueueRef = useRef<string[]>([]);
  const ammoRef = useRef(0);
  const hpRef = useRef(3);
  const destroyedRef = useRef(0);
  const requiredRef = useRef(0);
  const missedRef = useRef(0);
  // Guards the level-cleared transition below from firing more than once per
  // level: phaseRef doesn't flip to 'cleared' until React re-renders and its
  // sync effect runs, so the win condition can stay true for a couple more
  // animation frames - each one would otherwise schedule its own 900ms
  // advance-to-next-level timeout, and if two land close enough together the
  // second reads levelRef AFTER the first already advanced it, skipping a level.
  const clearedHandledRef = useRef(false);
  const isBossRef = useRef(false);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const shotsRef = useRef<Shot[]>([]);
  const bossShotsRef = useRef<BossShot[]>([]);
  const bossFireCooldownRef = useRef(BOSS_FIRE_COOLDOWN);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const phaseRef = useRef<Phase>('intro');
  const levelRef = useRef<LevelKey>('firstName');
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (reducedMotion) setSkipped(true);
  }, [reducedMotion]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    if (!active) {
      // Flipping away mid-keypress shouldn't leave the ship drifting/firing.
      moveKeysRef.current.clear();
      fireHeldRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    if (active && phase === 'intro' && !skipped) inputRef.current?.focus();
  }, [phase, level, skipped, active]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 300);
  }, []);

  const spawnExplosion = useCallback((x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.3,
        color,
      });
    }
  }, []);

  const startLevel = useCallback((lvl: LevelKey, value: string) => {
    const frame = frameRef.current;
    const w = frame?.clientWidth || 400;
    const h = frame?.clientHeight || 300;
    const letters = value.toUpperCase().split('').filter((c) => c.trim().length > 0);
    const boss = lvl === 'email';

    asteroidsRef.current = [];
    shotsRef.current = [];
    bossShotsRef.current = [];
    bossFireCooldownRef.current = BOSS_FIRE_COOLDOWN;
    particlesRef.current = [];
    shipRef.current = { x: w / 2, y: h - 40 };
    invincibleUntilRef.current = timeRef.current + 1;
    hpRef.current = 3;
    setHp(3);
    missedRef.current = 0;
    setMissed(0);
    clearedHandledRef.current = false;
    isBossRef.current = boss;

    if (boss) {
      const hpAmount = Math.max(letters.length, 3);
      const ammoAmount = hpAmount + 5;
      letterQueueRef.current = Array.from({ length: ammoAmount }, (_, i) => letters[i % letters.length] ?? '*');
      ammoRef.current = ammoAmount;
      setAmmo(ammoAmount);
      requiredRef.current = 1;
      setRequired(1);
      destroyedRef.current = 0;
      setDestroyed(0);
      setBossMaxHp(hpAmount);
      setBossHp(hpAmount);
      asteroidsRef.current.push({
        id: nextId(),
        x: w / 2,
        y: h * 0.28,
        vy: 0,
        r: Math.min(w, h) * 0.22,
        seed: Math.random() * 1000,
        rotation: 0,
        spin: 0.12,
        boss: true,
        hp: hpAmount,
        maxHp: hpAmount,
      });
    } else {
      const count = Math.min(Math.max(letters.length, 4), 10);
      // A couple of spare shots so a missed asteroid or two isn't an instant
      // "out of ammo" game over on the first two (non-boss) levels.
      const ammoAmount = count + 2;
      letterQueueRef.current = Array.from({ length: ammoAmount }, (_, i) => letters[i % letters.length] ?? '*');
      ammoRef.current = ammoAmount;
      setAmmo(ammoAmount);
      requiredRef.current = count;
      setRequired(count);
      destroyedRef.current = 0;
      setDestroyed(0);
      for (let i = 0; i < count; i++) {
        asteroidsRef.current.push({
          id: nextId(),
          x: Math.random() * w,
          y: -Math.random() * h * 0.6 - 20,
          vy: (45 + Math.random() * 45) * ASTEROID_SPEED_MULT,
          r: 15 + Math.random() * 6,
          seed: Math.random() * 1000,
          rotation: 0,
          spin: (Math.random() - 0.5) * 0.8,
          boss: false,
          hp: 1,
          maxHp: 1,
        });
      }
    }

    setLevel(lvl);
    setPhase('playing');
  }, []);

  const handleIntroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputDraft.trim();
    if (!trimmed) return;
    if (level === 'email' && !EMAIL_RE.test(trimmed)) return;
    setValues((v) => ({ ...v, [level]: trimmed }));
    startLevel(level, trimmed);
  };

  const handleRetry = useCallback(() => {
    startLevel(level, values[level]);
  }, [level, values, startLevel]);

  const handleSkipLevel = useCallback(() => {
    const idx = LEVEL_ORDER.indexOf(level);
    if (idx < LEVEL_ORDER.length - 1) {
      const next = LEVEL_ORDER[idx + 1];
      setLevel(next);
      setInputDraft('');
      setPhase('intro');
    } else {
      setPhase('message');
    }
  }, [level]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await sendMessage(values);
      setPhase('done');
    } catch (err) {
      setSendError('Something went wrong sending that - please try again.');
    } finally {
      setSending(false);
    }
  };

  // Keyboard + touch input wiring
  useEffect(() => {
    const KEY_MAP: Record<string, string> = {
      ArrowLeft: 'left', a: 'left', A: 'left',
      ArrowRight: 'right', d: 'right', D: 'right',
      ArrowUp: 'up', w: 'up', W: 'up',
      ArrowDown: 'down', s: 'down', S: 'down',
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        fireHeldRef.current = true;
      }
      const dir = KEY_MAP[e.key];
      if (dir) {
        e.preventDefault(); // stop arrow/WASD keys from scrolling the page while playing
        moveKeysRef.current.add(dir);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === 'Space') fireHeldRef.current = false;
      const dir = KEY_MAP[e.key];
      if (dir) moveKeysRef.current.delete(dir);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const pressDir = (dir: string, active: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) moveKeysRef.current.add(dir);
    else moveKeysRef.current.delete(dir);
  };

  const pressFire = (active: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fireHeldRef.current = active;
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = frame.clientWidth || 1;
      const h = frame.clientHeight || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: 50 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: 20 + Math.random() * 40,
          size: Math.random() < 0.2 ? 2 : 1,
        }));
      }
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);

    const drawShip = (x: number, y: number, invincible: boolean, flameOn: boolean) => {
      if (invincible && Math.floor(timeRef.current * 10) % 2 === 0) return;
      SHIP_ROWS.forEach((row, ry) => {
        row.split('').forEach((cell, rx) => {
          if (cell === '.') return;
          if (cell === 'F' && !flameOn) return;
          const color = cell === 'F' ? pixel.cyan : cell === 'K' ? pixel.black : cell === 'C' ? pixel.cyan : cell === 'P' ? pixel.purple : pixel.white;
          ctx.fillStyle = color;
          ctx.fillRect(
            x - SHIP_HALF_W + rx * SHIP_CELL,
            y - SHIP_HALF_H + ry * SHIP_CELL,
            SHIP_CELL,
            SHIP_CELL
          );
        });
      });
      ctx.fillStyle = '#fff';
      ctx.font = '7px RobotoMono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('A.B', x, y + SHIP_HALF_H + 10);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!activeRef.current) {
        // Fully pause simulation AND rendering while flipped away (ship logo
        // showing) - otherwise this canvas keeps animating stars/particles
        // at 60fps for nobody, burning CPU alongside the ship logo's own
        // animation the whole time it's not even visible.
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      timeRef.current += dt;
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      const playing = phaseRef.current === 'playing';

      if (playing) {
        // movement
        const keys = moveKeysRef.current;
        let vx = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
        let vy = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
        const mag = Math.hypot(vx, vy) || 1;
        vx = (vx / mag) * SHIP_SPEED;
        vy = (vy / mag) * SHIP_SPEED;
        const ship = shipRef.current;
        ship.x = Math.min(Math.max(ship.x + vx * dt, SHIP_HALF_W), w - SHIP_HALF_W);
        ship.y = Math.min(Math.max(ship.y + vy * dt, h * 0.4), h - SHIP_HALF_H);

        // firing
        fireCooldownRef.current -= dt;
        if (fireHeldRef.current && fireCooldownRef.current <= 0 && letterQueueRef.current.length > 0) {
          const letter = letterQueueRef.current.shift() as string;
          ammoRef.current -= 1;
          setAmmo(ammoRef.current);
          shotsRef.current.push({ id: nextId(), x: ship.x, y: ship.y - SHIP_HALF_H, rot: 0, letter });
          fireCooldownRef.current = FIRE_COOLDOWN;
        }

        // asteroids
        for (const a of asteroidsRef.current) {
          if (a.boss) {
            a.y = h * 0.28 + Math.sin(timeRef.current * 1.2) * 10;
            a.rotation += a.spin * dt;
          } else {
            a.y += a.vy * dt;
            a.rotation += a.spin * dt;
            if (a.y - a.r > h) {
              missedRef.current += 1;
              setMissed(missedRef.current);
              a.y = -20;
              a.x = Math.random() * w;
            }
          }
        }

        // boss fires back
        const boss = asteroidsRef.current.find((a) => a.boss);
        if (boss) {
          bossFireCooldownRef.current -= dt;
          if (bossFireCooldownRef.current <= 0) {
            const dx = ship.x - boss.x;
            const dy = ship.y - boss.y;
            const dist = Math.hypot(dx, dy) || 1;
            bossShotsRef.current.push({
              id: nextId(),
              x: boss.x,
              y: boss.y,
              vx: (dx / dist) * BOSS_SHOT_SPEED,
              vy: (dy / dist) * BOSS_SHOT_SPEED,
            });
            bossFireCooldownRef.current = BOSS_FIRE_COOLDOWN;
          }
        }

        // boss shots: move, check ship collision, cull off-screen
        const bossShotSurvivors: BossShot[] = [];
        for (const bs of bossShotsRef.current) {
          bs.x += bs.vx * dt;
          bs.y += bs.vy * dt;
          let hitShip = false;
          if (
            timeRef.current > invincibleUntilRef.current &&
            Math.hypot(bs.x - ship.x, bs.y - ship.y) < BOSS_SHOT_RADIUS + SHIP_RADIUS
          ) {
            hpRef.current -= 1;
            setHp(Math.max(hpRef.current, 0));
            invincibleUntilRef.current = timeRef.current + INVINCIBLE_TIME;
            triggerShake();
            spawnExplosion(ship.x, ship.y, 10, BOSS_SHOT_COLOR);
            hitShip = true;
          }
          if (!hitShip && bs.x > -30 && bs.x < w + 30 && bs.y > -30 && bs.y < h + 30) {
            bossShotSurvivors.push(bs);
          }
        }
        bossShotsRef.current = bossShotSurvivors;

        // shots
        const survivors: Shot[] = [];
        for (const s of shotsRef.current) {
          s.y -= SHOT_SPEED * dt;
          s.rot += dt * 2.5; // gentle spin - too fast and the letter's unreadable mid-flight
          let hit = false;
          for (const a of asteroidsRef.current) {
            if (Math.hypot(a.x - s.x, a.y - s.y) < a.r) {
              a.hp -= 1;
              spawnExplosion(s.x, s.y, a.boss ? 8 : 6, a.boss ? pixel.purple : pixel.cyan);
              if (a.boss) setBossHp(Math.max(a.hp, 0));
              if (a.hp <= 0) {
                asteroidsRef.current = asteroidsRef.current.filter((x) => x.id !== a.id);
                spawnExplosion(a.x, a.y, a.boss ? 30 : 12, pixel.cyan);
                triggerShake();
                destroyedRef.current += 1;
                setDestroyed(destroyedRef.current);
              }
              hit = true;
              break;
            }
          }
          if (!hit && s.y > -20) survivors.push(s);
        }
        shotsRef.current = survivors;

        // ship collision
        if (timeRef.current > invincibleUntilRef.current) {
          for (const a of asteroidsRef.current) {
            if (Math.hypot(a.x - ship.x, a.y - ship.y) < a.r + SHIP_RADIUS) {
              hpRef.current -= 1;
              setHp(Math.max(hpRef.current, 0));
              invincibleUntilRef.current = timeRef.current + INVINCIBLE_TIME;
              triggerShake();
              spawnExplosion(ship.x, ship.y, 10, pixel.purple);
              if (!a.boss) {
                a.y = -20;
                a.x = Math.random() * w;
              }
              break;
            }
          }
        }

        // particles
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
        for (const p of particlesRef.current) {
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.94;
          p.vy *= 0.94;
        }

        // win/lose checks
        if (hpRef.current <= 0) {
          setGameOverReason('hit');
          setPhase('gameover');
        } else if (missedRef.current >= MAX_MISSED) {
          setGameOverReason('missed');
          setPhase('gameover');
        } else if (
          destroyedRef.current >= requiredRef.current &&
          !clearedHandledRef.current
        ) {
          clearedHandledRef.current = true;
          setPhase('cleared');
          setTimeout(() => {
            const idx = LEVEL_ORDER.indexOf(levelRef.current);
            if (idx < LEVEL_ORDER.length - 1) {
              setLevel(LEVEL_ORDER[idx + 1]);
              setInputDraft('');
              setPhase('intro');
            } else {
              setPhase('won');
              setTimeout(() => setPhase('message'), 1200);
            }
          }, 900);
        } else if (
          ammoRef.current <= 0 &&
          shotsRef.current.length === 0 &&
          destroyedRef.current < requiredRef.current
        ) {
          setGameOverReason('ammo');
          setPhase('gameover');
        }
      }

      // -- draw (always, so the scene is visible during overlays too) --
      ctx.clearRect(0, 0, w, h);

      for (const st of starsRef.current) {
        st.y += st.vy * dt;
        if (st.y > h) {
          st.y = 0;
          st.x = Math.random() * w;
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(st.x, st.y, st.size, st.size);
      }

      for (const a of asteroidsRef.current) {
        const pts = jaggedPoints(a.seed, a.boss ? 14 : 8);
        ctx.beginPath();
        pts.forEach((p, i) => {
          const px = a.x + Math.cos(p.angle + a.rotation) * a.r * p.wobble;
          const py = a.y + Math.sin(p.angle + a.rotation) * a.r * p.wobble;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = a.boss ? 'rgba(217, 164, 65, 0.28)' : 'rgba(242, 193, 78, 0.15)';
        ctx.fill();
        ctx.lineWidth = a.boss ? 3 : 2;
        ctx.strokeStyle = a.boss ? pixel.purple : pixel.cyan;
        ctx.stroke();
      }

      for (const bs of bossShotsRef.current) {
        ctx.save();
        ctx.translate(bs.x, bs.y);
        ctx.rotate(Math.atan2(bs.vy, bs.vx) + Math.PI / 4);
        ctx.fillStyle = BOSS_SHOT_COLOR;
        ctx.shadowColor = BOSS_SHOT_COLOR;
        ctx.shadowBlur = 7;
        ctx.fillRect(-BOSS_SHOT_RADIUS, -BOSS_SHOT_RADIUS, BOSS_SHOT_RADIUS * 2, BOSS_SHOT_RADIUS * 2);
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      ctx.font = 'bold 30px RobotoMono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const s of shotsRef.current) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.fillStyle = pixel.cyan;
        ctx.shadowColor = pixel.cyan;
        ctx.shadowBlur = 6;
        ctx.lineWidth = 3;
        ctx.strokeStyle = pixel.black;
        ctx.strokeText(s.letter, 0, 0);
        ctx.fillText(s.letter, 0, 0);
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      for (const p of particlesRef.current) {
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      if (phaseRef.current === 'playing' || phaseRef.current === 'cleared') {
        const flameOn = Math.floor(timeRef.current * 8) % 2 === 0;
        drawShip(shipRef.current.x, shipRef.current.y, timeRef.current < invincibleUntilRef.current, flameOn);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipped]);

  if (skipped) {
    return (
      <Wrapper $shaking={false}>
        {onExit && <BackButton type="button" onClick={onExit}>‹ Back</BackButton>}
        <CenterOverlay style={{ background: pixel.bg, position: 'relative', inset: 'auto', height: '100%' }}>
          {phase === 'done' ? (
            <DoneText>Message received. I'll get back to you soon!</DoneText>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSending(true);
                setSendError(null);
                try {
                  await sendMessage(values);
                  setPhase('done');
                } catch (err) {
                  setSendError('Something went wrong sending that - please try again.');
                } finally {
                  setSending(false);
                }
              }}
              style={{ textAlign: 'left', width: '100%', maxWidth: 300 }}
            >
              <FieldStack>
                <label>First name</label>
                <TextInput value={values.firstName} onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))} required />
                <label>Last name</label>
                <TextInput value={values.lastName} onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))} required />
                <label>Email</label>
                <TextInput type="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} required />
                <label>Message (optional)</label>
                <MessageArea
                  value={values.message}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                  placeholder="Say hi, or leave this blank"
                />
                <GameButton type="submit" disabled={sending}>{sending ? 'SENDING...' : 'CONFIRM'}</GameButton>
                {sendError && <ErrorText>{sendError}</ErrorText>}
              </FieldStack>
            </form>
          )}
        </CenterOverlay>
      </Wrapper>
    );
  }

  const meta = LEVEL_META[level];

  return (
    <Wrapper $shaking={shaking} ref={frameRef}>
      <StyledCanvas ref={canvasRef} />

      {onExit && <BackButton type="button" onClick={onExit}>‹ Back</BackButton>}

      {(phase === 'playing' || phase === 'cleared' || phase === 'gameover') && (
        <HUD>
          <div>
            <LevelTitle>{meta.title}</LevelTitle>
            <StatsRow>
              <StatGroup>
                <StatLabel>HP</StatLabel>
                <BlipRow>
                  {[0, 1, 2].map((i) => (
                    <Heart key={i} $filled={i < hp} />
                  ))}
                </BlipRow>
              </StatGroup>
              {level !== 'email' && (
                <StatGroup>
                  <StatLabel>MISS</StatLabel>
                  <BlipRow>
                    {[0, 1, 2].map((i) => (
                      <MissBlip key={i} $filled={i < MAX_MISSED - missed} />
                    ))}
                  </BlipRow>
                </StatGroup>
              )}
            </StatsRow>
          </div>
          <AmmoLabel>
            AMMO: {ammo}
            <br />
            {level === 'email' ? `BOSS HP: ${bossHp}/${bossMaxHp}` : `KILLS: ${destroyed}/${required}`}
          </AmmoLabel>
        </HUD>
      )}

      {phase === 'cleared' && (
        <ClearedBanner>LEVEL CLEARED!</ClearedBanner>
      )}

      {phase === 'intro' && (
        <CenterOverlay>
          <OverlayTitle>{meta.title}</OverlayTitle>
          <OverlaySub>
            {level === 'email'
              ? 'A boss asteroid is charging up and fires back (watch for orange shots). Your email becomes ammo (+5 bonus shots).'
              : `Type your ${meta.label.toLowerCase()} to load ammo, then launch.`}
          </OverlaySub>
          <FieldForm onSubmit={handleIntroSubmit}>
            <TextInput
              ref={inputRef}
              type={level === 'email' ? 'email' : 'text'}
              placeholder={meta.placeholder}
              value={inputDraft}
              onChange={(e) => setInputDraft(e.target.value)}
            />
            <ButtonRow>
              <GameButton type="submit" disabled={!inputDraft.trim()}>LAUNCH</GameButton>
              <SecondaryButton type="button" onClick={() => setSkipped(true)}>
                SKIP GAME
              </SecondaryButton>
            </ButtonRow>
          </FieldForm>
          <OverlaySub style={{ fontSize: '0.8em', color: '#8c877d' }}>
            Move: arrow keys / WASD (or the pad below on mobile) - Fire: space / tap FIRE
          </OverlaySub>
          {level === 'firstName' && (
            <OverlaySub style={{ fontSize: '0.75em', color: '#8c877d', marginTop: 4 }}>
              Rules: shoot the asteroids before they pass - 3 hits or 3 misses and it's game over. SKIP GAME works anytime.
            </OverlaySub>
          )}
        </CenterOverlay>
      )}

      {phase === 'gameover' && (
        <CenterOverlay>
          <OverlayTitle>GAME OVER</OverlayTitle>
          <OverlaySub>
            {gameOverReason === 'hit'
              ? 'Your ship took one hit too many.'
              : gameOverReason === 'missed'
              ? 'Too many asteroids slipped past you.'
              : 'Out of ammo before the wave cleared.'}
          </OverlaySub>
          <ButtonRow>
            <GameButton onClick={handleRetry}>RETRY</GameButton>
            <SecondaryButton onClick={handleSkipLevel}>SKIP LEVEL</SecondaryButton>
          </ButtonRow>
        </CenterOverlay>
      )}

      {phase === 'won' && (
        <CenterOverlay>
          <OverlayTitle>CONNECTION ESTABLISHED</OverlayTitle>
        </CenterOverlay>
      )}

      {phase === 'message' && (
        <CenterOverlay>
          <OverlayTitle>Send a Hi!</OverlayTitle>
          <FieldForm onSubmit={handleSend} style={{ maxWidth: 300 }}>
            <FieldLabel>Message (optional)</FieldLabel>
            <MessageArea
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              placeholder="Say hi and let me know what's up... or leave this blank"
              autoFocus
            />
            <GameButton type="submit" disabled={sending}>
              {sending ? 'SENDING...' : 'CONFIRM'}
            </GameButton>
            {sendError && <ErrorText>{sendError}</ErrorText>}
          </FieldForm>
        </CenterOverlay>
      )}

      {phase === 'done' && (
        <CenterOverlay>
          <OverlayTitle>Message received!</OverlayTitle>
          <OverlaySub>I'll get back to you soon.</OverlaySub>
        </CenterOverlay>
      )}

      {active && phase === 'playing' && (
        <>
          <TouchControls>
            <DPadButton $col={2} $row={1} onPointerDown={pressDir('up', true)} onPointerUp={pressDir('up', false)} onPointerLeave={pressDir('up', false)} onPointerCancel={pressDir('up', false)}>^</DPadButton>
            <DPadButton $col={1} $row={2} onPointerDown={pressDir('left', true)} onPointerUp={pressDir('left', false)} onPointerLeave={pressDir('left', false)} onPointerCancel={pressDir('left', false)}>{'<'}</DPadButton>
            <DPadButton $col={3} $row={2} onPointerDown={pressDir('right', true)} onPointerUp={pressDir('right', false)} onPointerLeave={pressDir('right', false)} onPointerCancel={pressDir('right', false)}>{'>'}</DPadButton>
            <DPadButton $col={2} $row={2} onPointerDown={pressDir('down', true)} onPointerUp={pressDir('down', false)} onPointerLeave={pressDir('down', false)} onPointerCancel={pressDir('down', false)}>v</DPadButton>
          </TouchControls>
          <FireButtonTouch onPointerDown={pressFire(true)} onPointerUp={pressFire(false)} onPointerLeave={pressFire(false)} onPointerCancel={pressFire(false)}>
            FIRE
          </FireButtonTouch>
        </>
      )}

      {/* Hidden during 'intro' - that screen already has its own SKIP GAME
          button right next to LAUNCH, so this would just be a confusing duplicate. */}
      {phase !== 'intro' && (
        <SkipLink type="button" onClick={() => setSkipped(true)}>
          SKIP GAME
        </SkipLink>
      )}
    </Wrapper>
  );
};

const FieldStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #8c877d;
  font-family: 'RobotoMono', sans-serif;
`;

const DoneText = styled.p`
  color: ${pixel.cyan};
  font-family: ${fontPixelDisplay};
  font-size: 0.8em;
  line-height: 1.8;
`;

const ErrorText = styled.p`
  color: #ff4d6d;
  font-family: 'RobotoMono', sans-serif;
  font-size: 0.9em;
  margin: 0;
`;

export default HeroGame;
