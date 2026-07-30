import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyDIfgcR22WyF3nAgLIkLRzuGIR1l4D4r3Y",
  authDomain: "magic-paper-71daf.firebaseapp.com",
  projectId: "magic-paper-71daf",
  storageBucket: "magic-paper-71daf.firebasestorage.app",
  messagingSenderId: "785178684195",
  appId: "1:785178684195:web:f14604aa92da84c09cfa96",
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
void setPersistence(auth, browserLocalPersistence);
