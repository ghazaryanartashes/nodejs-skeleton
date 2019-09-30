import BadRequestError from './BadRequestError';

export default class ValidationError extends BadRequestError {
  static fromMongoose(err) {
    const error = err.errors[Object.keys(err.errors)[0]];
    return new ValidationError(error.message, [
      {
        path: error.path,
        value: error.value,
        message: error.message
      }
    ]);
  }
}
