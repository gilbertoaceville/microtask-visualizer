import { TASK_TYPES } from "./constants";

export const createTask = (() => {
  let counter = 0;
  return (type, name, delay = 0) => ({
    id: ++counter,
    type,
    name: `${name} #${counter}`,
    delay,
    status: 'pending',
    createdAt: Date.now()
  });
})();

export const parseUserCode = (code) => {
  const tasks = [];
  const lines = code.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Parse console.log (synchronous)
    if (trimmed.includes('console.log') && !trimmed.includes('setTimeout') && !trimmed.includes('Promise')) {
      const match = trimmed.match(/console\.log\(['"](.+?)['"]\)/);
      if (match) {
        tasks.push(createTask(TASK_TYPES.SYNC, `Log: ${match[1]}`));
      }
    }
    
    // Parse Promise.resolve().then()
    if (trimmed.includes('Promise.resolve().then')) {
      const match = trimmed.match(/console\.log\(['"](.+?)['"]\)/);
      if (match) {
        tasks.push(createTask(TASK_TYPES.PROMISE, `Promise: ${match[1]}`));
      }
    }
    
    // Parse setTimeout
    if (trimmed.includes('setTimeout')) {
      const match = trimmed.match(/console\.log\(['"](.+?)['"]\)/);
      const delayMatch = trimmed.match(/,\s*(\d+)\s*\)/);
      if (match) {
        const delay = delayMatch ? parseInt(delayMatch[1]) : 0;
        tasks.push(createTask(TASK_TYPES.SETTIMEOUT, `Timeout: ${match[1]}`, delay));
      }
    }
    
    // Parse queueMicrotask
    if (trimmed.includes('queueMicrotask')) {
      const match = trimmed.match(/console\.log\(['"](.+?)['"]\)/);
      if (match) {
        tasks.push(createTask(TASK_TYPES.QUEUE_MICROTASK, `QMT: ${match[1]}`));
      }
    }
  });
  
  return tasks;
};