export const legacyImport = <T>(path: string): Promise<T> => new Promise((resolve, reject) => {
  try {
    const resolvedPath = require.resolve(path);
    console.log("legacyImport", { path, resolvedPath });
    void import(resolvedPath).then(imported => resolve(imported as T)).catch(reject);
  } catch (err) {
    reject(err);
  }
});

export const legacyImportDefault = <T>(path: string): Promise<T> => new Promise((resolve, reject) => {
  try {
    const resolvedPath = require.resolve(path);
    console.log("legacyImportDefault", { path, resolvedPath });
    void legacyImport<{ default: { default: T } } | { default: T }>(resolvedPath).then(imported => {
      if (
        typeof imported.default === "object" &&
        imported.default &&
        "default" in imported.default
      ) resolve(imported.default.default);
      resolve(imported.default as T);
    })
      .catch(reject);
  } catch (err) {
    reject(err);
  }
});
