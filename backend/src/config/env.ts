import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 3000),
  agentBaseUrl: process.env.AGENT_BASE_URL ?? "http://localhost:8000",
  appPublicUrl: process.env.APP_PUBLIC_URL ?? "http://localhost:5173"
};
