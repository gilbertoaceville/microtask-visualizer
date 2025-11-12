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

  // Remove comments
  let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");

  // Track all console.log calls with their context
  const consoleLogPattern = /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

  //All async contexts (setTimeout, Promise, queueMicrotask)
  const asyncContexts = [];

  //SetTimeout calls
  const setTimeoutPattern =
    /setTimeout\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,)/g;
  let match;

  while ((match = setTimeoutPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    const delayMatch = cleanCode.substring(match.index).match(/,\s*(\d+)\s*\)/);
    const delay = delayMatch ? parseInt(delayMatch[1]) : 0;

    asyncContexts.push({
      type: TASK_TYPES.SETTIMEOUT,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
      delay: delay,
    });
  }

  //Promise.then calls
  const promisePattern =
    /Promise\.resolve\s*\(\s*\)\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,|\))/g;

  while ((match = promisePattern.exec(cleanCode)) !== null) {
    const body = match[1];
    asyncContexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
    });
  }

  // Find .then() calls on existing promises
  const thenPattern =
    /\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;

  while ((match = thenPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    // Check if this .then is not already part of Promise.resolve()
    const beforeContext = cleanCode.substring(
      Math.max(0, match.index - 20),
      match.index
    );
    if (!beforeContext.includes("Promise.resolve()")) {
      asyncContexts.push({
        type: TASK_TYPES.PROMISE,
        start: match.index,
        end: match.index + match[0].length,
        body: body,
      });
    }
  }

  //QueueMicrotask calls
  const queueMicrotaskPattern =
    /queueMicrotask\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;

  while ((match = queueMicrotaskPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    asyncContexts.push({
      type: TASK_TYPES.QUEUE_MICROTASK,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
    });
  }

  //All console.log calls
  const allConsoleLogs = [];
  let consoleMatch;

  while ((consoleMatch = consoleLogPattern.exec(cleanCode)) !== null) {
    allConsoleLogs.push({
      message: consoleMatch[1],
      index: consoleMatch.index,
    });
  }

  // Categorize console.log calls
  allConsoleLogs.forEach((log) => {
    //If this console.log is inside any async context
    let isAsync = false;
    let asyncType = null;
    let delay = 0;

    for (const context of asyncContexts) {
      if (log.index > context.start && log.index < context.end) {
        isAsync = true;
        asyncType = context.type;
        delay = context.delay || 0;
        break;
      }
    }

    if (isAsync) {
      tasks.push(createTask(asyncType, log.message, delay));
    } else {
      // Synchronous console.log
      tasks.push(createTask(TASK_TYPES.SYNC, log.message));
    }
  });

  //Function declarations as sync tasks
  const functionPattern =
    /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))/g;

  while ((match = functionPattern.exec(cleanCode)) !== null) {
    const funcName = match[1] || match[2];
    // Only add if it's not inside an async context and has no console.log in it already counted
    let isInAsync = false;
    for (const context of asyncContexts) {
      if (match.index > context.start && match.index < context.end) {
        isInAsync = true;
        break;
      }
    }

    if (!isInAsync) {
      // Check if this function has any console.log that hasn't been added already
      const funcStart = match.index;
      const funcBody = cleanCode.substring(funcStart);
      const funcEndMatch = funcBody.match(/\{[\s\S]*?\}/);

      if (funcEndMatch) {
        const funcEnd = funcStart + funcEndMatch.index + funcEndMatch[0].length;
        const hasConsoleInBody = allConsoleLogs.some(
          (log) => log.index > funcStart && log.index < funcEnd
        );

        if (!hasConsoleInBody) {
          tasks.push(createTask(TASK_TYPES.SYNC, `Define ${funcName}`));
        }
      }
    }
  }

  return tasks;
};
