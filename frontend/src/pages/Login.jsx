/**
 * Login Page
 * Accepts email or phone number + password.
 * On success, stores token and redirects to dashboard.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return toast.error('Please fill in all fields.');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(data.message);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col px-5 max-w-lg mx-auto">

      {/* Background orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back button */}
      <Link to="/" className="mt-8 mb-6 w-10 h-10 flex items-center justify-center bg-dark-card border border-dark-border rounded-xl text-gray-400 hover:text-white transition-colors relative z-10">
        <MdArrowBack size={20} />
      </Link>

      <div className="relative z-10 flex-1 flex flex-col justify-center pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Welcome back 👋</h1>
          <p className="text-gray-400 text-sm">Sign in to your DataFlare account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Email or Phone</label>
            <input
              name="email"
              type="text"
              placeholder="you@example.com or 08012345678"
              value={form.email}
              onChange={handleChange}
              className="input"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="input pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-dark-border" />
          <span className="text-xs text-gray-600">or</span>
          <div className="flex-1 h-px bg-dark-border" />
        </div>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light font-semibold hover:text-primary transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
