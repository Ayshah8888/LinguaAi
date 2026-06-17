import { Router, type IRouter } from "express";
import healthRouter from "./health";
import languagesRouter from "./languages";
import levelTestRouter from "./levelTest";
import aiTutorRouter from "./ai-tutor";
import featuresRouter from "./features";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiTutorRouter);
router.use(featuresRouter);
router.use(levelTestRouter);
router.use(languagesRouter);

export default router;
