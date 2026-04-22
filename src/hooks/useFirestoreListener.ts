import { useEffect, useState } from 'react';
import { firestore } from '../services/firebaseService';
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Query,
} from 'firebase/firestore';

interface UseFirestoreListenerResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for real-time Firestore listening
 * Automatically handles subscription cleanup
 */
export const useFirestoreListener = <T extends DocumentData>(
  collectionName: string,
  queryConstraints?: any[]
): UseFirestoreListenerResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Build the query
      let q: Query<DocumentData>;
      if (queryConstraints && queryConstraints.length > 0) {
        q = query(collection(firestore, collectionName), ...queryConstraints);
      } else {
        q = query(collection(firestore, collectionName));
      }

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const documents: T[] = [];
          snapshot.forEach((doc) => {
            documents.push({
              id: doc.id,
              ...doc.data(),
            } as T);
          });
          setData(documents);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

/**
 * Hook to listen to a specific field with a where condition
 */
export const useFirestoreListenerWhere = <T extends DocumentData>(
  collectionName: string,
  field: string,
  operator: '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any',
  value: any
): UseFirestoreListenerResult<T> => {
  return useFirestoreListener<T>(collectionName, [where(field, operator, value)]);
};
