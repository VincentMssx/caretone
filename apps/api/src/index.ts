import { Hono } from "hono";
import middleware from "./middleware";
import routes from "./routes";

const api = new Hono();

api.route("/", middleware);
api.route("/api", routes);

Bun.serve({
  port: 3000,
  fetch: api.fetch,
});