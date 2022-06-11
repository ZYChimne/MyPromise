// es2022
class MyPromise<T> implements Promise<T> {
  PENDING = 'pending';
  FULFILLED = 'fulfilled';
  REJECTED = 'rejected';
  onfulfilledCallbacks: (() => void)[];
  onrejectedCallbacks: (() => void)[];
  get [Symbol.toStringTag]() {
    return 'MyPromise';
  }
  get [Symbol.species]() {
    return MyPromise;
  }
  constructor(
    func: (arg0: (result: T) => void, arg1: (reason: T) => void) => void
  ) {
    this.PromiseState = this.PENDING;
    this.onfulfilledCallbacks = [];
    this.onrejectedCallbacks = [];
    try {
      func(this.resolve, this.reject);
    } catch (error) {
      this.reject(error as T);
    }
  }
  PromiseState = this.PENDING;
  PromiseResult: T | undefined;
  then = <TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined
  ): MyPromise<TResult1 | TResult2> => {
    if (typeof onfulfilled !== 'function')
      onfulfilled = (value) => {
        return value as any;
      };
    if (typeof onrejected !== 'function')
      onrejected = (reason) => {
        throw reason;
      };
    const newPromise = new MyPromise<T>((resolve, reject) => {
      switch (this.PromiseState) {
        case this.FULFILLED: {
          setTimeout(() => {
            try {
              this.resolvePromise(
                newPromise,
                (onfulfilled as Function)(this.PromiseResult) as unknown as
                  | T
                  | PromiseLike<T>
                  | undefined,
                resolve as unknown as (result: T) => void,
                reject as unknown as (result: T) => void
              );
            } catch (error) {
              reject(error as any);
            }
          });
          break;
        }
        case this.REJECTED: {
          setTimeout(() => {
            try {
              this.resolvePromise(
                newPromise,
                (onrejected as Function)(this.PromiseResult) as unknown as
                  | T
                  | PromiseLike<T>
                  | undefined,
                resolve as unknown as (result: T) => void,
                reject as unknown as (result: T) => void
              );
            } catch (error) {
              reject(error as any);
            }
          });
          break;
        }
        case this.PENDING: {
          this.onfulfilledCallbacks.push(() => {
            try {
              this.resolvePromise(
                newPromise,
                (onfulfilled as Function)(this.PromiseResult) as unknown as
                  | T
                  | PromiseLike<T>
                  | undefined,
                resolve as unknown as (result: T) => void,
                reject as unknown as (result: T) => void
              );
            } catch (error) {
              reject(error as any);
            }
          });
          this.onrejectedCallbacks.push(() => {
            try {
              this.resolvePromise(
                newPromise,
                (onrejected as Function)(this.PromiseResult) as unknown as
                  | T
                  | PromiseLike<T>
                  | undefined,
                resolve as unknown as (result: T) => void,
                reject as unknown as (result: T) => void
              );
            } catch (error) {
              reject(error as any);
            }
          });
          break;
        }
      }
    });
    return newPromise as unknown as MyPromise<TResult1 | TResult2>;
  };
  catch = <TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): Promise<T | TResult> => {
    return this.then(undefined, onrejected);
  };
  // all<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<Awaited<T>[]>;
  // all<T extends readonly unknown[] | []>(
  //   values: T
  // ): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }>;
  all = (
    values: unknown
  ):
    | MyPromise<Awaited<T>[]>
    | MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> => {
    return new MyPromise<Awaited<T>[]>((resolve, reject) => {
      try {
        const result: Awaited<T>[] = [];
        let cnt = 0;
        let iterator = (values as any)[Symbol.iterator]();
        while (iterator.done === false) {
          this.resolve(iterator.value).then(
            (value) => {
              result[cnt] = value as Awaited<T>;
              cnt += 1;
              if (iterator.next().done) {
                resolve(result);
              }
            },
            (reason) => {
              reject(reason);
            }
          );
          iterator = iterator.next();
        }
      } catch (error) {
        reject(error as Awaited<T>[]);
      }
    });
  };
  // race<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<Awaited<T>>;
  // race<T extends readonly unknown[] | []>(
  //   values: T
  // ): MyPromise<Awaited<T[number]>>;
  race = (values: unknown): MyPromise<Awaited<T>> | MyPromise<Awaited<T[]>> => {
    return new MyPromise<Awaited<T>>((resolve, reject) => {
      try {
        let iterator = (values as any)[Symbol.iterator]();
        while (iterator.done === false) {
          this.resolve(iterator.value).then(
            resolve as ((value: T) => void | PromiseLike<void>) &
              ((value: void) => void | PromiseLike<void>),
            reject
          );
          iterator = iterator.next();
        }
      } catch (error) {
        reject(error as Awaited<T>);
      }
    });
  };
  // allSettled<T extends readonly unknown[] | []>(
  //   values: T
  // ): MyPromise<{
  //   -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>;
  // }>;
  // allSettled<T>(
  //   values: Iterable<T | PromiseLike<T>>
  // ): MyPromise<PromiseSettledResult<Awaited<T>>[]>;
  allSettled = (
    values: unknown
  ):
    | Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>> }>
    | MyPromise<PromiseSettledResult<Awaited<T>>[]> => {
    return new MyPromise<PromiseSettledResult<Awaited<T>>[]>(
      (resolve, reject) => {
        try {
          const result: PromiseSettledResult<Awaited<T>>[] = [];
          let cnt = 0;
          let iterator = (values as any)[Symbol.iterator]();
          while (iterator.done === false) {
            this.resolve(iterator.value).then(
              (value) => {
                result[cnt] = {
                  status: this.FULFILLED as 'fulfilled',
                  value: value as Awaited<T>,
                };
                cnt += 1;
                if (iterator.next().done) {
                  resolve(result);
                }
              },
              (reason) => {
                result[cnt] = {
                  status: this.REJECTED as 'rejected',
                  reason: reason,
                };
                cnt += 1;
                if (iterator.next().done) {
                  resolve(result);
                }
              }
            );
            iterator = iterator.next();
          }
        } catch (error) {
          reject(error as PromiseSettledResult<Awaited<T>>[]);
        }
      }
    );
  };
  // any<T extends readonly unknown[] | []>(
  //   values: T
  // ): MyPromise<Awaited<T[number]>>;
  // any<T>(values: Iterable<T | PromiseLike<T>>): MyPromise<Awaited<T>>;
  any = (values: unknown): MyPromise<Awaited<T[]>> | MyPromise<Awaited<T>> => {
    return new MyPromise<Awaited<T[]>>((resolve, reject) => {
      try {
        const result: Awaited<T>[] = [];
        let cnt = 0;
        let iterator = (values as any)[Symbol.iterator]();
        while (iterator.done === false) {
          this.resolve(iterator.value).then(
            (value) => {
              resolve(value as any);
            },
            (reason) => {
              result[cnt] = {
                status: this.REJECTED,
                reason: reason,
              } as unknown as Awaited<T>;
              cnt += 1;
              if (iterator.next().done) {
                resolve(result);
              }
            }
          );
          iterator = iterator.next();
        }
      } catch (error) {
        reject(error as Awaited<T>[]);
      }
    });
  };
  finally = (onfinally?: (() => void) | null | undefined): MyPromise<T> => {
    return this.then(
      (value) => this.resolve(onfinally).then(() => value),
      (reason) =>
        this.resolve(onfinally).then(() => {
          throw reason;
        })
    );
  };
  // prototype: Promise<any>;
  reject = <T = never>(reason?: any): MyPromise<T> => {
    return new MyPromise<T>(() => {
      if (this.PromiseState === this.PENDING) {
        setTimeout(() => {
          this.PromiseState = this.REJECTED;
          this.PromiseResult = reason;
          this.onrejectedCallbacks.forEach((callback) => {
            if (typeof callback === 'function') {
              callback();
            }
          });
        });
      }
    });
  };
  // resolve(): MyPromise<void>;
  // resolve<T>(value: T | PromiseLike<T>): MyPromise<T>;
  resolve = (value?: unknown): MyPromise<void> | MyPromise<T> => {
    return new MyPromise<T>(() => {
      if (this.PromiseState === this.PENDING) {
        setTimeout(() => {
          this.PromiseState = this.FULFILLED;
          this.PromiseResult = value as T | undefined;
          this.onfulfilledCallbacks.forEach((callback) => {
            if (typeof callback === 'function') {
              callback();
            }
          });
        });
      }
    });
  };
  resolvePromise = (
    prePromise: MyPromise<T>,
    curPromise?: T | PromiseLike<T>,
    resolve?: (result: T) => void,
    reject?: (reason: T) => void
  ) => {
    if (prePromise === curPromise) {
      const error = new TypeError('Chaining Promise is not allowed');
      if (typeof reject === 'function') {
        reject(error as any);
      } else {
        throw error;
      }
    } else if (curPromise instanceof MyPromise) {
      switch (curPromise.PromiseState) {
        case this.PENDING: {
          curPromise.then((res) => {
            this.resolvePromise(prePromise, res, resolve, reject);
          }, reject);
          break;
        }
        case this.FULFILLED: {
          if (typeof resolve === 'function') {
            resolve(curPromise.PromiseResult as T);
          } else {
            if (typeof reject === 'function') {
              reject(new TypeError('resolve is not a function') as any);
            } else {
              throw new TypeError('reject is not a function');
            }
          }
          break;
        }
        case this.REJECTED: {
          if (reject) {
            reject(curPromise.PromiseResult);
          } else {
            throw new TypeError('reject is not a function');
          }
          break;
        }
      }
    } else if (
      curPromise &&
      (typeof curPromise === 'function' || typeof curPromise === 'object')
    ) {
      let then;
      try {
        then = (curPromise as any).then;
      } catch (error) {
        if (typeof reject === 'function') {
          reject(error as T);
        } else {
          throw new TypeError('reject is not a function');
        }
      }
      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            curPromise,
            (newPromise: T | PromiseLike<T> | undefined) => {
              if (called) return;
              called = true;
              this.resolvePromise(prePromise, newPromise, resolve, reject);
            },
            (reason: T) => {
              if (called) return;
              called = true;
              if (typeof reject === 'function') {
                reject(reason);
              } else {
                throw new TypeError('reject is not a function');
              }
            }
          );
        } catch (error) {
          if (called) return;
          called = true;
          if (typeof reject === 'function') {
            reject(error as T);
          } else {
            throw new TypeError('reject is not a function');
          }
        }
      } else {
        if (typeof resolve === 'function') {
          resolve(curPromise as T);
        } else {
          if (typeof reject === 'function') {
            reject(new TypeError('resolve is not a function') as any);
          } else {
            throw new TypeError('reject is not a function');
          }
        }
      }
    } else {
      if (typeof resolve === 'function') {
        resolve(curPromise as T);
      } else {
        if (typeof reject === 'function') {
          reject(new TypeError('resolve is not a function') as any);
        } else {
          throw new TypeError('reject is not a function');
        }
      }
    }
  };
  static deferred = () => {
    const result: {
      promise?: MyPromise<unknown>;
      resolve?: (result: unknown) => void;
      reject?: (reason: unknown) => void;
    } = {};
    result.promise = new MyPromise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
    });
    return result;
  };
}
