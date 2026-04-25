import { Router } from "express";

import { authRoutes } from "../modules/auth/auth.routes.js";
import { chargeRoutes } from "../modules/charges/charge.routes.js";
import { expenseRoutes } from "../modules/expenses/expense.routes.js";
import { friendRoutes } from "../modules/friends/friend.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { healthRoutes } from "./health.routes.js";

export const routes = Router();

routes.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});
routes.use("/auth", authRoutes);
routes.use(userRoutes);
routes.use("/friends", friendRoutes);
routes.use("/expenses", expenseRoutes);
routes.use("/me/charges", chargeRoutes);
routes.use("/health", healthRoutes);
