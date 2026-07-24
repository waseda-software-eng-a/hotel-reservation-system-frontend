declare module "bun:test" {
  type TestFunction = (name: string, fn: () => void | Promise<void>) => void;

  export const describe: TestFunction;
  export const test: TestFunction;
  export const it: TestFunction;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const expect: <T>(actual: T) => {
    toBe(expected: T): void;
    toEqual(expected: unknown): void;
    toContain(expected: unknown): void;
    toBeInstanceOf(expected: unknown): void;
    toHaveLength(expected: number): void;
    toMatchObject(expected: unknown): void;
    rejects: {
      toThrow(expected?: string | RegExp): Promise<void>;
    };
  };
}
