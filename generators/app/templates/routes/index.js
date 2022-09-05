import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Ignition!");
});

export default router;
