import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCOIw_56iOSZwMnP1EYSXZOeemV8CyzDZU",
    authDomain: "workorder-engineering.firebaseapp.com",
    projectId: "workorder-engineering",
    storageBucket: "workorder-engineering.firebasestorage.app",
    messagingSenderId: "191505144243",
    appId: "1:191505144243:web:ebce59093f1dfd60d353c6",
};

export const firebaseReady = !firebaseConfig.apiKey.startsWith("GANTI");
export const SEED_MOCK_DATA = false;

export const db = firebaseReady ? getFirestore(initializeApp(firebaseConfig)) : null;