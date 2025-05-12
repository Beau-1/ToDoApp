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
                <button onClick={signInWithGoogle} className="google-btn">
                    <img
                        src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                        alt="Sign in with Google"
                        style={{ height: "40px" }}
                    />
                </button>
            </div>
        </div>
    );
}

export default Login;
