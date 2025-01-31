import { isEqual, once } from 'lodash'
import { useEffect, useState } from 'react'

import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
} from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'

import { UserRecord, UserRecordSchema } from './types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const getFirebaseApp = once(() => {
  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app)

  return { app, analytics }
})

const getFirebaseAuth = once(() => {
  const app = getFirebaseApp().app
  const auth = getAuth(app)
  if (import.meta.env.DEV) {
    connectAuthEmulator(auth, 'http://localhost:9099')
  }
  return auth
})

const getFirebaseFirestore = once(() => {
  const app = getFirebaseApp().app
  const db = getFirestore(app)
  if (import.meta.env.DEV) {
    connectFirestoreEmulator(db, 'localhost', 8080)
  }
  return db
})

export const useFirebaseAuth = () => {
  const auth = getFirebaseAuth()
  const [user, setUser] = useState(auth.currentUser)
  const [loading, setLoading] = useState(true)

  useEffect(() =>
    onAuthStateChanged(auth, (authUser) => {
      if (authUser?.uid !== user?.uid) {
        setUser(authUser)
      }
      if (loading) {
        setLoading(false)
      }
    }),
  )

  return { loading, user }
}

export const useLoginWithGoogle = () => {
  const provider = new GoogleAuthProvider()

  const auth = getFirebaseAuth()
  const loginWithGoogle = () => signInWithRedirect(auth, provider)

  return { loginWithGoogle }
}

export const useLogout = () => {
  const auth = getFirebaseAuth()
  const logout = () => auth.signOut()

  return { logout }
}

const getUserRecord = async (uid: string): Promise<UserRecord | null> => {
  try {
    const db = getFirebaseFirestore()
    const usersCol = collection(db, 'users')
    const docRef = doc(usersCol, uid)
    const docSnap = await getDoc(docRef)
    const userRecord = UserRecordSchema.parse(docSnap.data())

    return docSnap.exists() ? userRecord : null
  } catch (e) {
    console.warn('getUserRcord', e)
    return null
  }
}

const saveUserRecord = async (
  uid: string,
  userRecord: UserRecord,
): Promise<UserRecord> => {
  try {
    const db = getFirebaseFirestore()
    const usersCol = collection(db, 'users')
    const docRef = doc(usersCol, uid)
    await setDoc(docRef, userRecord)

    return userRecord
  } catch (e) {
    console.error('saveUserRecord', e)
    return userRecord
  }
}

export const useUserRecord = (uid: string) => {
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const db = getFirebaseFirestore()
  useEffect(
    () =>
      onSnapshot(doc(db, 'users', uid), (doc) => {
        const updatedUserRecord = UserRecordSchema.parse(doc.data())
        if (!isEqual(updateUserRecord, userRecord)) {
          setUserRecord(updatedUserRecord)
        }
        if (loading) {
          setLoading(false)
        }
      }),
    [uid],
  )

  // For first time user experience (i.e., user record does not exist)
  useEffect(() => {
    getUserRecord(uid).then((userRecord) => {
      setUserRecord(userRecord)
      setLoading(false)
    })
  }, [uid])

  const updateUserRecord = (userRecord: UserRecord) => {
    setUpdating(true)
    saveUserRecord(uid, userRecord).then((userRecord) => {
      setUserRecord(userRecord)
      setUpdating(false)
    })
  }

  return { userRecord, loading, updateUserRecord, updating }
}
