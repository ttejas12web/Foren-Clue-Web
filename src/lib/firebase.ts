import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Dynamically use the custom branded domain in production to replace the generic firebaseapp.com on Google Auth screen
const getRuntimeConfig = () => {
  const config = { ...firebaseConfig };
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'forensicspot.com' || hostname === 'www.forensicspot.com') {
      config.authDomain = 'forensicspot.com';
    }
  }
  return config;
};

const app = initializeApp(getRuntimeConfig());
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export let storage: any;
try {
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase Storage is not available. Image uploads will use fallback.");
  storage = null;
}
export const googleProvider = new GoogleAuthProvider();

let cachedAccessToken: string | null = null;
export const getAccessToken = () => cachedAccessToken;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.warn('Firestore Warning: ', JSON.stringify(errInfo));
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log("Sign-in popup closed by user.");
      return null;
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
