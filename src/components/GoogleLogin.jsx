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

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse, // Your callback function
                });

                window.google.accounts.id.renderButton(
                    document.getElementById("googleButton"), // Target div
                    {
                        theme: "outline",
                        size: "large",
                        type: "icon" // Ensures only the Google logo appears
                    }
                );
            }
        };

        initializeGoogleSignIn();
    }, []);

    const handleCredentialResponse = async (response) => {
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
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 bg-[#2d2d2d] text-gray-200 border-gray-600 hover:bg-[#3d3d3d] border">
                        Logout
                    </button>
                </div>
            ) : (
                <div>
                    {/* Google's Button (Rendered via JS) */}
                    <div id="googleButton" className="hidden"></div>

                    {/* Custom Button (Manually triggers login) */}
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded-full border bg-[#2d2d2d] hover:bg-[#3d3d3d] border-gray-600"
                        onClick={() => window.google.accounts.id.prompt()} // Triggers login manually
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

export default GoogleLogin;
