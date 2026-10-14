import { handle } from "../server/service.mjs";
export default { fetch: handleRequest };
async function handleRequest(request) {
  return handle(request);
}
