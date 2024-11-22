import { memoryCheck } from "./checks/memory.js";
import { CheckRegistry, HealthCheck } from "./checks/types.js";
import { type Config, Status } from "./index.js";

const checks: CheckRegistry = {
  memoryUsage: memoryCheck,
};

export const healthcheckHandler = async (
  headers: Record<string, string | undefined>,
  config: Config
) => {
  const acceptHeader = headers["accept"];
  let status: Status = Status.pass;
  let results: Record<string, HealthCheck> = {};

  const checkPromises = Object.entries(config.checks)
    .filter(([_, enabled]) => enabled)
    .map(async ([checkName]) => {
      if (checks[checkName]) {
        results[checkName] = await checks[checkName]();

        // @ts-expect-error
        if ([Status.fail, Status.warn].includes(results[checkName].status)) {
          // @ts-expect-error
          status = results[checkName].status;
        }
      }
    });

  await Promise.all(checkPromises);

  const statusIcon = status === Status.pass ? "✅" : status === Status.warn ? "⚠️" : "❌";

  if (acceptHeader && acceptHeader.includes("text/html")) {
    return {
      type: "text/html",
      body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Health Check</title>
            </head>
            <body>
              <h1>${statusIcon} Health Check: ${status}</h1>
              <ul>
                ${Object.entries(results)
                  .map(([checkName, checkResult]) => `<li>${checkName}: ${checkResult.value}</li>`)
                  .join("")}
              </ul>
            </body>
            </html>
          `,
    };
  } else {
    return {
      type: "application/json",
      body: JSON.stringify({
        status,
        description: "Health check response, generated by allgood.",
        checks,
      }),
    };
  }
};
