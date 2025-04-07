import React, { useEffect } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/TaskCard";

function TaskPage() {
    const { getTasks, tasks } = useTasks();

    useEffect(() => {
        getTasks();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 container mx-auto px-10">
            {tasks.map((task) => (
                <TaskCard task={task} key={task._id} />
            ))}
        </div>
    );
}

export default TaskPage;
