import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection as per guidelines
async function testConnection() {
  try {
    // Attempting to read a non-existent doc to test connectivity
    await getDocFromServer(doc(db, '_internal', 'connectivity-test'));
    console.log("Firebase connection established");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or connectivity.");
    }
    // Permisison denied is also a valid response from the server, meaning we ARE connected but not authorized.
  }
}
testConnection();
