import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  onSnapshot, 
  getDocFromServer,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Support environment variables (Netlify/Vercel/CI) with fallback to firebase-applet-config.json
const metaEnv = (import.meta as Record<string, any>).env || {};
const resolvedFirebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (firebaseConfig as Record<string, any>)?.projectId || 'asymmetric-question-7fs6l',
  appId: metaEnv.VITE_FIREBASE_APP_ID || (firebaseConfig as Record<string, any>)?.appId || '',
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (firebaseConfig as Record<string, any>)?.apiKey || '',
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (firebaseConfig as Record<string, any>)?.authDomain || '',
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as Record<string, any>)?.firestoreDatabaseId || 'ai-studio-lessonplansaigma-23feae66-d45c-43a1-979c-39b5b6a74d35',
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfig as Record<string, any>)?.storageBucket || '',
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfig as Record<string, any>)?.messagingSenderId || '',
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || (firebaseConfig as Record<string, any>)?.measurementId || '',
  oAuthClientId: metaEnv.VITE_FIREBASE_OAUTH_CLIENT_ID || (firebaseConfig as Record<string, any>)?.oAuthClientId || '',
  recaptchaSiteKey: metaEnv.VITE_FIREBASE_RECAPTCHA_SITE_KEY || (firebaseConfig as Record<string, any>)?.recaptchaSiteKey || '',
};

// Initialize Firebase
const app = initializeApp(resolvedFirebaseConfig);
const firestoreDatabaseId = resolvedFirebaseConfig.firestoreDatabaseId;
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const ADMIN_EMAIL = 'doankientrungai@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
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
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is offline or configuration pending.");
    }
  }
}
testConnection();

export type UserStatus = 'official' | 'trial' | 'blocked';
export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  status: UserStatus;
  role: UserRole;
  generationCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreapprovedUser {
  email: string;
  status: UserStatus;
  notes?: string;
  createdAt: string;
}

/**
 * Sign in with Google (Gmail)
 */
export async function signInWithGoogle(): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const email = (fbUser.email || '').toLowerCase().trim();
    const uid = fbUser.uid;
    const isSystemAdmin = email === ADMIN_EMAIL.toLowerCase();

    const userDocRef = doc(db, 'users', uid);
    let userSnap = null;
    try {
      userSnap = await getDoc(userDocRef);
    } catch (err: unknown) {
      console.warn("Could not fetch user document:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('insufficient permissions')) {
        handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      }
    }

    if (userSnap && userSnap.exists()) {
      const data = userSnap.data() as AppUser;
      
      // Auto-escalate system admin if matching email
      if (isSystemAdmin && (data.role !== 'admin' || data.status !== 'official')) {
        const updatedAdminData: Partial<AppUser> = {
          role: 'admin',
          status: 'official',
          displayName: fbUser.displayName || data.displayName || 'Thầy Đoàn Kiên Trung',
          photoURL: fbUser.photoURL || data.photoURL,
          updatedAt: new Date().toISOString()
        };
        try {
          await updateDoc(userDocRef, updatedAdminData);
          return { ...data, ...updatedAdminData } as AppUser;
        } catch (err: unknown) {
          console.warn("Could not auto-escalate admin in Firestore:", err);
        }
      }

      // Update basic profile details
      const updatePayload: Partial<AppUser> = {
        displayName: fbUser.displayName || data.displayName,
        photoURL: fbUser.photoURL || data.photoURL,
        updatedAt: new Date().toISOString(),
      };
      try {
        await updateDoc(userDocRef, updatePayload);
      } catch (e) {
        console.warn("Could not refresh user profile timestamp:", e);
      }

      return {
        ...data,
        ...updatePayload
      };
    } else {
      // First time sign-in: check if pre-approved by admin
      let initialStatus: UserStatus = 'trial';
      let initialNotes = 'Đăng ký mới qua Gmail Google';

      if (isSystemAdmin) {
        initialStatus = 'official';
        initialNotes = 'Quản trị viên trưởng hệ thống';
      } else {
        try {
          const preDocRef = doc(db, 'preapproved', encodeURIComponent(email));
          const preSnap = await getDoc(preDocRef);
          if (preSnap && preSnap.exists()) {
            const preData = preSnap.data() as PreapprovedUser;
            initialStatus = preData.status || 'official';
            initialNotes = preData.notes || 'Đã được Quản trị viên cấp phép trước';
          }
        } catch (e) {
          console.warn("Could not check preapproved status:", e);
        }
      }

      const newUser: AppUser = {
        uid,
        email,
        displayName: fbUser.displayName || email.split('@')[0] || 'Thầy/Cô',
        photoURL: fbUser.photoURL || '',
        status: initialStatus,
        role: isSystemAdmin ? 'admin' : 'user',
        generationCount: 0,
        notes: initialNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, newUser);
      } catch (err: unknown) {
        console.warn("Could not set user document:", err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
        }
      }

      return newUser;
    }
  } catch (error) {
    console.error("Lỗi đăng nhập Google:", error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to current user profile changes
 */
export function subscribeToUser(
  uid: string,
  onUpdate: (user: AppUser | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}`;
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as AppUser);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      onError?.(error);
      const isOffline = error.message?.includes('client is offline');
      if (!isOffline) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

/**
 * Subscribe to all users (Admin only)
 */
export function subscribeToAllUsers(
  onUpdate: (users: AppUser[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = 'users';
  const usersCollection = collection(db, 'users');
  return onSnapshot(
    usersCollection,
    (snapshot) => {
      const list: AppUser[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as AppUser);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (error) => {
      onError?.(error);
      const isOffline = error.message?.includes('client is offline');
      if (!isOffline) {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

/**
 * Admin: Update user status ('official' | 'trial' | 'blocked')
 */
export async function updateUserStatus(uid: string, status: UserStatus, notes?: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const payload: Partial<AppUser> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      payload.notes = notes;
    }
    await updateDoc(userDocRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin: Update user role ('admin' | 'user')
 */
export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      role,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin: Reset generation count for trial user
 */
export async function resetUserGenerationCount(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      generationCount: 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin: Delete a user record
 */
export async function deleteUserRecord(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * User/App: Increment generation count
 */
export async function incrementUserGenerationCount(uid: string, currentCount: number): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      generationCount: currentCount + 1,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin: Pre-approve or configure an email before the user signs in
 */
export async function preApproveEmail(email: string, status: UserStatus, notes: string = ''): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const path = `preapproved/${encodeURIComponent(cleanEmail)}`;
  try {
    const preDocRef = doc(db, 'preapproved', encodeURIComponent(cleanEmail));
    await setDoc(preDocRef, {
      email: cleanEmail,
      status,
      notes,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
