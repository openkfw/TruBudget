import { Request } from "express";
import jwt from "jsonwebtoken";
import logger from "./logger";
import config from "./config";

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

export const verifyUserJWT = (req: Request, res, next): void => {
  logger.trace("Verifying User-JWT ...");
  const token: string = getJWTToken(req);

  verifyJWTToken(token)
    .then((decodedToken: AuthUserToken) => {
      res.locals.userId = decodedToken.userId;
      next();
    })
    .catch((err) => {
      logger.error({ err, token }, "User-JWT invalid");
      const body: InvalidJWTResponseBody = { message: "Invalid JWT token provided." };
      res.status(400).json(body);
    });
};
export const verifyNotificationJWT = (req: Request, res, next): void => {
  logger.debug("Verifying Notification-JWT ...");
  const token: string = getJWTToken(req);

  verifyJWTToken(token)
    .then((decodedToken: AuthNotificationToken) => {
      res.locals.id = decodedToken.id;
      next();
    })
    .catch((err) => {
      logger.error({ err, token }, "Notification-JWT invalid");
      const body: InvalidJWTResponseBody = { message: "Invalid JWT token provided." };
      res.status(400).json(body);
    });
};

const verifyJWTToken = (token: string): Promise<AuthUserToken | AuthNotificationToken> => {
  const secret =
    config.jwt.algorithm === "RS256"
      ? Buffer.from(config.jwt.publicKey, "base64").toString()
      : config.jwt.secretOrPrivateKey;
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret as string,
      { algorithms: [config.jwt.algorithm] },
      (err, decodedToken: AuthUserToken) => {
        if (err || !decodedToken) {
          return reject(err);
        }

        resolve(decodedToken);
      },
    );
  });
};

function getJWTToken(req: Request): string {
  if (req.cookies && req.cookies.token) {
    req.headers.authorization = `Bearer ${req.cookies.token}`;
  }
  let token: string = (req.headers["x-access-token"] as string) || req.headers.authorization || "";
  logger.debug(`Provided JWT-TOKEN: ${token}`);
  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  return token;
}
