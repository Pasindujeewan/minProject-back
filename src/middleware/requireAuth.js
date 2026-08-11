import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/verifyToken.js";

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(
      new ApiError(401, "Access token is required", "ACCESS_TOKEN_REQUIRED"),
    );
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return next(
      new ApiError(401, "Access token is required", "ACCESS_TOKEN_REQUIRED"),
    );
  }

  try {
    const { userId } = verifyAccessToken(token);

    if (!userId) {
      return next(new ApiError(401, "Unauthorized", "UNAUTHORIZED"));
    }

    req.userId = userId;
    return next();
  } catch (error) {
    return next(error);
  }
};

export default requireAuth;
