import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "rachapix-server",
    timestamp: new Date().toISOString(),
  });
});
