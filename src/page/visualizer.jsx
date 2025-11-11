import { useCallback, useRef, useState } from "react";
import { useEventLoop } from "../components/hook/useEventLoop";
import { EVENT_LOOP_RULES, TASK_BUTTONS } from "../utils/constants";
import ControlButton from "../components/elements/button";
import { ChevronRight, Code, Pause, Play, Plus, RotateCcw } from "lucide-react";
import QueueColumn from "../components/modules/queue-column";
import LogEntry from "../components/elements/log";

const MicrotaskVisualizer = () => {
  const {
    callStack,
    microtaskQueue,
    macrotaskQueue,
    executionLog,
    addTask,
    hasActiveTasks,
  } = useEventLoop();

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentExplanation, setCurrentExplanation] = useState(
    'Click "Add Task" buttons to queue tasks, then use "Step Forward" to see how the event loop processes them.'
  );
  const [showCodeModal, setShowCodeModal] = useState(false);
  const logRef = useRef(null);

  const handleStep = useCallback(() => {}, []);

  const handleReset = useCallback(() => {}, []);

  const loadExample = useCallback(() => {}, []);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            JavaScript Event Loop Visualizer
          </h1>
          <p className="text-gray-400">
            Watch how the event loop processes microtasks and macrotasks
          </p>
        </header>

        <section className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {TASK_BUTTONS.map(({ type, label, className, explanation }) => (
              <ControlButton
                key={type}
                onClick={() => {
                  addTask(type, label);
                  if (explanation) setCurrentExplanation(explanation);
                }}
                icon={Plus}
                className={className}
              >
                {label}
              </ControlButton>
            ))}
            <ControlButton
              onClick={() => setShowCodeModal(true)}
              icon={Code}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Paste Code
            </ControlButton>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <ControlButton
              onClick={handleStep}
              disabled={!hasActiveTasks}
              icon={ChevronRight}
              className="bg-green-600 hover:bg-green-700"
            >
              Step Forward
            </ControlButton>
            <ControlButton
              onClick={() => setIsRunning(!isRunning)}
              icon={isRunning ? Pause : Play}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isRunning ? "Pause" : "Auto Run"}
            </ControlButton>
            <ControlButton
              onClick={handleReset}
              icon={RotateCcw}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset
            </ControlButton>
            <ControlButton
              onClick={loadExample}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Load Example
            </ControlButton>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm">Speed:</label>
              <input
                type="range"
                min="200"
                max="2000"
                step="200"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm">{speed}ms</span>
            </div>
          </div>
        </section>

        <aside className="bg-blue-900 bg-opacity-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-sm">{currentExplanation}</p>
        </aside>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QueueColumn
            title="Call Stack"
            tasks={callStack}
            color="bg-gray-500"
            description="Executes immediately"
          />
          <QueueColumn
            title="Microtask Queue"
            tasks={microtaskQueue}
            color="bg-blue-500"
            description="Promises, queueMicrotask"
          />
          <QueueColumn
            title="Macrotask Queue"
            tasks={macrotaskQueue}
            color="bg-orange-500"
            description="setTimeout, setInterval"
          />
        </section>

        <section className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Execution Log</h2>
          <div
            ref={logRef}
            className="bg-gray-900 rounded p-4 h-64 overflow-y-auto font-mono text-sm"
          >
            {executionLog.length === 0 ? (
              <div className="text-gray-500">No executions yet...</div>
            ) : (
              executionLog.map((log, idx) => <LogEntry key={idx} log={log} />)
            )}
          </div>
        </section>

        <footer className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">Event Loop Rules</h3>
          <ul className="space-y-2 text-sm">
            {EVENT_LOOP_RULES.map((rule) => (
              <li key={rule.id} className="flex items-start gap-2">
                <span className="text-green-400">{rule.id}.</span>
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  );
};

export default MicrotaskVisualizer;
