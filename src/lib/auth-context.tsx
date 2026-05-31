"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isConfigured } from "./firebase";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: "user" | "admin";
  membership: "none" | "white" | "yellow" | "pink";
  memberId: string;
  points: number;
  spinsUsed: number;
  spinsResetMonth: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  firebaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

function generateMemberId(): string {
  const prefix = "PAZ";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isConfigured && !!auth;
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  const refreshUserData = async () => {
    if (!user || !db) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch {
      // Firestore not available
    }
  };

  useEffect(() => {
    if (!firebaseReady) return;

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch {
          // Firestore not available
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseReady]);

  const signIn = async (email: string, password: string) => {
    if (!auth || !db) throw new Error("Firebase no configurado");
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, "users", result.user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    if (!auth || !db) throw new Error("Firebase no configurado");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    const newUserData: UserData = {
      uid: result.user.uid,
      email,
      displayName: name,
      phone,
      role: "user",
      membership: "none",
      memberId: generateMemberId(),
      points: 0,
      spinsUsed: 0,
      spinsResetMonth: new Date().toISOString().slice(0, 7),
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", result.user.uid), newUserData);
    setUserData(newUserData);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, firebaseReady: isConfigured, signIn, signUp, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
