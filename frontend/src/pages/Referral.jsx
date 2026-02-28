/**
 * Referral Page
 * Shows the user's referral code, copy button, WhatsApp share,
 * and their referral stats (count + total bonus earned).
 */

import React, { useState } from 'react';
import { MdContentCopy, MdCheck, MdShare, MdPeople, MdStar } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function Referral() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referralCode || '');
    toast.success('Code copied!');
  };

  const whatsappText = encodeURIComponent(
    `Hey! I've been using DataFlare to buy cheap mobile data instantly. Sign up with my link and we both benefit! 🔥\n\n${referralLink}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="min-h-screen bg-dark pb-24 max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <h1 className="font-black text-2xl text-white">Refer & Earn</h1>
        <p className="text-gray-400 text-sm mt-1">Earn ₦100 for every friend you invite</p>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        <div className="card text-center">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <MdPeople size={20} className="text-primary-light" />
          </div>
          <p className="text-2xl font-black text-white">{user?.referralCount ?? 0}</p>
          <p className="text-xs text-gray-400">Friends invited</p>
        </div>
        <div className="card text-center">
          <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <MdStar size={20} className="text-secondary" />
          </div>
          <p className="text-2xl font-black text-secondary">₦{(user?.referralBonus ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400">Bonus earned</p>
        </div>
      </div>

      <div className="px-5 space-y-4">

        {/* Referral code */}
        <div className="card">
          <p className="text-xs text-gray-400 mb-2 font-medium">Your Referral Code</p>
          <div className="flex items-center justify-between bg-dark-light rounded-xl px-4 py-3">
            <span className="font-black text-xl tracking-widest text-primary-light">
              {user?.referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <MdContentCopy size={18} />
            </button>
          </div>
        </div>

        {/* Referral link */}
        <div className="card">
          <p className="text-xs text-gray-400 mb-2 font-medium">Your Referral Link</p>
          <div className="bg-dark-light rounded-xl px-4 py-3 mb-3">
            <p className="text-xs text-gray-300 break-all">{referralLink}</p>
          </div>

          <div className="flex gap-3">
            {/* Copy link */}
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                copied
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-dark-light border border-dark-border text-gray-300'
              }`}
            >
              {copied ? <MdCheck size={16} /> : <MdContentCopy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {/* WhatsApp share */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-green-500/20 text-green-400 border border-green-500/30 active:scale-95 transition-all"
            >
              <FaWhatsapp size={16} />
              Share on WhatsApp
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="card">
          <h3 className="font-bold text-white mb-4">How referrals work</h3>
          {[
            { n: '1', text: 'Share your referral link or code with friends' },
            { n: '2', text: 'Friend signs up using your link' },
            { n: '3', text: 'You instantly get ₦100 added to your wallet' },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary-light flex-shrink-0">
                {n}
              </div>
              <p className="text-sm text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
