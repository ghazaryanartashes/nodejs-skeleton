export default class BaseController {
  constructor() {}

  _createResponse(data, message = null, status = 200) {
    const success = status < 400;
    return {
      success,
      message,
      data
    };
  }

  register(router) {}
}

