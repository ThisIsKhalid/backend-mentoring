import rateLimit from 'express-rate-limit';

/**
 * [v6 NEW]: Global API Rate Limiter
 * Limits each IP to 100 requests per 15-minute window
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * [v6 NEW]: Strict Auth Rate Limiter
 * Protects login and register endpoints against brute-force & credential stuffing
 * Limits each IP to 10 requests per 15-minute window
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
