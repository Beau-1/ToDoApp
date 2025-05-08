import React, { useState, useEffect } from "react";
import {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

function ToDoList({ db, userId }) {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [newTask, setNewTask] = useState("");
    const [firestoreData, setFirestoreData] = useState({}); // { taskName: { id, order } }

    // Load and sync tasks from Firestore and localStorage
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const querySnapshot = await getDocs(
                    query(
                        collection(db, "lists"),
                        where("userId", "==", userId)
                    )
                );

                const firestoreTasks = {};
                const localTasks =
                    JSON.parse(localStorage.getItem("tasks")) || [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    firestoreData[data.name] = {
                        id: doc.id,
                        order: data.order,
                    };
                });

                // Merge tasks prioritizing Firestore order
                const mergedTasks = Object.entries(firestoreData)
                    .sort((a, b) => a[1].order - b[1].order)
                    .map(([name]) => name);

                // Add any local tasks not in Firestore
                localTasks.forEach((task) => {
                    if (!firestoreData[task]) {
                        mergedTasks.push(task);
                    }
                });

                setTasks(mergedTasks);
                setFirestoreData(firestoreData);
            } catch (error) {
                console.error("Error loading tasks:", error);
            }
        };

        loadTasks();
    }, [db]);

    // Update localStorage whenever tasks change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const handleInputChange = (event) => {
        setNewTask(event.target.value);
    };

    const addTask = async (event) => {
        event.preventDefault();
        const taskName = newTask.trim();
        if (taskName === "") return;

        try {
            // Add to Firestore with order
            const docRef = await addDoc(collection(db, "lists"), {
                name: taskName,
                order: tasks.length,
                createdAt: new Date(),
                userId: userId, // Add this line
            });

            // Update state
            setFirestoreData((prev) => ({
                ...prev,
                [taskName]: {
                    id: docRef.id,
                    order: tasks.length,
                },
            }));
            setTasks([...tasks, taskName]);
            setNewTask("");
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const deleteTask = async (index) => {
        const taskName = tasks[index];

        try {
            // Delete from Firestore if exists
            if (firestoreData[taskName]?.id) {
                await deleteDoc(doc(db, "lists", firestoreData[taskName].id));
            }

            // Update state
            const newFirestoreData = { ...firestoreData };
            delete newFirestoreData[taskName];
            setFirestoreData(newFirestoreData);

            setTasks(tasks.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const moveTask = async (index, direction) => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tasks.length) return;

        const updatedTasks = [...tasks];
        const task1 = updatedTasks[index];
        const task2 = updatedTasks[newIndex];

        // Swap tasks
        updatedTasks[index] = task2;
        updatedTasks[newIndex] = task1;
        setTasks(updatedTasks);

        // Update Firestore order if both tasks exist there
        try {
            if (firestoreData[task1] && firestoreData[task2]) {
                const batchUpdates = [
                    updateDoc(doc(db, "lists", firestoreData[task1].id), {
                        order: firestoreData[task2].order,
                        userId: userId, // Add this to maintain consistency
                    }),
                    updateDoc(doc(db, "lists", firestoreData[task2].id), {
                        order: firestoreData[task1].order,
                        userId: userId, // Add this to maintain consistency
                    }),
                ];
                await Promise.all(batchUpdates);

                // Update local firestoreData
                setFirestoreData((prev) => ({
                    ...prev,
                    [task1]: {
                        ...prev[task1],
                        order: prev[task2].order,
                    },
                    [task2]: {
                        ...prev[task2],
                        order: prev[task1].order,
                    },
                }));
            }
        } catch (error) {
            console.error("Error updating task order:", error);
        }
    };

    const moveTaskUp = (index) => moveTask(index, "up");
    const moveTaskDown = (index) => moveTask(index, "down");

    return (
        <div className="to-do-list">
            <h1>To Do</h1>
            <div className="version">Ver. 2.7</div>
            <form onSubmit={addTask} className="input-container">
                <input
                    type="text"
                    placeholder="Enter a task"
                    value={newTask}
                    onChange={handleInputChange}
                />
                <button className="add-button">Add</button>
            </form>
            <div className="list">
                {tasks.map((task, index) => (
                    <div className="list-item" key={index}>
                        <span className="text">{task}</span>
                        <button
                            className="move-button"
                            onClick={() => moveTaskUp(index)}>
                            🔼
                        </button>
                        <button
                            className="move-button"
                            onClick={() => moveTaskDown(index)}>
                            🔽
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => deleteTask(index)}>
                            ❌
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToDoList;
