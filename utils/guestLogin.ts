import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// ✅ Step 1: Generate custom guest ID
const generateGuestId = (): string => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit number
    return `G${randomNum}`;
};

// ✅ Step 2: Login as guest and store guestId in Firestore
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

// ✅ Step 3: Fetch guestId if needed elsewhere
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
