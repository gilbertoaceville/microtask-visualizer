import "./App.css";
import QueueColumn from "./components/modules/queue-column";
import { TASK_COLORS } from "./utils/constants";

const TASKS = [
  {
    id: 1,
    type: "sync" | "promise" | "setTimeout" | "queueMicrotask",
    name: "Server",
    delay: 1000,
    callback: () => "Running the first task in the visualizer",
    status: "pending" | "running" | "completed",
    createdAt: "2025-11-06T23:18:44.000Z",
  },
];

function App() {
  return (
    <main>
      <QueueColumn
        title="Init Task"
        tasks={TASKS}
        color={TASK_COLORS["sync"]}
        description="First visualizer task"
      />
    </main>
  );
}

export default App;
