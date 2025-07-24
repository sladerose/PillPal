import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

import { UserProfile } from '../../../types/user';

interface UserContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        setProfile(null);
      } else if (data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      setProfile(null);
    }
  };

  useEffect(() => {
    const getCurrentSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error.message);
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error in getCurrentSession:', err);
      }
    };
    getCurrentSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ session, user, profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 