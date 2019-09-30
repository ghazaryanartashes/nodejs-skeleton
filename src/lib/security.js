import crypto from 'crypto';
import { Strategy } from 'passport-local';

const pbkdfOptions = {
  iterations: 2000,
  keylength: 128,
  algorithm: 'sha512'
};

/**
 * Generates salt
 *
 * @param  {Integer} Length of the salt
 * @return {String}  Salt
 */
export function generateSalt(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash the given password
 *
 * @param  {String}   password Password
 * @param  {String}   salt     Salt
 * @return {Promise}           Hashed password
 */
export function hashPassword(password, salt) {
  return new Promise((resolve, reject) =>
    crypto.pbkdf2(
      password,
      salt,
      pbkdfOptions.iterations,
      pbkdfOptions.keylength,
      pbkdfOptions.algorithm,
      (err, key) => {
        if (!err) {
          return resolve(key.toString('hex'));
        }
        return reject(err);
      }
    )
  );
}

export function base64Encode(typedArray) {
  return Buffer.from(typedArray).toString('base64');
}

export function base64Decode(encodedString) {
  return new Uint8Array(Buffer.from(encodedString, 'base64'));
}

export function createLocalStrategy(model, role) {
  return new Strategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    (email, password, done) => {
      return model.findOne({ email }).then(entry => {
        if (!entry) {
          return done(null, false, { message: 'Incorrect email.' });
        }
        if (entry.role && entry.role !== role) {
          return done(null, false, { message: 'Incorrect role' });
        }
        return entry
          .verifyPassword(password)
          .then(valid => {
            if (!valid) {
              return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, entry);
          })
          .catch(() => done(null, false, { message: 'Incorrect password.' }));
      });
    }
  );
}
