import React, { useState, useEffect } from "react";
import {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
} from "firebase/firestore";

function ToDoList({ db }) {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [newTask, setNewTask] = useState("");
    const [firestoreIds, setFirestoreIds] = useState({}); // Stores Firestore document IDs

    // Load tasks from Firestore on component mount
    useEffect(() => {
        const fetchTasks = async () => {
            const querySnapshot = await getDocs(collection(db, "lists"));
            const firestoreTasks = [];
            const ids = {};

            querySnapshot.forEach((doc) => {
                firestoreTasks.push(doc.data().name);
                ids[doc.data().name] = doc.id; // Store doc id by task name
            });

            // Merge with local storage tasks, avoiding duplicates
            const localTasks = JSON.parse(localStorage.getItem("tasks")) || [];
            const mergedTasks = [
                ...new Set([...localTasks, ...firestoreTasks]),
            ];

            setTasks(mergedTasks);
            setFirestoreIds(ids);
        };
        fetchTasks();
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
        if (newTask.trim() !== "") {
            try {
                // Add to Firestore
                const docRef = await addDoc(collection(db, "lists"), {
                    name: newTask,
                    createdAt: new Date(),
                });

                // Update Firestore IDs
                setFirestoreIds((prev) => ({
                    ...prev,
                    [newTask]: docRef.id,
                }));

                // Update local state
                setTasks([...tasks, newTask]);
                setNewTask("");
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    };

    const deleteTask = async (index) => {
        const taskToDelete = tasks[index];

        try {
            // Delete from Firestore if exists
            if (firestoreIds[taskToDelete]) {
                await deleteDoc(doc(db, "lists", firestoreIds[taskToDelete]));
            }

            // Update local state
            const updatedTasks = tasks.filter((_, i) => i !== index);
            setTasks(updatedTasks);

            // Update Firestore IDs
            const newIds = { ...firestoreIds };
            delete newIds[taskToDelete];
            setFirestoreIds(newIds);
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    const moveTaskUp = (index) => {
        if (index > 0) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index - 1]] = [
                updatedTasks[index - 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    };

    const moveTaskDown = (index) => {
        if (index < tasks.length - 1) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = [
                updatedTasks[index + 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    };

    return (
        <div className="to-do-list">
            <h1>To Do</h1>
            <div className="version">Ver. 2.3</div>
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
