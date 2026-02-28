/**
 * Landing Page
 * The public face of DataFlare. Animated hero character "Byte",
 * floating particles, feature cards, and a strong CTA.
 * No external image deps — everything is SVG + CSS.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdFlashOn, MdSecurity, MdSupportAgent, MdArrowForward } from 'react-icons/md';

/* ── Floating background particles ─────────────────────────────────────── */
const Particle = ({ style }) => (
  <div
    className="absolute w-1.5 h-1.5 rounded-full bg-primary/60 particle pointer-events-none"
    style={style}
  />
);

function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    bottom: `${Math.random() * 40}%`,
    animationDuration: `${3 + Math.random() * 5}s`,
    animationDelay: `${Math.random() * 4}s`,
    opacity: 0.4 + Math.random() * 0.6,
  }));
}

/* ── "Byte" — the DataFlare mascot (pure SVG) ──────────────────────────── */
function ByteCharacter() {
  return (
    <div className="relative animate-float flex justify-center">
      {/* Glow ring behind character */}
      <div className="absolute inset-0 m-auto w-48 h-48 rounded-full bg-primary/20 blur-3xl animate-pulse-slow" />

      <svg
        width="220"
        height="260"
        viewBox="0 0 220 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.6)]"
      >
        {/* ── Body ─────────────────────────────────────────────────── */}
        <rect x="68" y="110" width="84" height="90" rx="20" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="2" />

        {/* ── Chest screen (phone display) ─────────────────────────── */}
        <rect x="80" y="122" width="60" height="42" rx="8" fill="#0A0A14" />
        {/* Signal bars on chest */}
        <rect x="88" y="148" width="5" height="10" rx="2" fill="#8B5CF6" />
        <rect x="96" y="143" width="5" height="15" rx="2" fill="#8B5CF6" />
        <rect x="104" y="138" width="5" height="20" rx="2" fill="#8B5CF6" />
        <rect x="112" y="133" width="5" height="25" rx="2" fill="#F59E0B" />
        {/* "4G" label */}
        <text x="122" y="152" fontSize="9" fontWeight="bold" fill="#EC4899" fontFamily="Inter, sans-serif">4G</text>

        {/* ── Head ─────────────────────────────────────────────────── */}
        <rect x="72" y="42" width="76" height="72" rx="24" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="2" />

        {/* ── Eyes (glowing) ───────────────────────────────────────── */}
        <circle cx="96" cy="76" r="10" fill="#0A0A14" />
        <circle cx="124" cy="76" r="10" fill="#0A0A14" />
        {/* Iris */}
        <circle cx="96"  cy="76" r="6" fill="#8B5CF6" />
        <circle cx="124" cy="76" r="6" fill="#8B5CF6" />
        {/* Pupil */}
        <circle cx="97"  cy="75" r="3" fill="#F1F0FF" />
        <circle cx="125" cy="75" r="3" fill="#F1F0FF" />
        {/* Eye shine */}
        <circle cx="98"  cy="74" r="1" fill="white" />
        <circle cx="126" cy="74" r="1" fill="white" />

        {/* ── Smile ────────────────────────────────────────────────── */}
        <path d="M 98 94 Q 110 104 122 94" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* ── Antenna ──────────────────────────────────────────────── */}
        <line x1="110" y1="42" x2="110" y2="20" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="110" cy="16" r="6" fill="#EC4899" />
        {/* Antenna glow rings */}
        <circle cx="110" cy="16" r="10" fill="none" stroke="#EC4899" strokeWidth="1" opacity="0.5" />
        <circle cx="110" cy="16" r="14" fill="none" stroke="#EC4899" strokeWidth="0.5" opacity="0.3" />

        {/* ── Arms ─────────────────────────────────────────────────── */}
        <rect x="36" y="120" width="34" height="16" rx="8" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="1.5" />
        <rect x="150" y="120" width="34" height="16" rx="8" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="1.5" />
        {/* Hands */}
        <circle cx="37"  cy="128" r="8" fill="#2A2A40" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="183" cy="128" r="8" fill="#2A2A40" stroke="#8B5CF6" strokeWidth="1.5" />

        {/* ── Legs ─────────────────────────────────────────────────── */}
        <rect x="82"  y="196" width="22" height="40" rx="10" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="1.5" />
        <rect x="116" y="196" width="22" height="40" rx="10" fill="#1C1C2E" stroke="#8B5CF6" strokeWidth="1.5" />
        {/* Feet */}
        <rect x="76"  y="228" width="30" height="14" rx="7" fill="#8B5CF6" />
        <rect x="114" y="228" width="30" height="14" rx="7" fill="#8B5CF6" />

        {/* ── WiFi waves radiating from body ────────────────────────── */}
        <path d="M 168 90 Q 185 110 168 130" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 178 82 Q 200 110 178 138" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 52 90 Q 35 110 52 130" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 42 82 Q 20 110 42 138" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* ── Data packets floating above (decorative) ─────────────── */}
        <rect x="148" y="48" width="28" height="14" rx="4" fill="#EC4899" opacity="0.8" />
        <text x="152" y="59" fontSize="7" fill="white" fontFamily="monospace">1GB</text>

        <rect x="44" y="55" width="32" height="14" rx="4" fill="#8B5CF6" opacity="0.8" />
        <text x="48" y="66" fontSize="7" fill="white" fontFamily="monospace">5GB</text>
      </svg>

      {/* ── Orbiting dot ────────────────────────────────────────────── */}
      <div className="absolute top-8 right-8 w-3 h-3 bg-secondary rounded-full animate-spin-slow" />
    </div>
  );
}

/* ── Scroll-reveal hook ─────────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ── Feature card ───────────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, delay }) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`card transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-3">
        <Icon size={20} className="text-primary-light" />
      </div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}

/* ── Network badge ──────────────────────────────────────────────────────── */
const NETS = [
  { name: 'MTN',     color: '#FFCC00' },
  { name: 'Airtel',  color: '#FF4444' },
  { name: 'Glo',     color: '#00A651' },
  { name: '9mobile', color: '#00A651' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const particles = generateParticles(18);
  const { ref: featRef, visible: featVisible } = useScrollReveal();

  return (
    <div className="min-h-screen bg-dark overflow-x-hidden">

      {/* ── Animated gradient background orbs ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Floating particles ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              left: p.left,
              bottom: p.bottom,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* ── Top nav ───────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 pb-2 max-w-lg mx-auto">
        <span className="text-xl font-black bg-gradient-brand bg-clip-text text-transparent">
          DataFlare
        </span>
        <Link
          to="/login"
          className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center px-5 pt-8 pb-12 max-w-lg mx-auto text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-6 animate-fade-up">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-primary-light">Live — Buy Data Instantly</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-black leading-tight mb-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Data that hits{' '}
          <span className="bg-gradient-brand bg-clip-text text-transparent">
            different.
          </span>
        </h1>

        <p className="text-gray-400 text-base mb-8 max-w-xs animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Top up MTN, Airtel, Glo & 9mobile data in seconds. Cheapest rates, zero stress.
        </p>

        {/* ── BYTE the mascot ──────────────────────────────────────────── */}
        <div className="my-4 w-full flex justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <ByteCharacter />
        </div>

        {/* Network badges */}
        <div className="flex gap-2 mt-4 mb-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {NETS.map((n) => (
            <div
              key={n.name}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ borderColor: n.color + '55', color: n.color, background: n.color + '11' }}
            >
              {n.name}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <Link to="/register" className="btn-primary text-center flex items-center justify-center gap-2">
            Get Started Free <MdArrowForward size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-center">
            I already have an account
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-12 max-w-lg mx-auto">
        <div ref={featRef} className={`text-center mb-6 transition-all duration-700 ${featVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-2xl font-black text-white">Why DataFlare?</h2>
          <p className="text-gray-400 text-sm mt-1">Built for speed, built for you.</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FeatureCard
            icon={MdFlashOn}
            title="Instant delivery"
            desc="Data hits your phone in under 10 seconds. No waiting, no refreshing."
            delay="0ms"
          />
          <FeatureCard
            icon={MdSecurity}
            title="Safe & secure payments"
            desc="Powered by Paystack. Your money is protected at every step."
            delay="100ms"
          />
          <FeatureCard
            icon={MdSupportAgent}
            title="Earn while you share"
            desc="Refer friends and earn ₦100 bonus for every person who signs up."
            delay="200ms"
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-16 max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-white text-center mb-6">How it works</h2>

        {[
          { step: '1', title: 'Create account', desc: 'Sign up with your phone & email in 30 seconds.' },
          { step: '2', title: 'Fund your wallet', desc: 'Add money via Paystack — card, transfer, USSD.' },
          { step: '3', title: 'Buy data instantly', desc: 'Pick network, pick bundle, enter number. Done.' },
        ].map(({ step, title, desc }, i) => (
          <div key={step} className="flex gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center font-black text-white text-sm">
              {step}
            </div>
            <div className="pt-1">
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 pb-16 max-w-lg mx-auto">
        <div className="card bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 text-center">
          <h2 className="text-xl font-black text-white mb-2">Ready to flare up? 🔥</h2>
          <p className="text-gray-400 text-sm mb-5">Join thousands buying data the smart way.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Create Free Account <MdArrowForward size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 text-xs text-gray-600">
        © 2025 DataFlare · All rights reserved
      </footer>
    </div>
  );
}
