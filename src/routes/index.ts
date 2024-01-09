import express, { Router } from "express";
import ClientRoute from "@routes/client";
import AdminRoute from "@routes/admin";
import ZaloRoute from "@routes/zalo";
const route: Router = express.Router();

route.use("/admin", AdminRoute);
route.use("/zalo", ZaloRoute);
route.use("/", ClientRoute);

export default route;
