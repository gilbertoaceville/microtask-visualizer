import { useCallback, useState } from "react";
import { createTask } from "../../utils/helper";
import { EXPLANATIONS, QUEUE_TYPES, TASK_TYPES } from "../../utils/constants";

export const useEventLoop = () => {
  const [callStack, setCallStack] = useState([]);
  const [microtaskQueue, setMicrotaskQueue] = useState([]);
  const [macrotaskQueue, setMacrotaskQueue] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [stepCount, setStepCount] = useState(0);

  const addLog = useCallback(
    (message, type) => {
      setExecutionLog((prev) => [
        ...prev,
        {
          message,
          type,
          timestamp: new Date().toLocaleTimeString(),
          step: stepCount,
        },
      ]);
    },
    [stepCount]
  );

  const addTask = useCallback(
    (type, name, delay = 0) => {
      const task = createTask(type, name, delay);

      if (type === TASK_TYPES.SYNC) {
        setCallStack((prev) => [...prev, task]);
        addLog(`Added ${task.name} to Call Stack`, QUEUE_TYPES.SYNC);
      } else if (
        type === TASK_TYPES.PROMISE ||
        type === TASK_TYPES.QUEUE_MICROTASK
      ) {
        setMicrotaskQueue((prev) => [...prev, task]);
        addLog(`Queued ${task.name} in Microtask Queue`, QUEUE_TYPES.MICROTASK);
      } else if (type === TASK_TYPES.SETTIMEOUT) {
        setMacrotaskQueue((prev) => [...prev, task]);
        addLog(`Queued ${task.name} in Macrotask Queue`, QUEUE_TYPES.MACROTASK);
      }

      return task;
    },
    [addLog]
  );

  const executeNextStep = useCallback(() => {
    setStepCount((prev) => prev + 1);

    if (callStack.length > 0) {
      const task = callStack[0];
      setCallStack((prev) => prev.slice(1));
      addLog(`✓ Executed ${task.name}`, task.type);
      return EXPLANATIONS.CALL_STACK;
    }

    if (microtaskQueue.length > 0) {
      const task = microtaskQueue[0];
      setMicrotaskQueue((prev) => prev.slice(1));
      setCallStack([{ ...task, status: "running" }]);

      setTimeout(() => {
        setCallStack([]);
        addLog(`✓ Executed ${task.name}`, QUEUE_TYPES.MICROTASK);
      }, 100);

      return EXPLANATIONS.MICROTASK;
    }

    if (macrotaskQueue.length > 0) {
      const task = macrotaskQueue[0];
      setMacrotaskQueue((prev) => prev.slice(1));
      setCallStack([{ ...task, status: "running" }]);

      setTimeout(() => {
        setCallStack([]);
        addLog(`✓ Executed ${task.name}`, QUEUE_TYPES.MACROTASK);
      }, 100);

      return EXPLANATIONS.MACROTASK;
    }

    return EXPLANATIONS.EMPTY;
  }, [callStack, microtaskQueue, macrotaskQueue, addLog]);

  const reset = useCallback(() => {
    setCallStack([]);
    setMicrotaskQueue([]);
    setMacrotaskQueue([]);
    setExecutionLog([]);
    setStepCount(0);
  }, []);

  const hasActiveTasks =
    callStack.length > 0 ||
    microtaskQueue.length > 0 ||
    macrotaskQueue.length > 0;

  return {
    callStack,
    microtaskQueue,
    macrotaskQueue,
    executionLog,
    stepCount,
    addTask,
    executeNextStep,
    reset,
    hasActiveTasks,
  };
};
