import Person from "@api/user";
import News from "@api/notice";
import { Response, Request, NextFunction } from "express";
import { validationResult } from "express-validator";
import { verify } from "jsonwebtoken";

const { ACCTOKEN_SECRET } = process.env;

export declare interface newRequest extends Request {
  newArticle?: News;
}

export declare interface authenticatedRequest extends Request {
  person?: Person;
}

export interface authenticatedNewRequest
  extends newRequest,
    authenticatedRequest {}

export function newExists(req: newRequest, res: Response, next: NextFunction) {
  req.newArticle = new News(req.params.path);

  req.newArticle
    .get()
    .then(() => next())
    .catch((err: Error) => res.status(404).send(err.message));
}

export function validation(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  return next();
}

export function auth(
  req: authenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader === undefined) throw new Error("No token!");

    const token = authHeader.split("Bearer ")[1];
    if (!token) throw new Error("No token!");

    verify(token, ACCTOKEN_SECRET as string, (err, dec) => {
      if (err)
        return res.sendStatus(err.name === "TokenExpiredError" ? 403 : 405);
      req.person = new Person(dec?.username);

      req.person
        .get()
        .then((personObj: unknown) => {
          if (personObj === null) return res.sendStatus(404);
          next();
        })
        .catch((getErr: Error) => res.status(500).send(getErr));
    });
  } catch {
    return res.sendStatus(401);
  }
}

export function isOwnerOfNew(
  req: authenticatedNewRequest,
  res: Response,
  next: NextFunction
) {
  newExists(req, res, () =>
    auth(req, res, () => {
      if (req.newArticle === null || req.person === null)
        throw new Error("Not new article or person in the request!");
      if (req.newArticle?.article.author === req.person?.data._id)
        return res.sendStatus(403);

      next();
    })
  );
}
