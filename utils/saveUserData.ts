// utils/saveUserData.ts
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Your Firestore instance

interface UserData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    middleInitial?: string;
    gender: string;
    userType: string;
    age: number;
    contactNumber: string;
    createdAt: string;
}

export const saveUserData = async (userData: UserData) => {
    if (!userData) return;

    const userDoc = {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleInitial: userData.middleInitial || "", // Optional field
        gender: userData.gender,
        userType: userData.userType,
        age: userData.age,
        contactNumber: userData.contactNumber,
        createdAt: new Date().toISOString(),
    };

    try {
        await setDoc(doc(db, "users", userData.uid), userDoc);
        console.log("User data saved successfully.");
    } catch (error) {
        console.error("Error saving user data: ", error);
    }
};
