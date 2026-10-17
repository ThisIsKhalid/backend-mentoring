// [v2 NEW]: Centralized Global Error Handler Middleware
// Must have 4 parameters (err, req, res, next) so Express recognizes it as an error middleware.

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle invalid BSON / MongoDB ObjectId errors
  if (err.name === 'BSONError' || err.message?.includes('input must be a 24 character hex string')) {
    statusCode = 400;
    message = 'Invalid ID format provided';
  }

  // Handle JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON syntax in request body';
  }

  // Send formatted JSON error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
