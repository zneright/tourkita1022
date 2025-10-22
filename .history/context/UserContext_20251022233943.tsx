// UserContext.tsx
import React, { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';
// Import the User type directly from the firebase/auth library
import { User } from 'firebase/auth';

// Define the shape of our context's value with a specific User type
export type UserContextType = {
    user: User | null; // The user can be a Firebase User object or null
    isGuest: boolean;
    setUser: Dispatch<SetStateAction<User | null>>; 
    setIsGuest: Dispatch<SetStateAction<boolean>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    return (
        <UserContext.Provider value={{ user, isGuest, setUser, setIsGuest }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
     
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};