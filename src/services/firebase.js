import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyCTBZSyIrcoSrwfDrZS5fzpSotKsF_kXSk",
  authDomain: "traks-app-a1993.firebaseapp.com",
  projectId: "traks-app-a1993",
  storageBucket: "traks-app-a1993.firebasestorage.app",
  messagingSenderId: "127247826290",
  appId: "1:127247826290:web:f729aa5eec033b6ed9b1eb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 1. Sign In Function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore, if not, create the skeleton
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isVerified: false, // <--- THE GATE KEEPER
        joinedAt: serverTimestamp(),
        bvnSimulation: "12345678901", // Simulating a default BVN for the hackathon
      });
    }
  } catch (error) {
    console.error("Error signing in", error);
  }
};

// 2. Sign Out
export const logout = () => signOut(auth);
