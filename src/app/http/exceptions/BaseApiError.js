import BaseError from './BaseError';

export default class BaseApiError extends BaseError {
  constructor(message, status = 500, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }

  toJSON() {
    const obj = {
      name: this.name,
      status: this.status,
      message: this.message
    };
    if (this.details) {
      obj.details = this.details;
    }
    return obj;
  }
}
