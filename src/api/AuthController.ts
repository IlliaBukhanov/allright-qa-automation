import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { TAuthRequest } from "../type/api/TAuth";

export class AuthController {
  constructor(private readonly request: APIRequestContext) {}

  authenticate(data: TAuthRequest): Promise<APIResponse> {
    return this.request.post("/auth", { data });
  }
}
