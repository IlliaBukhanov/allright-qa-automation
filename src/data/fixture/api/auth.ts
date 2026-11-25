import type { TAuthRequest } from "../../../type/api/TAuth";

/** Public demo defaults. Use environment variables for private deployments. */
export const bookerCredentials: TAuthRequest = {
  username: process.env.BOOKER_USERNAME ?? "admin",
  password: process.env.BOOKER_PASSWORD ?? "password123",
};
