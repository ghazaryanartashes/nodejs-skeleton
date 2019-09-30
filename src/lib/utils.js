import _ from 'lodash';
import mongoose from 'mongoose';

export function getRandomInt(max, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createResponse(data, message = null, status = 200) {
  const success = status < 400;
  return {
    success,
    message,
    data
  };
}
