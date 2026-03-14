import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

// TODO: Ganti dengan Firebase Config milik Anda
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore
export const db = getFirestore(app);

// Referensi ke collection "todos"
const todosCollection = collection(db, "todos");

/**
 * Mengambil semua data Todo
 * @returns {Promise<Array>} Array dari objek todo
 */
export const getTodos = async () => {
  try {
    const querySnapshot = await getDocs(todosCollection);
    const todos = querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));
    return todos;
  } catch (error) {
    console.error("Error mendapatkan todos: ", error);
    throw error;
  }
};

/**
 * Menambahkan Todo baru
 * @param {string} title - Judul todo
 * @returns {Promise<string>} ID dari dokumen yang baru dibuat
 */
export const addTodo = async (title) => {
  try {
    const docRef = await addDoc(todosCollection, {
      title: title,
      completed: false, // Default status false saat baru dibuat
      createdAt: serverTimestamp() // Menggunakan waktu server dari Firebase
    });
    console.log("Todo berhasil ditambahkan dengan ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menambahkan todo: ", error);
    throw error;
  }
};

/**
 * Mengubah status "completed" (true -> false atau sebaliknya)
 * @param {string} id - ID dokumen Todo
 */
export const toggleTodo = async (id) => {
  try {
    const todoRef = doc(db, "todos", id);
    const todoSnap = await getDoc(todoRef);
    
    if (todoSnap.exists()) {
      const currentStatus = todoSnap.data().completed;
      await updateDoc(todoRef, {
        completed: !currentStatus
      });
      console.log(`Status Todo ${id} berhasil diupdate.`);
    } else {
      console.log(`Todo dengan ID ${id} tidak ditemukan.`);
    }
  } catch (error) {
    console.error("Error mengubah status todo: ", error);
    throw error;
  }
};

/**
 * Menghapus Todo berdasarkan ID
 * @param {string} id - ID dokumen Todo
 */
export const deleteTodo = async (id) => {
  try {
    const todoRef = doc(db, "todos", id);
    await deleteDoc(todoRef);
    console.log(`Todo ${id} berhasil dihapus.`);
  } catch (error) {
    console.error("Error menghapus todo: ", error);
    throw error;
  }
};
