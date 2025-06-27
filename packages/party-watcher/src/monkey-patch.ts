// packages/party-watcher/src/monkey-patch.ts

// Monkey-patch the global fetch to remove the unsupported `cache` option.
const originalFetch = global.fetch;
global.fetch = (input, init) => {
  const { cache, ...rest } = init || {};
  return originalFetch(input, rest);
};
