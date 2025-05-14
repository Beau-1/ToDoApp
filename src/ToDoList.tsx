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
    orderBy,
    type Firestore,
} from "firebase/firestore";
import React from "react";

interface Task {
    id: string;
    text: string;
    completed: boolean;
    position: number;
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const q = query(
                    collection(db, "tasks"),
                    where("userId", "==", userId),
                    orderBy("position")
                );
                const querySnapshot = await getDocs(q);
                const tasksData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    text: doc.data().text,
                    completed: doc.data().completed || false,
                    position: doc.data().position ?? 0,
                }));
                setTasks(tasksData);
            } catch (error) {
                console.error("Error fetching tasks:", error);
                setErrorMessage("Failed to load tasks.");
            }
        };

        if (userId) fetchTasks();
    }, [db, userId]);

    const addTask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        setIsAdding(true);

        try {
            const newPosition = tasks.length;
            const docRef = await addDoc(collection(db, "tasks"), {
                text: newTask,
                completed: false,
                userId,
                createdAt: new Date(),
                position: newPosition,
            });
            setTasks([
                ...tasks,
                {
                    id: docRef.id,
                    text: newTask,
                    completed: false,
                    position: newPosition,
                },
            ]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
            setErrorMessage("Failed to add task. Please try again.");
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
            const newTasks = tasks.filter((task) => task.id !== id);
            await syncPositions(newTasks);
        } catch (error) {
            console.error("Error deleting task:", error);
            setErrorMessage("Failed to delete task.");
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
            setErrorMessage("Failed to update task.");
        }
    };

    const syncPositions = async (newTasks: Task[]) => {
        try {
            const batch = newTasks.map((task, index) =>
                updateDoc(doc(db, "tasks", task.id), { position: index })
            );
            await Promise.all(batch);
            setTasks(
                newTasks.map((task, index) => ({ ...task, position: index }))
            );
        } catch (error) {
            console.error("Error syncing positions:", error);
            setErrorMessage("Failed to update task order.");
        }
    };

    const moveTaskUp = async (index: number) => {
        if (index <= 0) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[index - 1]] = [
            newTasks[index - 1],
            newTasks[index],
        ];
        await syncPositions(newTasks);
    };

    const moveTaskDown = async (index: number) => {
        if (index >= tasks.length - 1) return;
        const newTasks = [...tasks];
        [newTasks[index], newTasks[index + 1]] = [
            newTasks[index + 1],
            newTasks[index],
        ];
        await syncPositions(newTasks);
    };

    // Auto-clear error after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <main className="to-do-list">
            <header>
                <h1>To Do</h1>
                <div className="version">Ver. 3.8</div>
            </header>

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

            <section className="list">
                {tasks.map((task, index) => (
                    <article
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
                                disabled={index === 0}
                                aria-label="Move task up">
                                🔼
                            </button>
                            <button
                                className="move-button"
                                onClick={() => moveTaskDown(index)}
                                disabled={index === tasks.length - 1}
                                aria-label="Move task down">
                                🔽
                            </button>
                            <button
                                className="delete-button"
                                onClick={() => deleteTask(task.id)}
                                disabled={task.isDeleting}
                                aria-label="Delete task">
                                {task.isDeleting ? (
                                    <span className="button-spinner"></span>
                                ) : (
                                    "❌"
                                )}
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {errorMessage && (
                <div className="error-banner">
                    {errorMessage}
                    <button
                        onClick={() => setErrorMessage(null)}
                        aria-label="Close error">
                        ❌
                    </button>
                </div>
            )}
        </main>
    );
}

export default ToDoList;
