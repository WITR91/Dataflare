/**
 * Buy Data Page
 * Step-by-step: select network → select bundle → enter phone → confirm
 * URL param ?network=MTN pre-selects a network from the dashboard shortcuts.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import NetworkCard from '../components/NetworkCard';
import BundleCard from '../components/BundleCard';
import Loader from '../components/Loader';

const NETWORKS = ['MTN', 'Airtel', 'Glo', '9mobile'];

export default function BuyData() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1); // 1: network, 2: bundle, 3: phone, 4: success
  const [selectedNetwork, setSelectedNetwork] = useState(searchParams.get('network') || '');
  const [bundles, setBundles] = useState([]);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // Move to step 2 if network pre-selected from URL
  useEffect(() => {
    if (selectedNetwork) {
      fetchBundles(selectedNetwork);
      setStep(2);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBundles = async (network) => {
    setLoadingBundles(true);
    try {
      const { data } = await api.get(`/data/bundles?network=${network}`);
      setBundles(data.bundles);
    } catch {
      toast.error('Could not load bundles.');
    } finally {
      setLoadingBundles(false);
    }
  };

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setSelectedBundle(null);
    fetchBundles(network);
    setStep(2);
  };

  const handleBundleSelect = (bundle) => {
    setSelectedBundle(bundle);
    setStep(3);
  };

  const handlePurchase = async () => {
    if (!phone) return toast.error('Enter the recipient phone number.');

    if (user.walletBalance < selectedBundle.price) {
      toast.error(`Insufficient balance. Fund your wallet first.`);
      return navigate('/wallet');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/data/purchase', {
        bundleId: selectedBundle._id,
        phoneNumber: phone,
      });

      updateUser({ walletBalance: data.walletBalance });
      setReceipt(data);
      setStep(4);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step labels ──────────────────────────────────────────────────────────
  const steps = ['Network', 'Bundle', 'Confirm'];

  return (
    <div className="min-h-screen bg-dark pb-24 max-w-lg mx-auto">

      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center gap-4">
        <button
          onClick={() => step > 1 && step < 4 ? setStep(step - 1) : navigate('/dashboard')}
          className="w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400"
        >
          <MdArrowBack size={20} />
        </button>
        <h1 className="font-black text-xl text-white">Buy Data</h1>
      </div>

      {/* Progress bar (steps 1-3) */}
      {step < 4 && (
        <div className="px-5 mb-6">
          <div className="flex gap-2 mb-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-primary' : 'bg-dark-border'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500">Step {step} of 3 — {steps[step - 1]}</p>
        </div>
      )}

      <div className="px-5">

        {/* ── STEP 1: Select Network ───────────────────────────────────── */}
        {step === 1 && (
          <div className="page-enter">
            <p className="text-gray-400 text-sm mb-4">Which network do you want to buy for?</p>
            <div className="grid grid-cols-2 gap-3">
              {NETWORKS.map((n) => (
                <NetworkCard
                  key={n}
                  network={n}
                  selected={selectedNetwork === n}
                  onClick={handleNetworkSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Select Bundle ────────────────────────────────────── */}
        {step === 2 && (
          <div className="page-enter">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">Choose a data bundle</p>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-primary-light"
              >
                Change network
              </button>
            </div>

            {loadingBundles ? (
              <Loader />
            ) : bundles.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500 text-sm">No bundles available for {selectedNetwork}.</p>
                <p className="text-xs text-gray-600 mt-1">Check back later or contact support.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bundles.map((b) => (
                  <BundleCard
                    key={b._id}
                    bundle={b}
                    selected={selectedBundle?._id === b._id}
                    onClick={handleBundleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Enter Phone & Confirm ───────────────────────────── */}
        {step === 3 && selectedBundle && (
          <div className="page-enter space-y-4">

            {/* Bundle summary */}
            <div className="card bg-primary/10 border-primary/30">
              <p className="text-xs text-gray-400 mb-1">Selected bundle</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{selectedNetwork} {selectedBundle.name}</p>
                  <p className="text-xs text-gray-400">{selectedBundle.validity}</p>
                </div>
                <span className="text-secondary font-black text-lg">₦{selectedBundle.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                Recipient Phone Number
              </label>
              <input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                maxLength={11}
              />
              <p className="text-xs text-gray-600 mt-1">Data will be sent to this number</p>
            </div>

            {/* Wallet balance check */}
            <div className="card">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Your wallet balance</span>
                <span className={`font-bold text-sm ${user.walletBalance >= selectedBundle.price ? 'text-green-400' : 'text-red-400'}`}>
                  ₦{user.walletBalance.toLocaleString()}
                </span>
              </div>
              {user.walletBalance < selectedBundle.price && (
                <p className="text-xs text-red-400 mt-2">
                  Insufficient balance. You need ₦{(selectedBundle.price - user.walletBalance).toLocaleString()} more.
                </p>
              )}
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading || !phone}
              className="btn-primary w-full"
            >
              {loading ? 'Processing…' : `Pay ₦${selectedBundle.price.toLocaleString()} & Send Data`}
            </button>
          </div>
        )}

        {/* ── STEP 4: Success ─────────────────────────────────────────── */}
        {step === 4 && receipt && (
          <div className="page-enter text-center pt-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <MdCheckCircle size={44} className="text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Data Sent! 🎉</h2>
            <p className="text-gray-400 text-sm mb-6">{receipt.message}</p>

            {/* Receipt card */}
            <div className="card text-left space-y-3 mb-6">
              {[
                ['Network', receipt.transaction?.network],
                ['Bundle', receipt.transaction?.dataBundle],
                ['Sent to', receipt.transaction?.phoneNumber],
                ['Amount', `₦${receipt.transaction?.amount?.toLocaleString()}`],
                ['New Balance', `₦${receipt.walletBalance?.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-gray-500">{k}</span>
                  <span className="text-xs font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setSelectedBundle(null); setPhone(''); }} className="btn-secondary flex-1">
                Buy Again
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
