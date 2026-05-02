import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth.js';
import './AuthModal.css';

/**
 * AuthModal — sign-in / sign-up overlay.
 *
 * Props:
 *   isOpen      — controls visibility
 *   onClose     — called when the user dismisses the modal (no form submission)
 *   initialMode — 'sign-in' | 'sign-up'  (default: 'sign-in')
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 2.4, 2.5
 */
export default function AuthModal({ isOpen, onClose, initialMode = 'sign-in' }) {
  const { signIn, signUp, signInWithOAuth } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync mode when initialMode prop changes (Requirement 3.6)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset form state whenever the modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setUsername('');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, mode]);

  // Close on Escape key (Requirement 3.5)
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let authError;
      if (mode === 'sign-in') {
        // Requirement 2.2 / 2.4 / 2.5
        authError = await signIn(email, password);
      } else {
        // Requirement 2.1
        authError = await signUp(email, password, username);
      }

      if (authError) {
        // Requirement 2.4: inline error for invalid credentials
        // Requirement 2.5: inline error for network failures
        const msg = authError.message ?? 'Something went wrong. Please try again.';
        setError(
          msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
            ? 'No internet connection. Please check your network and try again.'
            : msg
        );
      } else {
        onClose();
      }
    } catch (err) {
      // Requirement 2.5: catch unexpected network errors
      setError('No internet connection. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Requirement 2.3
    setError(null);
    try {
      await signInWithOAuth('google');
    } catch (err) {
      setError('Could not connect to Google. Please try again.');
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'));
  };

  const isSignUp = mode === 'sign-up';
  const submitLabel = isSignUp ? 'Create account' : 'Sign in';
  const titleLabel = isSignUp ? 'Create account' : 'Sign in';

  return (
    // Requirement 3.1, 3.2: render when isOpen is true
    <div className="auth-modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={titleLabel}>
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">{titleLabel}</h2>
          {/* Requirement 3.5: dismiss without submitting */}
          <button
            className="auth-modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Inline error (Requirements 2.4, 2.5) */}
        {error && (
          <div className="auth-modal-error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Username field — sign-up only */}
          {isSignUp && (
            <div className="auth-modal-field">
              <label className="auth-modal-label" htmlFor="auth-username">
                Username
              </label>
              <input
                id="auth-username"
                className="auth-modal-input"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Email field (Requirement 3.1) */}
          <div className="auth-modal-field">
            <label className="auth-modal-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="auth-modal-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password field (Requirement 3.1) */}
          <div className="auth-modal-field">
            <label className="auth-modal-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="auth-modal-input"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Submit button — disabled while loading (Requirement 3.4) */}
          <button
            className="auth-modal-submit"
            type="submit"
            disabled={loading}
          >
            {loading && <span className="auth-modal-spinner" aria-hidden="true" />}
            {loading ? (isSignUp ? 'Creating account…' : 'Signing in…') : submitLabel}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-modal-divider">or</div>

        {/* Google OAuth button (Requirement 3.2) */}
        <button
          className="auth-modal-google"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {/* Inline Google "G" SVG — no external dependency */}
          <svg className="auth-modal-google-icon" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z"/>
          </svg>
          Continue with Google
        </button>

        {/* Mode toggle (Requirement 3.3) */}
        <div className="auth-modal-toggle">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            className="auth-modal-toggle-btn"
            type="button"
            onClick={toggleMode}
            disabled={loading}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
