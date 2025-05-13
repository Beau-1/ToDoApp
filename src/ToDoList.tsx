import { useState, useEffect, JSX, FormEvent } from "react";
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
// import "./ToDoList.css";
import React from "react";

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

    // Load tasks from Firestore
    useEffect(() => {
        const fetchTasks = async () => {
            const q = query(
                collection(db, "tasks"),
                where("userId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                text: doc.data().text,
                completed: doc.data().completed || false,
            }));
            setTasks(tasksData);
        };
        if (userId) fetchTasks();
    }, [db, userId]);

    // Add new task
    const addTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                text: newTask,
                completed: false,
                userId,
                createdAt: new Date(),
            });
            setTasks([
                ...tasks,
                { id: docRef.id, text: newTask, completed: false },
            ]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    // Delete task
    const deleteTask = async (id: string) => {
        try {
            await deleteDoc(doc(db, "tasks", id));
            setTasks(tasks.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // Toggle task completion
    const toggleComplete = async (id: string) => {
        try {
            const task = tasks.find((t) => t.id === id);
            if (!task) return;

            await updateDoc(doc(db, "tasks", id), {
                completed: !task.completed,
            });
            setTasks(
                tasks.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // Move task up
    const moveTaskUp = (index: number) => {
        if (index <= 0) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[index - 1]] = [
            newTasks[index - 1],
            newTasks[index],
        ];
        setTasks(newTasks);
    };

    // Move task down
    const moveTaskDown = (index: number) => {
        if (index >= tasks.length - 1) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[index + 1]] = [
            newTasks[index + 1],
            newTasks[index],
        ];
        setTasks(newTasks);
    };

    return (
        <div className="to-do-list">
            <h1>To Do</h1>
            <div className="version">Ver. 3.2</div>
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
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className={`list-item ${
                            task.completed ? "completed" : ""
                        }`}>
                        <span
                            className="text"
                            onClick={() => toggleComplete(task.id)}>
                            {task.text}
                        </span>
                        <div className="task-actions">
                            <button
                                className="move-button"
                                onClick={() => moveTaskUp(index)}
                                disabled={index === 0}>
                                🔼
                            </button>
                            <button
                                className="move-button"
                                onClick={() => moveTaskDown(index)}
                                disabled={index === tasks.length - 1}>
                                🔽
                            </button>
                            <button
                                className="delete-button"
                                onClick={() => deleteTask(task.id)}>
                                ❌
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToDoList;
