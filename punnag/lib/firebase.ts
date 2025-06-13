import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { getDatabase, ref, set, get, push, onValue, off, remove } from "firebase/database"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxT3GUMlnMXPEhZ_8jNM9shmjLNUKjPRw",
  authDomain: "punnagweb.firebaseapp.com",
  databaseURL: "https://punnagweb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "punnagweb",
  storageBucket: "punnagweb.firebasestorage.app",
  messagingSenderId: "918248804920",
  appId: "1:918248804920:web:3afc25c0958d62ce880ccd",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const database = getDatabase(app)

// Auth functions
export const registerUser = async (email: string, password: string, username: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Save additional user info to the database
    await set(ref(database, `users/${user.uid}`), {
      username,
      email,
      createdAt: new Date().toISOString(),
    })

    return { user }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// User data functions
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = ref(database, `users/${userId}`)
    const snapshot = await get(userRef)

    if (snapshot.exists()) {
      const profileData = snapshot.val();
      console.log('[getUserProfile] Raw profile data from Firebase:', profileData);
      return { profile: profileData }
    } else {
      console.log('[getUserProfile] Profile snapshot does not exist for userId:', userId);
      return { error: "User profile not found" }
    }
  } catch (error: any) {
    console.error('[getUserProfile] Error fetching profile for userId:', userId, error);
    return { error: error.message }
  }
}

// Dream functions
export const saveDream = async (
  userId: string,
  dreamData: {
    title: string
    description?: string
    image: string // base64
    additionalImages?: string[] // For comic strips
    prompt: string
    mood: string
    style: string
    complexity: number
    isComic?: boolean
    createdAt: string
  },
) => {
  try {
    const dreamRef = push(ref(database, `users/${userId}/dreams`))
    await set(dreamRef, dreamData)
    return { dreamId: dreamRef.key }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getUserDreams = async (userId: string) => {
  try {
    const dreamsRef = ref(database, `users/${userId}/dreams`)
    const snapshot = await get(dreamsRef)

    if (snapshot.exists()) {
      const dreams = snapshot.val()
      return {
        dreams: Object.keys(dreams).map((key) => ({
          id: key,
          ...dreams[key],
        })),
      }
    } else {
      return { dreams: [] }
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getAllDreams = async () => {
  try {
    const usersRef = ref(database, "users")
    const snapshot = await get(usersRef)

    if (snapshot.exists()) {
      const users = snapshot.val()
      let allDreams: any[] = []

      Object.keys(users).forEach((userId) => {
        if (users[userId].dreams) {
          const userDreams = Object.keys(users[userId].dreams).map((dreamId) => ({
            id: dreamId,
            userId,
            username: users[userId].username,
            ...users[userId].dreams[dreamId],
          }))
          allDreams = [...allDreams, ...userDreams]
        }
      })

      // Sort by creation date (newest first)
      allDreams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return { dreams: allDreams }
    } else {
      return { dreams: [] }
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Chat/story functions
export const saveChat = async (
  userId: string,
  chatData: {
    messages: Array<{
      content: string
      sender: "user" | "ai"
      timestamp: string
    }>
    title: string
    createdAt: string
    updatedAt: string
  },
) => {
  try {
    const chatRef = push(ref(database, `users/${userId}/chats`))
    await set(chatRef, chatData)
    return { chatId: chatRef.key }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getUserChats = async (userId: string) => {
  try {
    const chatsRef = ref(database, `users/${userId}/chats`)
    const snapshot = await get(chatsRef)

    if (snapshot.exists()) {
      const chats = snapshot.val()
      return {
        chats: Object.keys(chats).map((key) => ({
          id: key,
          ...chats[key],
        })),
      }
    } else {
      return { chats: [] }
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export { auth, database, ref, onValue, off, push, set, remove }
