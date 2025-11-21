let counter = 0;

export const generateId = (prefix: string) => {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
};

export const resetIdCounterForTests = () => {
  counter = 0;
};
