import React from "react";
import { useTasks } from "../context/TasksContext";
import { Link } from "react-router-dom";

function TaskCard( {task} ) {

   const {deleteTask} = useTasks()

    return (
        <div className="bg-zinc-600 max-w-md w-full p-10 rounded-md">
          <header className="flex justify-between">
          <div className="text-2xl font-boitems-center">
            <button onClick={() => {
                deleteTask(task._id)
            }}>delete</button>
            <Link to={'/tasks/${task._id}'}>edit</Link>
            </div>
          </header>
            <p>{task.description}</p>
            <p>{new Date(task.date).toLocaleDateString()}</p>
            </div>
        );
}
export default TaskCard;