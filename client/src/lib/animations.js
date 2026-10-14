// ─── Shared Framer Motion variants & helpers ───────────────────────────────
// All animations use transform + opacity only (GPU-accelerated, no layout thrash)

// ── Page Transitions ────────────────────────────────────────────────────────
export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.22, ease: 'easeIn' } },
};

// ── Fade Up (general cards / sections) ──────────────────────────────────────
export const fadeUp = {
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 20 },
};

export const fadeUpSpring = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 24 },
  },
};

// ── Fade In (simple opacity) ─────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

// ── Slide In From Top ────────────────────────────────────────────────────────
export const slideFromTop = {
  initial: { opacity: 0, y: -32 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 28 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// ── Slide In From Left (sidebar) ─────────────────────────────────────────────
export const slideFromLeft = {
  initial: { opacity: 0, x: -60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// ── Slide In From Right ──────────────────────────────────────────────────────
export const slideFromRight = {
  initial: { opacity: 0, x: 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// ── Stagger Container (parent) ───────────────────────────────────────────────
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// ── Stagger Container Fast (0.07s between children) ─────────────────────────
export const staggerFast = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.0,
    },
  },
};

// ── Stagger Item (child) ─────────────────────────────────────────────────────
export const staggerItem = {
  initial: { opacity: 0, y: 28 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, x: 40, transition: { duration: 0.22 } },
};

// ── Shake (form validation error) ────────────────────────────────────────────
export const shakeVariants = {
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
};

// ── Scale on Hover / Tap (card hover) ────────────────────────────────────────
export const cardHover = {
  rest:  { scale: 1 },
  hover: { scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  tap:   { scale: 0.97 },
};

// ── Button press micro-interaction ───────────────────────────────────────────
export const buttonPress = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.03 },
  transition: { type: 'spring', stiffness: 500, damping: 22 },
};

// ── Pending pulse badge ───────────────────────────────────────────────────────
export const pendingPulse = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [1, 0.75, 1],
    transition: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
  },
};

// ── Dropdown expand/collapse ─────────────────────────────────────────────────
export const dropdownVariants = {
  hidden: { opacity: 0, scaleY: 0.88, y: -8, transformOrigin: 'top' },
  visible: {
    opacity: 1,
    scaleY: 1,
    y: 0,
    transformOrigin: 'top',
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: {
    opacity: 0,
    scaleY: 0.9,
    y: -6,
    transition: { duration: 0.15 },
  },
};

// ── Modal scale-in ────────────────────────────────────────────────────────────
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

export const modalCard = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.18 } },
};

// ── Scroll-reveal (left / right alternating) ─────────────────────────────────
export const revealLeft = {
  initial: { opacity: 0, x: -48 },
  whileInView: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
  viewport: { once: true, amount: 0.2 },
};

export const revealRight = {
  initial: { opacity: 0, x: 48 },
  whileInView: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
  viewport: { once: true, amount: 0.2 },
};

export const revealUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
  viewport: { once: true, amount: 0.2 },
};
