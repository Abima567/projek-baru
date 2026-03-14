import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db, addTodo, toggleTodo, deleteTodo } from "./firebase";
import "./App.css";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  // Mengatur Realtime Listener ke Firestore
  useEffect(() => {
    // Membuat query untuk mengurutkan Todo berdasarkan waktu pembuatan (terbaru di atas)
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const todosArr = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(todosArr);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching realtime data: ", error);
        setLoading(false);
      }
    );

    // Membersihkan listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim() === "") return;
    try {
      await addTodo(newTodo);
      setNewTodo("");
    } catch (error) {
      console.error("Gagal menambah todo: ", error);
    }
  };

  return (
    <div className="app-container">
      <div className="todo-box">
        <h1 className="title">Todo List</h1>

        <form onSubmit={handleAddTodo} className="input-group">
          <input
            type="text"
            placeholder="Tambah rutinitas baru..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="todo-input"
          />
          <button type="submit" className="add-btn" disabled={!newTodo.trim()}>
            Tambah
          </button>
        </form>

        <div className="todo-list">
          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Memuat tugas...</p>
            </div>
          ) : todos.length === 0 ? (
            <p className="empty-state">Belum ada daftar tugas. Tambahkan sekarang!</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="checkmark"></span>
                </label>

                <span className="todo-title">{todo.title}</span>

                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  title="Hapus Todo"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
