// [v2 NEW]: Higher-order function that catches async errors and forwards them to next(err)
// This eliminates repetitive try/catch blocks across all controllers.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
