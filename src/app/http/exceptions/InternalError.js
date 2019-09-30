import { ExtendableBuiltin } from './utils';

export class InternalError extends ExtendableBuiltin(Error) {
  constructor(errcode, message) {
    super(message);
    this.message = message;
    this.errcode = errcode;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}
