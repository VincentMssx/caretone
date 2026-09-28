import { Hono } from "hono";
import health from "./health";
import processAudio from "./process-audio";

const routes = new Hono();

routes.route("/health", health);
routes.route("/", processAudio);

export default routes;