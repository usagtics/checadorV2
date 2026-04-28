import React from "react";
import { useTasks } from "../context/TasksContext";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function TaskCard({ task }) {
  const { deleteTask } = useTasks();

  const formattedDate = task.date
    ? dayjs.utc(task.date).format("DD/MM/YYYY")
    : "Sin fecha";

  return (
    <div className="bg-zinc-600 max-w-md w-full p-6 rounded-md shadow-md">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
        <h2 className="text-xl font-semibold text-white break-words">
          {task.title}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/tasks/${task._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => deleteTask(task._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Delete
          </button>
        </div>
      </header>
      <p className="text-slate-300 mb-2 break-words">{task.description}</p>
      <p className="text-slate-400 text-sm">{formattedDate}</p>
    </div>
  );
}

export default TaskCard;
