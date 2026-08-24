/** Minimal ports used by the diagnostic endpoint in each runtime. */
export interface DiagnosticDependencies {
  database: {
    probe(): Promise<void>;
  };
  objectStore: {
    delete(key: string): Promise<void>;
    get(key: string): Promise<string | null>;
    put(key: string, value: string): Promise<void>;
  };
}
