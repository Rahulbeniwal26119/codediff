import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleLogin() {
    const [user, setUser] = useState(null);

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

            const decodedToken = jwtDecode(response.credential);

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
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error("Login failed");
        }
    };

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        // Clear user state
        setUser(null);

        window.location.reload();
    };

    return (
        <div className="auth-container">
            {user ? (
                <div className="flex items-center space-x-2">
                    <img src={user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                    <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                        Logout
                    </button>
                </div>
            ) : (
                <>
                    <div 
                        id="g_id_onload"
                        data-client_id={GOOGLE_CLIENT_ID}
                        data-context="signin"
                        data-ux_mode="popup"
                        data-callback="handleCredentialResponse"
                    ></div>
                    <button 
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            {/* Google icon path */}
                        </svg>
                        Login
                    </button>
                </>
            )}
        </div>
    );
}

export default GoogleLogin;
