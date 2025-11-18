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
  
  let cleanCode = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

  const consoleLogPattern = /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  const asyncContexts = [];
  const asyncFunctionPattern = /async\s+function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)\}/g;

  let match;
  
  while ((match = asyncFunctionPattern.exec(cleanCode)) !== null) {
    const funcName = match[1];
    const body = match[2];
    asyncContexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
      isAsyncFunction: true,
      functionName: funcName
    });
  }
  
  const asyncArrowPattern = /(?:const|let|var)\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)\}/g;
  
  while ((match = asyncArrowPattern.exec(cleanCode)) !== null) {
    const funcName = match[1];
    const body = match[2];
    asyncContexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
      isAsyncFunction: true,
      functionName: funcName
    });
  }
  
  const awaitPattern = /await\s+([^\s;]+)/g;
  
  while ((match = awaitPattern.exec(cleanCode)) !== null) {
    let inAsyncFunc = false;
    for (const context of asyncContexts) {
      if (context.isAsyncFunction && match.index > context.start && match.index < context.end) {
        inAsyncFunc = true;
        break;
      }
    }
    
    if (inAsyncFunc) {
      const awaitedValue = match[1];
      asyncContexts.push({
        type: TASK_TYPES.PROMISE,
        start: match.index,
        end: match.index + match[0].length,
        body: '',
        isAwait: true,
        awaitedValue: awaitedValue
      });
    }
  }
  
  const setTimeoutPattern = /setTimeout\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,)/g;
  
  while ((match = setTimeoutPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    const delayMatch = cleanCode.substring(match.index).match(/,\s*(\d+)\s*\)/);
    const delay = delayMatch ? parseInt(delayMatch[1]) : 0;
    
    asyncContexts.push({
      type: TASK_TYPES.SETTIMEOUT,
      start: match.index,
      end: match.index + match[0].length,
      body: body,
      delay: delay
    });
  }
  
  const promisePattern = /Promise\.resolve\s*\(\s*\)\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|,|\))/g;
  
  while ((match = promisePattern.exec(cleanCode)) !== null) {
    const body = match[1];
    asyncContexts.push({
      type: TASK_TYPES.PROMISE,
      start: match.index,
      end: match.index + match[0].length,
      body: body
    });
  }
  
  const thenPattern = /\.then\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;
  
  while ((match = thenPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    const beforeContext = cleanCode.substring(Math.max(0, match.index - 20), match.index);
    if (!beforeContext.includes('Promise.resolve()')) {
      asyncContexts.push({
        type: TASK_TYPES.PROMISE,
        start: match.index,
        end: match.index + match[0].length,
        body: body
      });
    }
  }
  
  const queueMicrotaskPattern = /queueMicrotask\s*\(\s*(?:function\s*\([^)]*\)\s*\{|(?:\([^)]*\)|[^,]+)\s*=>\s*\{?)([\s\S]*?)(?:\}|\))/g;
  
  while ((match = queueMicrotaskPattern.exec(cleanCode)) !== null) {
    const body = match[1];
    asyncContexts.push({
      type: TASK_TYPES.QUEUE_MICROTASK,
      start: match.index,
      end: match.index + match[0].length,
      body: body
    });
  }
  
  const allConsoleLogs = [];
  let consoleMatch;
  
  while ((consoleMatch = consoleLogPattern.exec(cleanCode)) !== null) {
    allConsoleLogs.push({
      message: consoleMatch[1],
      index: consoleMatch.index
    });
  }
  
  allConsoleLogs.forEach(log => {
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
      tasks.push(createTask(TASK_TYPES.SYNC, log.message));
    }
  });
  
  const asyncFuncDeclPattern = /async\s+function\s+(\w+)/g;
  
  while ((match = asyncFuncDeclPattern.exec(cleanCode)) !== null) {
    const funcName = match[1];
    tasks.push(createTask(TASK_TYPES.SYNC, `Define async ${funcName}`));
  }
  
  const asyncFuncCallPattern = /(\w+)\s*\(\s*\)/g;
  const asyncFunctionNames = [];
  
  let asyncNameMatch;
  const asyncNamePattern = /async\s+function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*async/g;
  while ((asyncNameMatch = asyncNamePattern.exec(cleanCode)) !== null) {
    asyncFunctionNames.push(asyncNameMatch[1] || asyncNameMatch[2]);
  }
  
  while ((match = asyncFuncCallPattern.exec(cleanCode)) !== null) {
    const funcName = match[1];
    if (asyncFunctionNames.includes(funcName)) {
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
  
  const functionPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))(?!\s*async)/g;
  
  while ((match = functionPattern.exec(cleanCode)) !== null) {
    const funcName = match[1] || match[2];
    const beforeMatch = cleanCode.substring(Math.max(0, match.index - 10), match.index);
    if (beforeMatch.includes('async')) continue;
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
        const hasConsoleInBody = allConsoleLogs.some(log => 
          log.index > funcStart && log.index < funcEnd
        );
        
        if (!hasConsoleInBody) {
          tasks.push(createTask(TASK_TYPES.SYNC, `Define ${funcName}`));
        }
      }
    }
  }
  
  return tasks;
};