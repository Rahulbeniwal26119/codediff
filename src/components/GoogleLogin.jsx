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
                body: JSON.stringify({ token: response.credential }),
            });

            if (!backendResponse.ok) {
                toast.error("Google login failed");
                return;
            }

            const data = await backendResponse.json();
            data = data.data;

            localStorage.setItem("access_token", data.access || data.token);
            localStorage.setItem("user", JSON.stringify(data.user || data));
            setUser(data.user || data);

            toast.success("Google login successful");
        } catch (error) {
            console.error("Google login error:", error);
            toast.error("Google login failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Logged out successfully");
        window.location.reload();
    };

    return (
        <div className="auth-container">
            {user ? (
                <div className="flex items-center space-x-2">
                    <img src={user.picture || user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{user.name}</span>
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
                    <div 
                        className="g_id_signin" 
                        data-type="icon"
                        data-shape="circle"
                        data-theme="filled_black"
                        data-size="large"
                    ></div>
                </>
            )}
        </div>
    );
}

export default GoogleLogin;
