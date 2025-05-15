import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { type Auth } from "firebase/auth";
import "./index.css";
import React from "react";

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
        <main className="to-do-list">
            <header>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />

                <h1>To Do</h1>
                <div className="version">Ver. 4.2</div>
            </header>

            <section className="login-container">
                <p className="intro-text">
                    A way to organize your tasks.
                    <br />
                </p>
                <button onClick={signInWithGoogle} className="google-btn">
                    <img
                        src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                        alt="Sign in with Google"
                        style={{ height: "40px" }}
                    />
                </button>
            </section>
        </main>
    );
}

export default Login;
