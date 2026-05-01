import { 
  collection, 
  addDoc, 
  updateDoc, 
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  type DocumentData,
  getDoc,
  setDoc,
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // Locations
  async getLocations() {
    const path = 'locations';
    try {
      if (!auth.currentUser) return [];
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async addLocation(data: { name: string, type: string, currentVolume: number, bottleCapacity: number }) {
    const path = 'locations';
    try {
      if (!auth.currentUser) throw new Error("Unauthorized");
      const docRef = await addDoc(collection(db, path), {
        ...data,
        createdBy: auth.currentUser.uid,
        lastResetAt: new Date().toISOString(),
        lastEntryAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateVolume(locationId: string, volume: number, isReset: boolean = false) {
    const path = `locations/${locationId}`;
    try {
      const updateData: any = {
        currentVolume: volume,
        lastEntryAt: new Date().toISOString(),
      };
      if (isReset) {
        updateData.lastResetAt = new Date().toISOString();
      }
      await updateDoc(doc(db, 'locations', locationId), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Usage Logs
  async addLog(locationId: string, volumeRemaining: number, logType: 'daily' | 'weekly', isReplacement: boolean) {
    const path = 'usage_logs';
    try {
      if (!auth.currentUser) throw new Error("Unauthorized");
      
      // Calculate usage since last log for this location
      const lastLogQuery = query(
        collection(db, path), 
        where('locationId', '==', locationId), 
        orderBy('timestamp', 'desc'), 
        limit(1)
      );
      const lastLogSnap = await getDocs(lastLogQuery);
      let usageAmount = 0;
      
      if (!lastLogSnap.empty) {
        const lastLog = lastLogSnap.docs[0].data();
        if (isReplacement) {
          // If replaced, we count usage from old bottle's last measurement down to replacement moment
          // But simpler: just track volume drop. 
          // If we reset, we start fresh.
          usageAmount = lastLog.volumeRemaining; // Remaining was discarded
        } else {
          usageAmount = Math.max(0, lastLog.volumeRemaining - volumeRemaining);
        }
      }

      await addDoc(collection(db, path), {
        locationId,
        volumeRemaining,
        timestamp: serverTimestamp(),
        logType,
        isReplacement,
        usageAmount,
        userId: auth.currentUser.uid
      });

      // Update the location's current volume
      await this.updateVolume(locationId, volumeRemaining, isReplacement);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getLogs(locationId?: string) {
    const path = 'usage_logs';
    try {
      let q = query(collection(db, path), orderBy('timestamp', 'desc'));
      if (locationId) {
        q = query(collection(db, path), where('locationId', '==', locationId), orderBy('timestamp', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
