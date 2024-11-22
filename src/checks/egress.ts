import { Status } from "../index.js";
import { HealthCheck } from "./types.js";

const checkEgress = async () => {
  const testUrls = [
    'https://1.1.1.1', // Cloudflare DNS
    'https://8.8.8.8'  // Google DNS
  ];

  for (const url of testUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
    }
  }

  return false;
}
export const egress = async(): Promise<HealthCheck> => {
  const start = Date.now();
  const result = await checkEgress();
  return {
    status: result ? Status.pass : Status.fail,
    value: result ? "true" : "false",
    componentName: "egress",
    message: result ? "Outbound internet is working" : "Outbound internet is not working",
    time: Date.now() - start,
  }
}
