const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const fail = (res, errors) =>
  res.status(400).json({ status: 'error', message: 'Validation failed', errors });

export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || !USERNAME_REGEX.test(username)) {
    errors.push('username must be 3–20 characters and contain only letters, numbers or underscores');
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('a valid email address is required');
  }
  if (!password || password.length < 8) {
    errors.push('password must be at least 8 characters');
  }
  if (password && !/[A-Z]/.test(password)) {
    errors.push('password must contain at least one uppercase letter');
  }
  if (password && !/[0-9]/.test(password)) {
    errors.push('password must contain at least one digit');
  }

  if (errors.length) return fail(res, errors);
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push('a valid email address is required');
  }
  if (!password) {
    errors.push('password is required');
  }

  if (errors.length) return fail(res, errors);
  next();
};
