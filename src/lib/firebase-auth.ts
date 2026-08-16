import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBgzIpOUgAEREO5NYg8RF7WFN41JcVRNwE",
  authDomain: "skill2intern.firebaseapp.com",
  databaseURL: "https://skill2intern-default-rtdb.firebaseio.com",
  projectId: "skill2intern",
  storageBucket: "skill2intern.firebasestorage.app",
  messagingSenderId: "151484683735",
  appId: "1:151484683735:web:ab0a2250896e6d2f8d2792",
  measurementId: "G-K7D7SL4VK4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;