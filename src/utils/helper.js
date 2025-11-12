import { TASK_TYPES } from "./constants";

export const createTask = (() => {
  let counter = 0;
  return (type, name, delay = 0) => ({
    id: ++counter,
    type,
    name: `${name} #${counter}`,
    delay,
    status: "pending",
    createdAt: Date.now(),
  });
})();

export const parseUserCode = (code) => {
  const tasks = [];
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments and empty lines
    if (line.startsWith("//") || line.startsWith("/*") || !line) continue;

    // Parse synchronous console.log
    if (
      line.includes("console.log") &&
      !line.includes("setTimeout") &&
      !line.includes("Promise") &&
      !line.includes("queueMicrotask") &&
      !line.includes("=>")
    ) {
      const match = line.match(/console\.log\(['"`](.+?)['"`]\)/);
      if (match) {
        tasks.push(createTask(TASK_TYPES.SYNC, match[1]));
      }
    }

    // Parse Promise.resolve().then() or new Promise
    if (
      (line.includes("Promise.resolve().then") || line.includes(".then(")) &&
      !line.includes("setTimeout")
    ) {
      // Look for console.log in the same line or next line
      let logMatch = line.match(/console\.log\(['"`](.+?)['"`]\)/);
      if (!logMatch && i + 1 < lines.length) {
        logMatch = lines[i + 1].match(/console\.log\(['"`](.+?)['"`]\)/);
      }
      if (logMatch) {
        tasks.push(createTask(TASK_TYPES.PROMISE, logMatch[1]));
      } else {
        tasks.push(createTask(TASK_TYPES.PROMISE, "Promise callback"));
      }
    }

    // Parse setTimeout
    if (line.includes("setTimeout")) {
      const delayMatch = line.match(/,\s*(\d+)\s*\)/);
      const delay = delayMatch ? parseInt(delayMatch[1]) : 0;

      // Look for console.log in the same line or next line
      let logMatch = line.match(/console\.log\(['"`](.+?)['"`]\)/);
      if (!logMatch && i + 1 < lines.length) {
        logMatch = lines[i + 1].match(/console\.log\(['"`](.+?)['"`]\)/);
      }
      if (logMatch) {
        tasks.push(createTask(TASK_TYPES.SETTIMEOUT, logMatch[1], delay));
      } else {
        tasks.push(
          createTask(TASK_TYPES.SETTIMEOUT, `Timeout (${delay}ms)`, delay)
        );
      }
    }

    // Parse queueMicrotask
    if (line.includes("queueMicrotask")) {
      let logMatch = line.match(/console\.log\(['"`](.+?)['"`]\)/);
      if (!logMatch && i + 1 < lines.length) {
        logMatch = lines[i + 1].match(/console\.log\(['"`](.+?)['"`]\)/);
      }
      if (logMatch) {
        tasks.push(createTask(TASK_TYPES.QUEUE_MICROTASK, logMatch[1]));
      } else {
        tasks.push(createTask(TASK_TYPES.QUEUE_MICROTASK, "Microtask"));
      }
    }
  }

  return tasks;
};
