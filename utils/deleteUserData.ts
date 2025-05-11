import { getFirestore, doc, deleteDoc } from "firebase/firestore";

export const deleteUserData = async (uid: string) => {
    const db = getFirestore();
    try {
        await deleteDoc(doc(db, "users", uid)); // Adjust collection name as needed
        console.log("User data deleted from Firestore.");
    } catch (error) {
        console.error("Failed to delete user data:", error);
    }
};
