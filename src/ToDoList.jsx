import React, { useState, useEffect } from "react";
import {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
} from "firebase/firestore";

function ToDoList({ db, userId }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const q = query(
                    collection(db, "lists"),
                    where("userId", "==", userId)
                );
                const querySnapshot = await getDocs(q);
                const fetchedTasks = [];

                querySnapshot.forEach((doc) => {
                    fetchedTasks.push({
                        id: doc.id,
                        name: doc.data().name,
                    });
                });

                setTasks(fetchedTasks);
            } catch (error) {
                console.error("Error loading tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTasks();
        }
    }, [db, userId]);

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const docRef = await addDoc(collection(db, "lists"), {
                name: newTask,
                userId: userId,
                createdAt: new Date(),
            });

            setTasks([...tasks, { id: docRef.id, name: newTask }]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await deleteDoc(doc(db, "lists", taskId));
            setTasks(tasks.filter((task) => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // ... (keep your existing moveTaskUp/Down functions)

    if (loading) return <div className="loading">Loading tasks...</div>;

    return (
        <div className="to-do-list">
            {/* Keep your existing JSX, but update the delete handler: */}
            {tasks.map((task, index) => (
                <div className="list-item" key={task.id}>
                    {/* ... other elements ... */}
                    <button
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}>
                        ❌
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ToDoList;
