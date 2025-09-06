import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { useCode } from '../context/CodeContext';

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleLogin() {
    const [user, setUser] = useState(null);
    const { isDarkTheme } = useCode();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
            }
        }

        // Ensure script isn't added multiple times
        if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }
    }, []);

    window.handleCredentialResponse = async (response) => {
        try {
            if (!response.credential) {
                toast.error("Google login failed");
                return;
            }

            const backendResponse = await fetch(`${API_URL}/api/users/google-login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    token: response.credential
                })
            });

            if (!backendResponse.ok) {
                throw new Error("Authentication failed");
            }

            const data = await backendResponse.json();

            // Store auth data
            localStorage.setItem("access_token", data.data.access);
            localStorage.setItem("refresh_token", data.data.refresh);
            localStorage.setItem("user", JSON.stringify({
                email: data.data.user.email,
                image: data.data.user.image,
                first_name: data.data.user.first_name,
                last_name: data.data.user.last_name,
            }));

            // Update user state
            setUser({
                email: data.data.user.email,
                image: data.data.user.image,
                first_name: data.data.user.first_name,
                last_name: data.data.user.last_name,
            });

            toast.success("Successfully logged in");
            window.location.reload();
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error("Login failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        // Clear user state
        setUser(null);

        window.location.reload();
    };

    return (
        <div className={`ml-2 pl-3 border-l ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'}`}>
            {user ? (
                <div className="flex items-center">
                    <button 
                        onClick={handleLogout} 
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                            isDarkTheme 
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Sign out"
                    >
                        <img src={user.image} alt="Profile" className="w-6 h-6 rounded-full" />
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div>
                    <div
                        id="g_id_onload"
                        data-client_id={GOOGLE_CLIENT_ID}
                        data-context="signin"
                        data-ux_mode="popup"
                        data-callback="handleCredentialResponse"
                        data-auto_prompt="false"
                    ></div>
                    <div
                        className={`g_id_signin p-2 rounded-lg transition-all duration-200 ${
                            isDarkTheme 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        data-type="icon"
                        data-shape="circle"
                        data-theme={isDarkTheme ? "filled_black" : "outline"}
                        data-size="medium"
                        title="Sign in with Google"
                    ></div>
                </div>
            )}
        </div>
    );
}

export default GoogleLogin;
