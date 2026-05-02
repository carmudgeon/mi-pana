import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/**
 * AuthContext — provides Supabase session state and auth actions to the entire
 * component tree.
 *
 * Exposed value shape:
 *   session         — Supabase Session object or null
 *   user            — shorthand for session?.user ?? null
 *   isLoading       — true during the initial getSession() check
 *   signIn          — (email, password) => Promise<AuthError | null>
 *   signUp          — (email, password, username) => Promise<AuthError | null>
 *   signOut         — () => Promise<void>
 *   signInWithOAuth — (provider) => Promise<void>
 */

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Ensure a profile row exists for the given user.
   * Uses upsert with ignoreDuplicates so it's safe to call on every sign-in.
   * This guards against the FK violation on `collections.user_id` that occurs
   * when the DB trigger hasn't fired yet (e.g. email confirmation pending).
   */
  const ensureProfile = async (user) => {
    if (!user) return;
    const username =
      user.user_metadata?.username ??
      user.email?.split('@')[0] ??
      'user';
    await supabase
      .from('profiles')
      .upsert({ id: user.id, username }, { onConflict: 'id', ignoreDuplicates: true });
  };

  useEffect(() => {
    // 1. Fetch the current session on mount (Requirement 2.8)
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        await ensureProfile(currentSession.user);
      }
      setSession(currentSession ?? null);
      setIsLoading(false);
    });

    // 2. Subscribe to auth state changes (Requirement 2.9)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
          setSession(null);
          return;
        }

        if (newSession) {
          // Set session immediately so the modal closes and the UI unblocks.
          // ensureProfile runs in the background — useSupabaseSync will retry
          // on any FK error from the first upsert attempt.
          setSession(newSession);
          ensureProfile(newSession.user).catch(console.error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password (Requirement 2.2).
   * Returns the AuthError on failure, or null on success.
   */
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ?? null;
  };

  /**
   * Sign up with email, password, and username (Requirement 2.1).
   * The profile row is created automatically by the `on_auth_user_created`
   * database trigger (migration 003), which runs as SECURITY DEFINER and
   * therefore bypasses RLS. Passing username in user_metadata lets the
   * trigger use it instead of deriving one from the email address.
   * Returns the AuthError on failure, or null on success.
   */
  const signUp = async (email, password, username) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    return error ?? null;
  };

  /**
   * Sign out the current user (Requirement 2.6).
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire SIGNED_OUT and clear session
  };

  /**
   * Sign in with an OAuth provider (Requirement 2.3).
   * Currently supports 'google'.
   */
  const signInWithOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Throws if used outside of AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
