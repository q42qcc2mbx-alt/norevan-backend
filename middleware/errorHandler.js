export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${err.message}`);
  if (statusCode === 500) console.error(err.stack);

  const body = {
    status: 'error',
    message:
      statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  };

  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
