import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token has expired — please log in again'
        : 'Invalid token';
    return res.status(401).json({ status: 'error', message });
  }
};

/**
 * Attaches req.user when a valid Bearer token is present, but does NOT fail
 * the request when missing or invalid. Used for guest-checkout style endpoints
 * where login is optional.
 */
export const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // ignore — proceed as guest
  }
  next();
};
