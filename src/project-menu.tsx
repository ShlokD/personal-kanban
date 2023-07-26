import { useDBContext } from "./db-context";
import { useState, useEffect, StateUpdater } from "preact/hooks";
import { ulid } from "ulid";
import { useAppContext } from "./app-context";
import { Project } from "./types";
const ProjectMenu = () => {
  const { db } = useDBContext();
  const { currentProject, setCurrentProject } = useAppContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [showProjectInput, setShowProjectInput] = useState(false);
  const handleAddProject = async () => {
    if (title === "" || !db) {
      return;
    }

    const newProject = { project_id: ulid(), title };

    setProjects([...projects, newProject]);
    setShowProjectInput(false);
    setTitle("");
    await db.table("projects").add(newProject);
  };

  const handleCloseProject = () => {
    setShowProjectInput(false);
    setTitle("");
  };
  const loadProjects = async () => {
    if (!db) {
      return;
    }
    const dbProjects = await db.table("projects").toArray();
    if (dbProjects.length > 0) {
      setCurrentProject?.(dbProjects[0]);
    }
    setProjects(dbProjects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="h-screen border-2 border-gray-900 rounded-lg rounded-xl p-4 bg-gray-900 text-xl flex flex-col items-center">
      <button
        className="p-4 bg-purple-900 text-4xl border-2 border-purple-900 rounded-full h-20 w-20 shadow"
        aria-label="Add New Project"
        onClick={() => setShowProjectInput((prev) => !prev)}
      >
        +
      </button>
      <div
        aria-hidden={!showProjectInput}
        className={`${
          showProjectInput ? " opacity-100" : "opacity-0"
        } flex flex-row gap-2 my-4 transition-opacity`}
      >
        <input
          className="p-2 text-lg bg-gray-800 focus:border-2 rounded-lg"
          aria-label="Enter title"
          placeholder="Enter title"
          value={title}
          onChange={(ev) => setTitle((ev?.target as HTMLInputElement)?.value)}
        />
        <button className="bg-gray-800 p-2 text-lg" onClick={handleAddProject}>
          &#10003;
        </button>
        <button
          className="bg-gray-800 p-2 text-lg"
          onClick={handleCloseProject}
        >
          &#9587;
        </button>
      </div>
      <div className="my-4 flex flex-col items-start text-2xl w-full px-6 gap-4">
        {projects.map((project, i) => (
          <button
            className={`${
              project.project_id === currentProject?.project_id
                ? "text-white"
                : "text-gray-400"
            } border-0 hover:text-white`}
            key={`project-${i}`}
            onClick={() =>
              (setCurrentProject as StateUpdater<Project>)?.(project)
            }
          >
            {project.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectMenu;
