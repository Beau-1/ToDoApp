import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";
import "./App.css";
import ToDoList from "./ToDoList";
import Login from "./Login";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.API_KEY || "AIzaSyBBOzhxKc122mUd_wz_KzGPI5i3x7x4LKE",
    authDomain: process.env.AUTH_DOMAIN || "to-do-app-5a99d.firebaseapp.com",
    projectId: process.env.PROJECT_ID || "to-do-app-5a99d",
    storageBucket: process.env.STORAGE_BUCKET || "to-do-app-5a99d.appspot.com",
    messagingSenderId: process.env.MESSAGING_SENDER_ID || "765432115175",
    appId: process.env.APP_ID || "1:765432115175:web:81f091f0ed8972ff411742",
    measurementId: process.env.MEASUREMENT_ID || "G-2PCEMQQ40Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="app">
            {user ? (
                <>
                    <div className="user-header">
                        <div className="user-info">
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                referrerPolicy="no-referrer"
                            />
                            <span>{user.displayName}</span>
                        </div>
                        <button
                            onClick={() => signOut(auth)}
                            className="sign-out-btn">
                            Sign Out
                        </button>
                    </div>
                    <ToDoList db={db} userId={user.uid} />
                </>
            ) : (
                <Login auth={auth} />
            )}
        </div>
    );
}
