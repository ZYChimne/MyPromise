# MyPromise

Implement an A+ Promise in es2022 and TypeScript. 
* then
* catch
* all
* race
* allSettled
* any
* finally
* reject
* resolve

## Run Promise A+ Test

```bash
# yarn
yarn
tsc MyPromise.ts # need to install typescript globally first
yarn test
```

## Compiled JavaScript Code

```js
'use strict';
class MyPromise {
  constructor(func) {
    this.PENDING = 'pending';
    this.FULFILLED = 'fulfilled';
    this.REJECTED = 'rejected';
    this.PromiseState = this.PENDING;
    this.then = (onfulfilled, onrejected) => {
      if (typeof onfulfilled !== 'function')
        onfulfilled = (value) => {
          return value;
        };
      if (typeof onrejected !== 'function')
        onrejected = (reason) => {
          throw reason;
        };
      const newPromise = new MyPromise((resolve, reject) => {
        switch (this.PromiseState) {
          case this.FULFILLED: {
            setTimeout(() => {
              try {
                this.resolvePromise(
                  newPromise,
                  onfulfilled(this.PromiseResult),
                  resolve,
                  reject
                );
              } catch (error) {
                reject(error);
              }
            });
            break;
          }
          case this.REJECTED: {
            setTimeout(() => {
              try {
                this.resolvePromise(
                  newPromise,
                  onrejected(this.PromiseResult),
                  resolve,
                  reject
                );
              } catch (error) {
                reject(error);
              }
            });
            break;
          }
          case this.PENDING: {
            this.onfulfilledCallbacks.push(() => {
              try {
                this.resolvePromise(
                  newPromise,
                  onfulfilled(this.PromiseResult),
                  resolve,
                  reject
                );
              } catch (error) {
                reject(error);
              }
            });
            this.onrejectedCallbacks.push(() => {
              try {
                this.resolvePromise(
                  newPromise,
                  onrejected(this.PromiseResult),
                  resolve,
                  reject
                );
              } catch (error) {
                reject(error);
              }
            });
            break;
          }
        }
      });
      return newPromise;
    };
    this.catch = (onrejected) => {
      return this.then(undefined, onrejected);
    };
    this.all = (values) => {
      return new MyPromise((resolve, reject) => {
        try {
          const result = [];
          let cnt = 0;
          let iterator = values[Symbol.iterator]();
          while (iterator.done === false) {
            this.resolve(iterator.value).then(
              (value) => {
                result[cnt] = value;
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
          reject(error);
        }
      });
    };
    this.race = (values) => {
      return new MyPromise((resolve, reject) => {
        try {
          let iterator = values[Symbol.iterator]();
          while (iterator.done === false) {
            this.resolve(iterator.value).then(resolve, reject);
            iterator = iterator.next();
          }
        } catch (error) {
          reject(error);
        }
      });
    };
    this.allSettled = (values) => {
      return new MyPromise((resolve, reject) => {
        try {
          const result = [];
          let cnt = 0;
          let iterator = values[Symbol.iterator]();
          while (iterator.done === false) {
            this.resolve(iterator.value).then(
              (value) => {
                result[cnt] = {
                  status: this.FULFILLED,
                  value: value,
                };
                cnt += 1;
                if (iterator.next().done) {
                  resolve(result);
                }
              },
              (reason) => {
                result[cnt] = {
                  status: this.REJECTED,
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
          reject(error);
        }
      });
    };
    this.any = (values) => {
      return new MyPromise((resolve, reject) => {
        try {
          const result = [];
          let cnt = 0;
          let iterator = values[Symbol.iterator]();
          while (iterator.done === false) {
            this.resolve(iterator.value).then(
              (value) => {
                resolve(value);
              },
              (reason) => {
                result[cnt] = {
                  status: this.REJECTED,
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
          reject(error);
        }
      });
    };
    this.finally = (onfinally) => {
      return this.then(
        (value) => this.resolve(onfinally).then(() => value),
        (reason) =>
          this.resolve(onfinally).then(() => {
            throw reason;
          })
      );
    };
    // prototype: Promise<any>;
    this.reject = (reason) => {
      return new MyPromise(() => {
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
    this.resolve = (value) => {
      return new MyPromise(() => {
        if (this.PromiseState === this.PENDING) {
          setTimeout(() => {
            this.PromiseState = this.FULFILLED;
            this.PromiseResult = value;
            this.onfulfilledCallbacks.forEach((callback) => {
              if (typeof callback === 'function') {
                callback();
              }
            });
          });
        }
      });
    };
    this.resolvePromise = (prePromise, curPromise, resolve, reject) => {
      if (prePromise === curPromise) {
        const error = new TypeError('Chaining Promise is not allowed');
        if (typeof reject === 'function') {
          reject(error);
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
              resolve(curPromise.PromiseResult);
            } else {
              if (typeof reject === 'function') {
                reject(new TypeError('resolve is not a function'));
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
          then = curPromise.then;
        } catch (error) {
          if (typeof reject === 'function') {
            reject(error);
          } else {
            throw new TypeError('reject is not a function');
          }
        }
        if (typeof then === 'function') {
          let called = false;
          try {
            then.call(
              curPromise,
              (newPromise) => {
                if (called) return;
                called = true;
                this.resolvePromise(prePromise, newPromise, resolve, reject);
              },
              (reason) => {
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
              reject(error);
            } else {
              throw new TypeError('reject is not a function');
            }
          }
        } else {
          if (typeof resolve === 'function') {
            resolve(curPromise);
          } else {
            if (typeof reject === 'function') {
              reject(new TypeError('resolve is not a function'));
            } else {
              throw new TypeError('reject is not a function');
            }
          }
        }
      } else {
        if (typeof resolve === 'function') {
          resolve(curPromise);
        } else {
          if (typeof reject === 'function') {
            reject(new TypeError('resolve is not a function'));
          } else {
            throw new TypeError('reject is not a function');
          }
        }
      }
    };
    this.PromiseState = this.PENDING;
    this.onfulfilledCallbacks = [];
    this.onrejectedCallbacks = [];
    try {
      func(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  get [Symbol.toStringTag]() {
    return 'MyPromise';
  }
  get [Symbol.species]() {
    return MyPromise;
  }
  static {
    this.deferred = () => {
      const result = {};
      result.promise = new MyPromise((resolve, reject) => {
        result.resolve = resolve;
        result.reject = reject;
      });
      return result;
    };
  }
}
```
