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
