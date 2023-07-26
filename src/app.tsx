import DBContextProvider from "./db-context";
import Board from "./board";
import AppContextProvider from "./app-context";
import ProjectMenu from "./project-menu";
export function App() {
  return (
    <div className="flex flex-col items-center">
      <DBContextProvider>
        <AppContextProvider>
          <header className="w-full p-8 text-2xl bg-gray-900 flex flex-row gap-4 w-11/12 items-center font-bold">
            <div className="p-2 rounded-lg bg-white">
              <img src="/logo.png" height="48" width="48" alt="" />
            </div>
            <h1>Personal Kanban</h1>
          </header>
          <main className="flex flex-col w-11/12 mx-2 my-4 ">
            <div className="flex gap-4">
              <div className="w-1/4">
                <ProjectMenu />
              </div>
              <div className="w-3/4">
                <Board />
              </div>
            </div>
          </main>
        </AppContextProvider>
      </DBContextProvider>
    </div>
  );
}
