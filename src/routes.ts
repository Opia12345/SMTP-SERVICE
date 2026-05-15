import { Router, Request, Response, NextFunction } from "express";
import { sendEmailHandler, sendBulkEmailHandler } from "./emailHandlers";

const router = Router();

function asyncWrap(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

router.post("/send-email", asyncWrap(sendEmailHandler));

router.post("/send-bulk-email", asyncWrap(sendBulkEmailHandler));

export default router;