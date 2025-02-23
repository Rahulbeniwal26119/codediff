import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL;

function GoogleLogin() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
            }
        }

        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);

        window.onload = () => {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById("google-login-button"),
                {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                }
            )
        }

        return () => {
            document.body.removeChild(script);
        }
    }, [])

    const handleCredentialResponse = async (response) => {
        try {
            if (!response.credential) {
                toast.error("Google login failed");
                return;
            }

            const decodedToken = jwtDecode(response.credential);

            // create user in database
            const backendResponse = await fetch(`${API_URL}/api/users/google-login/`, {
                method: "POST",
                headers: {
                    "Contect-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    token: response.credential,
                })
            });

            if (!backendResponse.ok) {
                toast.error("Google login failed");
            }

            const data = await backendResponse.json();

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
    }

    const renderAuthContect = () => {
        if (user) {
            return (
                <div className="flex items-center space-x-2">
                    <img src={user.picture || user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
                </div>
            )
        }

        return (
            <div id="google-login-button"></div>
        )
    }

    return (
        <div>
            {renderAuthContect()}
        </div>
    )
};

export default GoogleLogin;