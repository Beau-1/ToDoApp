import { useState, useEffect } from "react";
import { auth, db, type User } from "./firebase";
import { signOut } from "firebase/auth";
import ToDoList from "./ToDoList";
import Login from "./Login";
import "./App.css";

function App(): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="app">
            {user ? (
                <>
                    <div className="user-header">
                        <img
                            src={user.photoURL || ""}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                        />
                        <span>{user.displayName}</span>
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

export default App;
