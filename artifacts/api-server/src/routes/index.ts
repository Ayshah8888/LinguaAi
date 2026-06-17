import { Router, type IRouter } from "express";
import healthRouter from "./health";
import languagesRouter from "./languages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(languagesRouter);

export default router;
