import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";

// Main ToDoList component
function ToDoList({ db }) {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });

    // State for holding the new task input value
    const [newTask, setNewTask] = useState("");

    // Effect to update localStorage whenever tasks change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    // Handler to update newTask state as the user types
    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    // Function to add a new document to the 'lists' collection
    async function addExampleItem() {
        try {
            const docRef = await addDoc(collection(db, "lists"), {
                first: "Ada",
                last: "Lovelace",
                born: 1815,
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    // Handler to add a new task to the list
    function addTask(event) {
        // Prevents a blank submission
        event.preventDefault();
        if (newTask.trim() !== "") {
            // Add new task to the list
            setTasks((t) => [...t, newTask]);
            // Clears the input field
            setNewTask("");

            // If the input is "example", add the example item to Firestore
            if (newTask.toLowerCase() === "example") {
                addExampleItem();
            }
        }
    }

    // Handler to delete a task by index
    function deleteTask(index) {
        // Removes task
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    }

    // Handler to move a task up in the list
    function moveTaskUp(index) {
        if (index > 0) {
            const updatedTasks = [...tasks];
            // Swaps the current task with the one above it
            [updatedTasks[index], updatedTasks[index - 1]] = [
                updatedTasks[index - 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    }

    // Handler to move a task down in the list
    function moveTaskDown(index) {
        if (index < tasks.length - 1) {
            const updatedTasks = [...tasks];
            // Swaps the current task with the one below it
            [updatedTasks[index], updatedTasks[index + 1]] = [
                updatedTasks[index + 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    }

    // Renders the UI
    return (
        <div className="to-do-list">
            <h1>To Do</h1>
            <div className="version">Ver. 2.3</div>
            <form onSubmit={addTask} className="input-container">
                <input
                    type="text"
                    placeholder="Enter a task (type 'example' for Firestore demo)"
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
