import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTasks } from "../context/TasksContext";
import { useNavigate, useParams } from "react-router-dom";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

function TasksFormPage() {
  const { register, handleSubmit, setValue } = useForm();
  const { createTask, getTask, updateTask } = useTasks();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadTask() {
      if (params.id) {
        const task = await getTask(params.id);
        if (task) {
          setValue("title", task.title);
          setValue("description", task.description);
        }
      }
    }
    loadTask();
  }, []);

  const onSubmit = handleSubmit((data) => {
    const taskData = {
      ...data,
      date: dayjs.utc().format(), 
    };

    if (params.id) {
      updateTask(params.id, taskData);
    } else {
      createTask(taskData);
    }

    navigate("/tasks");
  });

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md">
      <form onSubmit={onSubmit}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          placeholder="Title"
          {...register("title")}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
          autoFocus
        />

        <label htmlFor="description">Description</label>
        <textarea
          rows="3"
          placeholder="Description"
          {...register("description")}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
        ></textarea>

     

        <button className="bg-indigo-500 hover:bg-indigo-600 px-3 py-2 rounded-md text-white mt-4">
          Save
        </button>
      </form>
    </div>
  );
}

export default TasksFormPage;
