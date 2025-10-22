// UserContext.tsx
import React, { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';
// Import the User type directly from the firebase/auth library
import { User } from 'firebase/auth';

// Define the shape of our context's value with a specific User type
export type UserContextType = {
    user: User | null; // The user can be a Firebase User object or null
    isGuest: boolean;
    setUser: Dispatch<SetStateAction<User | null>>; // Use React's Dispatch type for setters
    setIsGuest: Dispatch<SetStateAction<boolean>>;
};

// Create the context with default values that match the type
const UserContext = createContext<UserContextType | undefined>(undefined);

// The provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use the specific type for the state. Initial state is null.
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);

    return (
        <UserContext.Provider value={{ user, isGuest, setUser, setIsGuest }}>
            {children}
        </UserContext.Provider>
    );
};

// The custom hook for consuming the context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        // This error is helpful for developers. It means they forgot to wrap their component in UserProvider.
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};