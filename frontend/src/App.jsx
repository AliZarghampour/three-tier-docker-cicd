import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const loadTasks = async () => {
    const res = await axios.get(`${backendURL}/tasks`);
    setTasks(res.data);
  };
  const addTask = async () => {
    if (!newTitle) return;
    await axios.post(`${backendURL}/tasks`, { title: newTitle });
    setNewTitle("");
    loadTasks();
  };
  useEffect(() => {
    loadTasks();
  }, []);
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>🧱 TaskFlow Frontend</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
        />
        <button onClick={addTask} style={{ marginLeft: "10px" }}>Add</button>
      </div>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.title} {t.completed ? "✅" : "⏳"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
