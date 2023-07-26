import { createContext, FunctionComponent } from "preact";
import { StateUpdater, useContext, useState } from "preact/hooks";
import { Project } from "./types";

type AppContextType = {
  currentProject: Project | null;
  setCurrentProject?: StateUpdater<Project> | StateUpdater<null>;
};
const AppContext = createContext<AppContextType>({
  currentProject: null,
});

export const useAppContext = () => useContext(AppContext);

const AppContextProvider: FunctionComponent<object> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null);
  return (
    <AppContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
