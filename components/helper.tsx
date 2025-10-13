import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const setActiveStatus = async (uid: string, status: boolean) => {
    try {
        await setDoc(doc(db, "users", uid), { activeStatus: status }, { merge: true });
    } catch (error) {
        console.log("Error updating activeStatus:", error);
    }
};
