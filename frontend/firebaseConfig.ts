// @ts-ignore
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAS6dXnZ5KXojNQ8r1P67I31x1ghwVSro",
  authDomain: "aiush-agent.firebaseapp.com",
  projectId: "aiush-agent",
  storageBucket: "aiush-agent.appspot.com", // ✅ FIXED
  messagingSenderId: "208750732322",
  appId: "1:208750732322:web:490501bde4b0b97e89167b",
  measurementId: "G-SJSVJ7ND39"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
