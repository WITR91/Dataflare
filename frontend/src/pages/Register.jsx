/**
 * Register Page
 * Creates a new account. Accepts referral code from URL param automatically.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    phone: '',
    email: '',
    password: '',
    referralCode: searchParams.get('ref') || '', // auto-fill from referral link
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone || !form.email || !form.password) {
      return toast.error('Phone, email and password are required.');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      toast.success(data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col px-5 max-w-lg mx-auto">

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <Link to="/" className="mt-8 mb-6 w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-white transition-colors relative z-10">
        <MdArrowBack size={20} />
      </Link>

      <div className="relative z-10 flex-1 flex flex-col justify-center pb-16">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Join DataFlare 🔥</h1>
          <p className="text-gray-400 text-sm">Create your account — it's free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Phone Number</label>
            <input
              name="phone"
              type="tel"
              placeholder="08012345678"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="input"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="input pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
              Referral Code <span className="text-gray-600">(optional)</span>
            </label>
            <input
              name="referralCode"
              type="text"
              placeholder="e.g. DF3X9K"
              value={form.referralCode}
              onChange={handleChange}
              className="input uppercase"
              maxLength={8}
            />
          </div>

          {form.referralCode && (
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 rounded-xl px-3 py-2">
              <span className="text-secondary text-sm">🎁</span>
              <span className="text-xs text-secondary-light">Referral bonus will be applied on signup</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-dark-border" />
          <span className="text-xs text-gray-600">or</span>
          <div className="flex-1 h-px bg-dark-border" />
        </div>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light font-semibold hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
