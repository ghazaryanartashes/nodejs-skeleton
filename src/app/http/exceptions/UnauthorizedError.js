import BaseApiError from './BaseApiError';

export default class UnauthorizedError extends BaseApiError {
  constructor(message, details = null) {
    super(message, 401, details);
  }
}
