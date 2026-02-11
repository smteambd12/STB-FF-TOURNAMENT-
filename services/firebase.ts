
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your actual Firebase configuration provided
const firebaseConfig = {
  apiKey: "AIzaSyAvw_xtxzNK_ZIOIJSgdL4D_L-vuU2cAlo",
  authDomain: "stb-ff.firebaseapp.com",
  projectId: "stb-ff",
  storageBucket: "stb-ff.firebasestorage.app",
  messagingSenderId: "941782488680",
  appId: "1:941782488680:web:9961c1018af4f7b35e4ddd",
  measurementId: "G-Z83J5LH26W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (it requires a browser environment and specific capabilities)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
