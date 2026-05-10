import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_5PppH8E3-rctlkzWPCtGSn1WmySrwQQ",
  authDomain: "tolgadogan-portfolio.firebaseapp.com",
  projectId: "tolgadogan-portfolio",
  storageBucket: "tolgadogan-portfolio.firebasestorage.app",
  messagingSenderId: "962573187166",
  appId: "1:962573187166:web:261d62806ca753b62d9ccf",
  measurementId: "G-S2ZFKPDKQP"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
