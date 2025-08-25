import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const generateGuestId = (): string => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000); 
    return `G${randomNum}`;
};

export const loginAsGuest = async () => {
    const result = await signInAnonymously(auth);
    const user = result.user;

    const guestId = generateGuestId();

    await setDoc(doc(db, 'guests', user.uid), {
        guestId: guestId,
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
        return docSnap.data().guestId;
    } else {
        return null;
    }
};
