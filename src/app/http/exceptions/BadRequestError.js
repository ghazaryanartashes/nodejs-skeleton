import BaseApiError from './BaseApiError';

export default class BadRequestError extends BaseApiError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}
