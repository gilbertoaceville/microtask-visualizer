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

const removeComments = (code) => {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
};

const findAsyncFunctions = (cleanCode) => {
  const contexts = [];

  const asyncFunctionPattern =
    /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;
  let match;

  while ((match = asyncFunctionPattern.exec(cleanCode)) !== null) {
    contexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: match[2],
      isAsyncFunction: true,
      functionName: match[1],
    });
  }

  const asyncArrowPattern =
    /(?:const|let|var)\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}/g;

  while ((match = asyncArrowPattern.exec(cleanCode)) !== null) {
    contexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: match[2],
      isAsyncFunction: true,
      functionName: match[1],
    });
  }

  return contexts;
};

const findSetTimeoutCalls = (cleanCode) => {
  const contexts = [];
  const setTimeoutPattern =
    /setTimeout\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,)/g;
  let match;

  while ((match = setTimeoutPattern.exec(cleanCode)) !== null) {
    const delayMatch = cleanCode.substring(match.index).match(/,\s*(\d+)\s*\)/);
    contexts.push({
      type: TASK_TYPES.SETTIMEOUT,
      start: match.index,
      end: match.index + match[0].length,
      body: match[1],
      delay: delayMatch ? parseInt(delayMatch[1]) : 0,
    });
  }

  return contexts;
};

const findPromiseCalls = (cleanCode) => {
  const contexts = [];

  const promisePattern =
    /Promise\.resolve\s*\(\s*\)\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,|\))/g;
  let match;

  while ((match = promisePattern.exec(cleanCode)) !== null) {
    contexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: match[1],
    });
  }

  const thenPattern =
    /\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;

  while ((match = thenPattern.exec(cleanCode)) !== null) {
    const beforeContext = cleanCode.substring(
      Math.max(0, match.index - 20),
      match.index
    );
    if (!beforeContext.includes("Promise.resolve()")) {
      contexts.push({
        type: TASK_TYPES.PROMISE,
        start: match.index,
        end: match.index + match[0].length,
        body: match[1],
      });
    }
  }

  return contexts;
};

const findQueueMicrotaskCalls = (cleanCode) => {
  const contexts = [];
  const queueMicrotaskPattern =
    /queueMicrotask\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;
  let match;

  while ((match = queueMicrotaskPattern.exec(cleanCode)) !== null) {
    contexts.push({
      type: TASK_TYPES.QUEUE_MICROTASK,
      start: match.index,
      end: match.index + match[0].length,
      body: match[1],
    });
  }

  return contexts;
};

const findAllConsoleLogs = (cleanCode) => {
  const logs = [];
  const consoleLogPattern = /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;

  while ((match = consoleLogPattern.exec(cleanCode)) !== null) {
    logs.push({
      message: match[1],
      index: match.index,
    });
  }

  return logs;
};

const categorizeConsoleLogs = (consoleLogs, asyncContexts) => {
  const tasks = [];

  consoleLogs.forEach((log) => {
    let isAsync = false;
    let asyncType = null;
    let delay = 0;

    // Check if console.log is inside any async context
    for (const context of asyncContexts) {
      if (log.index > context.start && log.index < context.end) {
        isAsync = true;
        asyncType = context.type;
        delay = context.delay || 0;
        break;
      }
    }

    tasks.push(
      createTask(isAsync ? asyncType : TASK_TYPES.SYNC, log.message, delay)
    );
  });

  return tasks;
};

const findAsyncFunctionDeclarations = (cleanCode) => {
  const tasks = [];
  const asyncFuncDeclPattern = /async\s+function\s+(\w+)/g;
  let match;

  while ((match = asyncFuncDeclPattern.exec(cleanCode)) !== null) {
    tasks.push(createTask(TASK_TYPES.SYNC, `Define async ${match[1]}`));
  }

  return tasks;
};

const findAsyncFunctionCalls = (cleanCode, asyncContexts) => {
  const tasks = [];

  const asyncFunctionNames = [];
  const asyncNamePattern =
    /async\s+function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*async/g;
  let match;

  while ((match = asyncNamePattern.exec(cleanCode)) !== null) {
    asyncFunctionNames.push(match[1] || match[2]);
  }

  const asyncFuncCallPattern = /(\w+)\s*\(\s*\)/g;

  while ((match = asyncFuncCallPattern.exec(cleanCode)) !== null) {
    const funcName = match[1];

    if (asyncFunctionNames.includes(funcName)) {
      // Check if not inside another async context
      let inAsync = false;
      for (const context of asyncContexts) {
        if (match.index > context.start && match.index < context.end) {
          inAsync = true;
          break;
        }
      }

      if (!inAsync) {
        tasks.push(createTask(TASK_TYPES.PROMISE, `Call ${funcName}()`));
      }
    }
  }

  return tasks;
};

const findRegularFunctions = (cleanCode, asyncContexts, consoleLogs) => {
  const tasks = [];
  const functionPattern =
    /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))(?!\s*async)/g;
  let match;

  while ((match = functionPattern.exec(cleanCode)) !== null) {
    const funcName = match[1] || match[2];

    const beforeMatch = cleanCode.substring(
      Math.max(0, match.index - 10),
      match.index
    );
    if (beforeMatch.includes("async")) continue;

    let isInAsync = false;
    for (const context of asyncContexts) {
      if (match.index > context.start && match.index < context.end) {
        isInAsync = true;
        break;
      }
    }

    if (!isInAsync) {
      const funcStart = match.index;
      const funcBody = cleanCode.substring(funcStart);
      const funcEndMatch = funcBody.match(/\{[\s\S]*?\}/);

      if (funcEndMatch) {
        const funcEnd = funcStart + funcEndMatch.index + funcEndMatch[0].length;
        const hasConsoleInBody = consoleLogs.some(
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

export const parseUserCode = (code) => {
  const cleanCode = removeComments(code);

  const asyncContexts = [
    ...findAsyncFunctions(cleanCode),
    ...findSetTimeoutCalls(cleanCode),
    ...findPromiseCalls(cleanCode),
    ...findQueueMicrotaskCalls(cleanCode),
  ];

  const consoleLogs = findAllConsoleLogs(cleanCode);
  const consoleLogTasks = categorizeConsoleLogs(consoleLogs, asyncContexts);

  const asyncFuncDecls = findAsyncFunctionDeclarations(cleanCode);
  const asyncFuncCalls = findAsyncFunctionCalls(cleanCode, asyncContexts);
  const regularFuncs = findRegularFunctions(
    cleanCode,
    asyncContexts,
    consoleLogs
  );

  return [
    ...consoleLogTasks,
    ...asyncFuncDecls,
    ...asyncFuncCalls,
    ...regularFuncs,
  ];
};
