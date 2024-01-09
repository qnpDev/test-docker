import env from "./index";

export const POINT: number = 100;

export const IS_PRODUCTION = env.app.env === "production";
