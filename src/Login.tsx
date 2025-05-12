import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { type Auth } from "firebase/auth";
import "./App.css";
import React, { JSX } from "react";

interface LoginProps {
    auth: Auth;
}

function Login({ auth }: LoginProps): JSX.Element {
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>To Do</h1>
                <p>
                    <button onClick={signInWithGoogle} className="google-btn">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                            alt="Google logo"
                        />
                        Sign in with Google
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
