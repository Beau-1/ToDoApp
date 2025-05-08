import { useState, useEffect } from "react";
import {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    type Firestore,
} from "firebase/firestore";
import "./ToDoList.css";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface ToDoListProps {
    db: Firestore;
    userId: string;
}

function ToDoList({ db, userId }: ToDoListProps): JSX.Element {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");

    useEffect(() => {
        const fetchTasks = async () => {
            const q = query(
                collection(db, "todos"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Task[];
            setTasks(tasksData);
        };

        if (userId) fetchTasks();
    }, [db, userId]);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const docRef = await addDoc(collection(db, "todos"), {
                text: newTask,
                completed: false,
                userId,
            });
            setTasks([
                ...tasks,
                { id: docRef.id, text: newTask, completed: false },
            ]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    };

    // ... include your deleteTask, toggleComplete, etc. functions here

    return (
        <div className="to-do-list">
            <form onSubmit={addTask} className="input-container">
                <input
                    type="text"
                    placeholder="Enter a task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button type="submit" className="add-button">
                    Add
                </button>
            </form>
            <div className="list">
                {tasks.map((task) => (
                    <div key={task.id} className="list-item">
                        <span className="text">{task.text}</span>
                        {/* Add your action buttons here */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToDoList;
