import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCbwBI1WRZU7x-3h8RInCLkwHU8W78AlUE",
    authDomain: "swapskills-network.firebaseapp.com",
    projectId: "swapskills-network",
    storageBucket: "swapskills-network.appspot.com",
    messagingSenderId: "458732562755",
    appId: "1:458732562755:web:f44e6e9d2dc60995da27f6",
    measurementId: "G-VWPDV52GE1",
};

// 👇 Tekrar başlatmayı önle
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
