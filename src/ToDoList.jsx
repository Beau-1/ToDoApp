import React, { useState, useEffect } from "react";

function ToDoList() {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("tasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [newTask, setNewTask] = useState("");

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask(event) {
        event.preventDefault();
        if (newTask.trim() !== "") {
            setTasks((t) => [...t, newTask]);
            setNewTask("");
        }
    }

    function deleteTask(index) {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    }

    function moveTaskUp(index) {
        if (index > 0) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index - 1]] = [
                updatedTasks[index - 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    }

    function moveTaskDown(index) {
        if (index < tasks.length - 1) {
            const updatedTasks = [...tasks];
            [updatedTasks[index], updatedTasks[index + 1]] = [
                updatedTasks[index + 1],
                updatedTasks[index],
            ];
            setTasks(updatedTasks);
        }
    }

    return (
        <div className="to-do-list">
            <h1>To Do</h1>
            <div id="versionId" className="version">
                Ver. 2.1
            </div>
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
