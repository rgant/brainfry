export type PromiseRejecter = (reason?: unknown) => void;
export type PromiseResolver<T> = (val: T | PromiseLike<T>) => void;
