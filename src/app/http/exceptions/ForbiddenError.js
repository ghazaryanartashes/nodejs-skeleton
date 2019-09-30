import BaseApiError from './BaseApiError';

const DEFAULT_FORBIDDEN_MESSAGE =
  'Current resource either does not exist' +
  ' or not enough permissions for' +
  ' accessing the resource.';

export default class ForbiddenError extends BaseApiError {
  constructor(message = DEFAULT_FORBIDDEN_MESSAGE, details = null) {
    super(message, 403, details);
  }
}
