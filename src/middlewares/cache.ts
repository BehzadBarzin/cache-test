import { NextFunction, Request, RequestHandler, Response, Send } from "express";
import { redis } from "../utils/redis";

// =============================================================================
/**
 * Factory function that creates a cache middleware
 *
 * @param {number | undefined} ttl - time to live in seconds. If not specified,
 * cache doesn't have a ttl and must be manually invalidated
 * @returns {RequestHandler} - cache middleware
 */
export const cache = (ttl: number | undefined): RequestHandler => {
  // Return the cache middleware
  return (req: Request, res: Response, next: NextFunction) => {
    // Cache key is the URL of the request
    const cacheKey = req.originalUrl;

    // Check if the response is already cached
    redis.get(cacheKey, async (err, data) => {
      if (data) {
        // If the response is cached, send it
        res.send(JSON.parse(data));
      } else {
        // If the response is not cached, call the next middleware and cache the response

        // We don't want to send the response twice so we overwrite res.send to a no-op
        // and send the response body to the user.

        // Temporary function to store the original res.send
        const sendOriginal: Send = res.send;

        // Overwrite res.send (make sure to use regular function, and use .call below to invoke it)
        res.send = function (body) {
          // cache the response
          if (ttl) {
            // Cache with ttl (expiration)
            redis.set(cacheKey, JSON.stringify(body), "EX", ttl);
          } else {
            // Cache with no expiration
            redis.set(cacheKey, JSON.stringify(body));
          }

          // Call the original res.send
          return sendOriginal.call(this, body);
        };

        // Call the next middleware (remember res.send is overwritten)
        next();
      }
    });
  };
};

// =============================================================================
/**
 * Helper function for cache invalidation
 *
 * @param cacheKey string
 */
export const invalidateCache = (cacheKey: string) => {
  redis.del(cacheKey, (err, response) => {
    if (err) throw err;
    console.log(`Cache key "${cacheKey}" invalidated`);
  });
};
