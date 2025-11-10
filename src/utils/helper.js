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