import BaseApiError from './BaseApiError';

export default class NotFoundError extends BaseApiError {
  constructor(message, details = null) {
    super(message, 404, details);
  }
}
