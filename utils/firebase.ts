import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  query,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  writeBatch,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
const { stringify } = require('csv-stringify/sync');

const fetchStats = async () => {
  const keysCollection = collection(db, "keys");
  const q = query(keysCollection, where("license_type", "==", "App_Sumo_5_site"));

  const querySnapshot = await getDocs(q);
  const keys = querySnapshot.docs.map(doc => doc.data());

  const totalKeys = keys.length;
  const activeOneOrMore = keys.filter(key => key.site_1 || key.site_2 || key.site_3 || key.site_4 || key.site_5).length;
  const activeTwoOrMore = keys.filter(key => key.site_2 || key.site_3 || key.site_4 || key.site_5).length;
  const activeThreeOrMore = keys.filter(key => key.site_3 || key.site_4 || key.site_5).length;
  const activeFourOrMore = keys.filter(key => key.site_4 || key.site_5).length;
  const activeFive = keys.filter(key => key.site_5).length;

  return {
    totalKeys,
    activeOneOrMore,
    activeTwoOrMore,
    activeThreeOrMore,
    activeFourOrMore,
    activeFive,
  };
};


const subscribeToStats = (callback: (stats: any) => void) => {
  const keysCollection = collection(db, "keys");
  const q = query(keysCollection, where("license_type", "==", "App_Sumo_5_site"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const keys = snapshot.docs.map(doc => doc.data());
    const totalKeys = keys.length;
    const activeOneOrMore = keys.filter(key => key.site_1).length;
    const activeTwoOrMore = keys.filter(key => key.site_2).length;
    const activeThreeOrMore = keys.filter(key => key.site_3).length;
    const activeFourOrMore = keys.filter(key => key.site_4).length;
    const activeFive = keys.filter(key => key.site_5).length;

    const stats = {
      totalKeys,
      activeOneOrMore,
      activeTwoOrMore,
      activeThreeOrMore,
      activeFourOrMore,
      activeFive,
    };

    callback(stats);
  });

  return unsubscribe;
};
import { signInWithPopup } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebaseConfig';  // adjust your import paths as needed

const signInWithGoogle = async () => {
  try {
    // Begin the sign-in with Google
    const res = await signInWithPopup(auth, googleProvider);

    // Hardcode the placeholder Gmail address you want to query against
    const placeholderEmail = 'whitworth2323@gmail.com';

    // Create the Firestore query using the placeholder email
    const dbQuery = query(
      collection(db, 'owner_logins'),
      where('email', '==', placeholderEmail)
    );

    // Get documents from Firestore matching the placeholder email
    const user = await getDocs(dbQuery);

    // Check if we found a matching user
    if (!user.docs[0]) {
      console.log('No user found');
      auth.signOut();
      return false;
    }

    // For debugging, log the found user's data
    console.log({ docs: user.docs[0].data() });

    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

export default signInWithGoogle;

const logout = async () => {
  try {
    console.log('Logging out');
    await signOut(auth);
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

// async function fetchLicenseKeys(keyIds: string[]) {
//   // Fetch license keys for each keyId
//   const licenseKeysPromises = keyIds.map(async keyId => {
//     const docRef = doc(db, 'keys', keyId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       return docSnap.data().license_key;
//     } else {
//       console.log(`No such document`);
//       return null;
//     }
//   });

//   const licenseKeys = await Promise.all(licenseKeysPromises);

//   // Filter out null values (in case some keys were not found)
//   const filteredLicenseKeys = licenseKeys.filter(key => key !== null);

//   return filteredLicenseKeys;
// }

// async function fetchNewKeys(numKeys: number) {
//   const url = process.env.CLOUD_FUNCTION_URL + '/app/generateKeys';

//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ numKeys }),
//   });
//   const data = await response.json();
//   const keys: string[] = data.keyIds; // Explicitly type keyIds as an array of strings
//   const licenseKeys = await fetchLicenseKeys(keys);
//   return licenseKeys;
// }

// async function generateNKeyAppSumo(
//   n: number,
// ): Promise<{ license_key: string }[]> {
//   let keys: { license_key: string }[] = [];
//   try {
//     // Generate keys
//     const newKeys = await fetchNewKeys(n);

//     for (let i = 0; i < n; i++) {
//       const insertionObject = {
//         date_created: serverTimestamp(),
//         license_key: newKeys[i],
//         license_type: 'App_Sumo_5_site',
//       };

//       keys.push({
//         license_key: insertionObject.license_key,
//       });
//     }

//     const keysToReturn = keys.map(key => {
//       return { license_key: key.license_key };
//     });

//     return keysToReturn;
//   } catch (err) {
//     console.log(err);
//     alert('There was an error generating keys. Please try again.');

//     return [];
//   }
// }

// async function generateNumbersReport() {
//   const keysCollection = collection(db, 'keys');
//   const keysDocs = await getDocs(keysCollection);
//   const keys = keysDocs.docs.map(doc => ({
//     ...doc.data(),
//     date_created: doc.data().date_created.toDate().toLocaleString(),
//     site_1_timestamp: doc.data().site_1_timestamp
//       ? doc.data().site_1_timestamp.toDate().toLocaleString()
//       : '',
//     site_2_timestamp: doc.data().site_2_timestamp
//       ? doc.data().site_2_timestamp.toDate().toLocaleString()
//       : '',
//     site_3_timestamp: doc.data().site_3_timestamp
//       ? doc.data().site_3_timestamp.toDate().toLocaleString()
//       : '',
//     site_4_timestamp: doc.data().site_4_timestamp
//       ? doc.data().site_4_timestamp.toDate().toLocaleString()
//       : '',
//     site_5_timestamp: doc.data().site_5_timestamp
//       ? doc.data().site_5_timestamp.toDate().toLocaleString()
//       : '',
//   }));

//   const columns = [
//     { key: 'license_key', header: 'License Key' },
//     { key: 'date_created', header: 'Date Created' },
//     { key: 'license_type', header: 'License Type' },
//     { key: 'site_1', header: 'Site 1' },
//     { key: 'site_1_timestamp', header: 'Site 1 Timestamp' },
//     { key: 'site_2', header: 'Site 2' },
//     { key: 'site_2_timestamp', header: 'Site 2 Timestamp' },
//     { key: 'site_3', header: 'Site 3' },
//     { key: 'site_3_timestamp', header: 'Site 3 Timestamp' },
//     { key: 'site_4', header: 'Site 4' },
//     { key: 'site_4_timestamp', header: 'Site 4 Timestamp' },
//     { key: 'site_5', header: 'Site 5' },
//     { key: 'site_5_timestamp', header: 'Site 5 Timestamp' },
//   ];

//   const csv = stringify(keys, { header: true, columns: columns });
//   return csv;
// }

async function getAuthObject() {
  return auth;
}

export {
  getAuthObject,
  signInWithGoogle,
  logout,
  fetchStats,
  subscribeToStats,
  auth, 
  db
};
