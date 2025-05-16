import { useState, useEffect, FormEvent } from "react";
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
import { toast } from "react-toastify";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

    useEffect(() => {
        const fetchTasks = async () => {
            if (!userId) return;
            try {
                const q = query(
                    collection(db, "tasks"),
                    where("userId", "==", userId),
                    orderBy("position", "asc")
                );
                const snapshot = await getDocs(q);
                const tasksData = snapshot.docs.map((doc, index) => ({
                    id: doc.id,
                    text: doc.data().text,
                    completed: doc.data().completed || false,
                    position: doc.data().position ?? index,
                }));
                setTasks(tasksData);
            } catch (error) {
                console.error("Error loading tasks:", error);
                toast.error("Failed to load tasks.");
            }
        };

        fetchTasks();
    }, [db, userId]);

    const addTask = (e: FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const tempId = `temp-${Date.now()}`;
        const newPosition = tasks.length;

        const optimisticTask = {
            id: tempId,
            text: newTask,
            completed: false,
            position: newPosition,
        };

        setTasks((prev) => [...prev, optimisticTask]);
        setNewTask("");

        addDoc(collection(db, "tasks"), {
            text: optimisticTask.text,
            completed: false,
            userId,
            createdAt: new Date(),
            position: newPosition,
        })
            .then((docRef) => {
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === tempId ? { ...task, id: docRef.id } : task
                    )
                );
            })
            .catch((error) => {
                console.error("Error adding task:", error);
                toast.error("Failed to add task.");
                setTasks((prev) => prev.filter((task) => task.id !== tempId));
            });
    };

    const deleteTask = (id: string) => {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks); // ✅ Optimistic UI update

        deleteDoc(doc(db, "tasks", id))
            .then(() => syncPositions(newTasks))
            .catch((error) => {
                console.error("Error deleting task:", error);
                toast.error("Failed to delete task.");
            });
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
            toast.error("Failed to update task.");
        }
    };

    const syncPositions = async (newTasks: Task[]) => {
        try {
            const updates = newTasks.map((task, index) =>
                updateDoc(doc(db, "tasks", task.id), { position: index })
            );
            await Promise.all(updates);
        } catch (error) {
            console.error("Error syncing task order:", error);
            toast.error("Failed to reorder tasks.");
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);

        const reorderedTasks = [...tasks];
        const [movedTask] = reorderedTasks.splice(oldIndex, 1);
        reorderedTasks.splice(newIndex, 0, movedTask);

        setTasks(reorderedTasks); // ✅ Optimistic UI update

        syncPositions(reorderedTasks).catch((error) => {
            console.error("Error syncing task order:", error);
            toast.error("Failed to reorder tasks.");
        });
    };

    return (
        <main className="to-do-list">
            <header>
                <h1>To Do</h1>
                <div className="version">Ver. 4.2</div>
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}>
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}>
                    <section className="list">
                        {tasks.map((task) => (
                            <SortableTaskItem
                                key={task.id}
                                task={task}
                                toggleComplete={toggleComplete}
                                deleteTask={deleteTask}
                            />
                        ))}
                    </section>
                </SortableContext>
            </DndContext>
        </main>
    );
}

export default ToDoList;

interface SortableTaskProps {
    task: Task;
    toggleComplete: (id: string) => void;
    deleteTask: (id: string) => void;
}

function SortableTaskItem({
    task,
    toggleComplete,
    deleteTask,
}: SortableTaskProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
        zIndex: isDragging ? 1 : "auto",
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={`list-item ${task.completed ? "completed" : ""} ${
                isDragging ? "dragging" : ""
            }`}
            {...attributes}>
            <span
                className="text"
                {...listeners}
                onClick={() => toggleComplete(task.id)}>
                {task.text}
            </span>
            <div className="task-actions">
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
        </article>
    );
}
