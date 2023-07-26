import { useState, useEffect } from "preact/hooks";
import { useDBContext } from "./db-context";
import { useAppContext } from "./app-context";
import { ulid } from "ulid";
import { Status, Task } from "./types";
const transformTasks = (tasks: Task[]): Record<Status, Task[]> =>
  tasks.reduce((taskMap, task) => {
    const status = task.status;
    if (taskMap[status]) {
      taskMap[status].push(task);
    } else {
      taskMap[status] = [task];
    }
    return taskMap;
  }, {} as Record<Status, Task[]>);

const TaskCard = (props: Task) => {
  const { task_id, title, description, date, status } = props;
  const days = Math.round((Date.now() - date) / 86400000);
  return (
    <div
      className={`${
        status === "DONE" ? "line-through bg-gray-500" : ""
      } border-2 border-black p-4 bg-gray-100 rounded-xl text-gray-800 w-1/2`}
      draggable
      onDragStart={(ev: DragEvent) => {
        ev.dataTransfer?.setData("task_id", task_id);
      }}
    >
      <p className="font-bold text-xl">{title}</p>
      <p className="text-sm py-2 text-gray-500">{description}</p>
      <p>{days} days ago</p>
    </div>
  );
};

const Board = () => {
  const { db } = useDBContext();
  const { currentProject } = useAppContext();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const handleDrop = async (ev: DragEvent, target: Status) => {
    if (!db) {
      return;
    }
    ev.preventDefault();
    const taskId = ev?.dataTransfer?.getData("task_id");
    const newTasks = tasks.slice();
    const taskIndex = newTasks.findIndex((task) => task.task_id === taskId);
    newTasks[taskIndex].status = target;
    await db.table("tasks").put(newTasks[taskIndex]);
    setTasks(newTasks);
  };

  const loadTasks = async () => {
    if (!currentProject?.project_id || !db) {
      return;
    }
    const dbTasks = await db
      .table("tasks")
      .where("project")
      .equalsIgnoreCase(currentProject.project_id)
      .toArray();
    setTasks(dbTasks);
  };

  const handleAddTask = async () => {
    if (!taskTitle || !db || !currentProject) {
      setShowAddTaskForm(false);
      setTaskTitle("");
      setTaskDescription("");
      return;
    }
    const newTask = {
      task_id: ulid(),
      status: "TODO" as Status,
      project: currentProject.project_id,
      title: taskTitle,
      description: taskDescription,
      date: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    await db.table("tasks").add(newTask);
    setShowAddTaskForm(false);
    setTaskTitle("");
    setTaskDescription("");
  };

  const handleCloseTask = () => {
    setShowAddTaskForm(false);
    setTaskTitle("");
    setTaskDescription("");
  };

  useEffect(() => {
    loadTasks();
  }, [currentProject]);

  const displayTasks = transformTasks(tasks);
  if (!currentProject) {
    return null;
  }

  return (
    <div className="flex flex-col p-4 bg-gray-900 rounded-xl relative gap-4 max-h-screen">
      <button
        onClick={() => setShowAddTaskForm((prev) => !prev)}
        className="bg-purple-900 p-4 rounded-lg font-bold text-gray-200 w-2/12"
      >
        Add New Task
      </button>
      <div className="flex flex-row gap-2" style={{ height: "90vh" }}>
        <div
          className="w-1/3 flex flex-col gap-2 bg-gray-800 p-2 h-full items-center"
          onDrop={(ev) => handleDrop(ev, "TODO")}
          onDragOver={(ev) => ev.preventDefault()}
        >
          <h2 className="text-center text-2xl font-bold p-2">Backlog</h2>
          {displayTasks.TODO?.map((task, i) => (
            <TaskCard key={`b-{0}-${i}`} {...task} />
          ))}
        </div>
        <div
          className="w-1/3 flex flex-col gap-2 bg-gray-800 p-2 pointer-events-auto h-full items-center"
          onDrop={(ev) => handleDrop(ev, "DOING")}
          onDragOver={(ev) => ev.preventDefault()}
        >
          <h2 className="text-center text-2xl font-bold p-2">In Progress</h2>

          {displayTasks.DOING?.map((task, i) => (
            <TaskCard key={`b-{1}-${i}`} {...task} />
          ))}
        </div>
        <div
          className="w-1/3 flex flex-col gap-2 bg-gray-800 p-2 h-full items-center"
          onDrop={(ev) => handleDrop(ev, "DONE")}
          onDragOver={(ev) => ev.preventDefault()}
        >
          <h2 className="text-center text-2xl font-bold p-2">Done</h2>

          {displayTasks.DONE?.map((task, i) => (
            <TaskCard key={`b-{2}-${i}`} {...task} />
          ))}
        </div>
      </div>
      <div
        className={`${
          showAddTaskForm ? "flex flex-col" : "hidden"
        } absolute bg-white w-4/12 z-10 rounded-xl p-8 m-auto flex flex-col items-center gap-4`}
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          minHeight: "320px",
        }}
      >
        <input
          value={taskTitle}
          onChange={(ev) =>
            setTaskTitle((ev?.target as HTMLInputElement)?.value)
          }
          className="bg-gray-200 rounded-sm w-full p-2 text-lg text-black font-bold"
          placeholder="Enter task title"
          aria-label="Enter task title"
        />
        <textarea
          value={taskDescription}
          onChange={(ev) =>
            setTaskDescription((ev?.target as HTMLTextAreaElement)?.value)
          }
          className="bg-gray-200 rounded-sm w-full p-2 text-lg text-black"
          aria-label="Enter task description"
          placeholder="Enter task description"
          rows={6}
        />
        <div className="flex gap-2">
          <button className="bg-gray-800 p-4 text-lg" onClick={handleAddTask}>
            &#10003;
          </button>
          <button className="bg-gray-800 p-4 text-lg" onClick={handleCloseTask}>
            &#9587;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Board;
