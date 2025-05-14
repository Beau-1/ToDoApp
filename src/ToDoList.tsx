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
import React from "react";

interface Task {
    id: string;
    text: string;
    completed: boolean;
    isDeleting?: boolean;
}

interface ToDoListProps {
    db: Firestore;
    userId: string;
}

function ToDoList({ db, userId }: ToDoListProps): JSX.Element {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState("");
    const [isAdding, setIsAdding] = useState(false);

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

    const addTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setIsAdding(true);

        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                text: newTask,
                completed: false,
                userId,
                createdAt: new Date(),
            });
            // ✅ Add new task to the bottom of the list
            setTasks([
                ...tasks,
                { id: docRef.id, text: newTask, completed: false },
            ]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const deleteTask = async (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, isDeleting: true } : task
            )
        );
        try {
            await deleteDoc(doc(db, "tasks", id));
            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === id ? { ...task, isDeleting: false } : task
                )
            );
        }
    };

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

    const moveTaskUp = (index: number) => {
        if (index <= 0) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[index - 1]] = [
            newTasks[index - 1],
            newTasks[index],
        ];
        setTasks(newTasks);
    };

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
            <div className="version">Ver. 3.4</div>

            <form onSubmit={addTask} className="input-container">
                <input
                    type="text"
                    placeholder="Enter a task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    maxLength={100}
                />
                <button
                    type="submit"
                    className="add-button"
                    disabled={isAdding}>
                    {isAdding ? (
                        <span className="button-spinner"></span>
                    ) : (
                        "Add"
                    )}
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
                                onClick={() => deleteTask(task.id)}
                                disabled={task.isDeleting}>
                                {task.isDeleting ? (
                                    <span className="button-spinner"></span>
                                ) : (
                                    "❌"
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToDoList;
