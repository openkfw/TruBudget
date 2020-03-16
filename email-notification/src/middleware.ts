import { Request } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";

interface InvalidJWTResponseBody {
  message: string;
}

interface AuthUserToken {
  userId: string;
  address: string;
  organization: string;
  organizationAddress: string;
  groups: string[];
  iat: number;
  exp: number;
}
interface AuthNotificationToken {
  id: string;
  iat: number;
  exp: number;
}

export const verifyUserJWT = (req: Request, res, next, secret: string) => {
  const token: string = getJWTToken(req);

  verifyJWTToken(token, secret)
    .then((decodedToken: AuthUserToken) => {
      res.locals.userId = decodedToken.userId;
      next();
    })
    .catch(err => {
      const body: InvalidJWTResponseBody = { message: "Invalid JWT token provided." };
      res.status(400).json(body);
    });
};
export const verifyNotificationJWT = (req: Request, res, next, secret: string) => {
  const token: string = getJWTToken(req);

  verifyJWTToken(token, secret)
    .then((decodedToken: AuthNotificationToken) => {
      res.locals.id = decodedToken.id;
      next();
    })
    .catch(err => {
      const body: InvalidJWTResponseBody = { message: "Invalid JWT token provided." };
      res.status(400).json(body);
    });
};

const verifyJWTToken = (
  token: string,
  secret: string,
): Promise<AuthUserToken | AuthNotificationToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decodedToken: AuthUserToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }

      resolve(decodedToken);
    });
  });
};
function getJWTToken(req: Request): string {
  let token: string = (req.headers["x-access-token"] as string) || req.headers.authorization || "";
  logger.debug(`Provided JWT-TOKEN: ${token}`);
  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  return token;
}
