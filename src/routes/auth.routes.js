import { Router } from "express";
import { register } from "../controllers/auth.register.controller.js";
import { login } from "../controllers/auth.login.controller.js";
import { refreshAccessToken } from "../controllers/refreshtoken.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

export default router;
