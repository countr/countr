export const legacyImport = <T>(path: string): Promise<T> => new Promise((resolve, reject) => {
  try {
    const resolvedPath = require.resolve(path);
    void import(resolvedPath).then(imported => resolve(imported as T)).catch((err: unknown) => reject(err));
  } catch (err) {
    reject(err);
  }
});

export const legacyImportDefault = <T>(path: string): Promise<T> => new Promise((resolve, reject) => {
  try {
    const resolvedPath = require.resolve(path);
    void legacyImport<{ default: { default: T } } | { default: T }>(resolvedPath).then(imported => {
      if (
        typeof imported.default === "object" &&
        imported.default &&
        "default" in imported.default
      ) resolve(imported.default.default);
      resolve(imported.default as T);
    })
      .catch((err: unknown) => reject(err));
  } catch (err) {
    reject(err);
  }
});
