"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);

    useEffect(() => { 
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/auth/profile');
                setUser(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UseAuth = () => {
    return useContext(AuthContext);
};