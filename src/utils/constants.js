export const TASK_TYPES = {
  SYNC: "sync",
  PROMISE: "promise",
  SETTIMEOUT: "setTimeout",
  QUEUE_MICROTASK: "queueMicrotask",
};

export const TASK_COLORS = {
  [TASK_TYPES.SYNC]: "bg-gray-600 border-gray-400",
  [TASK_TYPES.PROMISE]: "bg-blue-600 border-blue-400",
  [TASK_TYPES.QUEUE_MICROTASK]: "bg-purple-600 border-purple-400",
  [TASK_TYPES.SETTIMEOUT]: "bg-orange-600 border-orange-400",
};

export const QUEUE_TYPES = {
  MICROTASK: "microtask",
  MACROTASK: "macrotask",
  SYNC: "sync",
};

export const EXPLANATIONS = {
  CALL_STACK:
    "Call Stack: Synchronous code executes immediately and must complete before the event loop can continue.",
  MICROTASK:
    "Microtask Queue: ALL microtasks must execute before ANY macrotask. This is why Promises resolve before setTimeout(0).",
  MACROTASK:
    "Macrotask Queue: After executing ONE macrotask, the event loop checks for microtasks again before the next macrotask.",
  EMPTY:
    "All queues empty! The event loop is waiting for new tasks. Add more tasks to continue.",
  PROMISE_ADDED:
    "Promise callbacks go to the Microtask Queue. They will execute after all synchronous code, but before any macrotasks.",
  SETTIMEOUT_ADDED:
    "setTimeout callbacks go to the Macrotask Queue. They execute after ALL microtasks are complete.",
  QUEUE_MICROTASK_ADDED:
    "queueMicrotask explicitly adds to the Microtask Queue, same priority as Promises.",
  RESET: "Reset complete. Add tasks to begin visualization.",
  EXAMPLE_LOADED:
    "Example loaded! This demonstrates how sync code executes first, then ALL promises, then setTimeout.",
  CODE_PARSED:
    'Code parsed successfully! Click "Step Forward" or "Auto Run" to see execution.',
  CODE_ERROR: "Error parsing code. Please check your syntax and try again.",
};

export const EVENT_LOOP_RULES = [
  {
    id: 1,
    text: "Call stack must be empty before event loop processes queues",
  },
  { id: 2, text: "ALL microtasks execute before ANY macrotask" },
  { id: 3, text: "After ONE macrotask, check microtasks again" },
  {
    id: 4,
    text: "Microtasks can queue more microtasks (be careful of infinite loops!)",
  },
];

export const TASK_BUTTONS = [
  {
    type: TASK_TYPES.SYNC,
    label: "Sync Code",
    className: "bg-gray-600 hover:bg-gray-700",
    explanation: null,
  },
  {
    type: TASK_TYPES.PROMISE,
    label: "Promise",
    className: "bg-blue-600 hover:bg-blue-700",
    explanation: EXPLANATIONS.PROMISE_ADDED,
  },
  {
    type: TASK_TYPES.SETTIMEOUT,
    label: "setTimeout",
    className: "bg-orange-600 hover:bg-orange-700",
    explanation: EXPLANATIONS.SETTIMEOUT_ADDED,
  },
  {
    type: TASK_TYPES.QUEUE_MICROTASK,
    label: "queueMicrotask",
    className: "bg-purple-600 hover:bg-purple-700",
    explanation: EXPLANATIONS.QUEUE_MICROTASK_ADDED,
  },
];
