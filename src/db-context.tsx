import Dexie from "dexie";
import { createContext, FunctionComponent } from "preact";
import { useContext } from "preact/hooks";

type DBContextType = {
  db?: Dexie | null;
};

const DBContext = createContext<DBContextType>({
  db: null,
});
const db = new Dexie("kanban-db");

db.version(1).stores({
  projects: "project_id",
  tasks: "task_id,project",
});

export const useDBContext = () => useContext(DBContext);

const DBContextProvider: FunctionComponent<object> = ({ children }) => (
  <DBContext.Provider value={{ db }}>{children} </DBContext.Provider>
);

export default DBContextProvider;
