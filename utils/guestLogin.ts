import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const loginAsGuest = async () => {
    const result = await signInAnonymously(auth);
    const user = result.user;

    await setDoc(doc(db, 'guests', user.uid), {
        createdAt: serverTimestamp(),
        isGuest: true,

    });

    return user;
};

export const fetchGuestId = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    const docRef = doc(db, 'guests', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return uid;
    } else {
        return null;
    }
};
