const maxTimeoutValue = 2147483647;

// eslint-disable-next-line import/prefer-default-export -- this is an util file, there shouldn't be a default export
export function setSafeTimeout(callback: () => void, ms: number): Promise<NodeJS.Timer> {
  return new Promise(resolve => {
    void (async () => {
      if (ms > maxTimeoutValue) {
        await new Promise<void>(resolve2 => {
          void setSafeTimeout(resolve2, ms - maxTimeoutValue);
        });
      }
      return resolve(setTimeout(callback, ms));
    })();
  });
}
