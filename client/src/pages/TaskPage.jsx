import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/TaskCard";

function TaskPage() {
   
    const { getTasks, tasks } = useTasks();

    useEffect(() => {
        getTasks()
    }, [])

   return (
    <div className="grid grid-cols-3 gap-2">
        {tasks.map((task) => (
           <TaskCard task={task} key={task._id}/>
        ))}
    </div>
   );
}


export default TaskPage;