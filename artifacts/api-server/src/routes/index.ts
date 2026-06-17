import { Router, type IRouter } from "express";
import healthRouter from "./health";
import languagesRouter from "./languages";
import levelTestRouter from "./levelTest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(levelTestRouter);
router.use(languagesRouter);

export default router;
