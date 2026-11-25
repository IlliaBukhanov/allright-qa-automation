import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { TBooking } from "../type/api/TBooking";

export class BookingController {
  constructor(private readonly request: APIRequestContext) {}

  create(data: TBooking): Promise<APIResponse> {
    return this.request.post("/booking", { data });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  update(id: number, data: TBooking, token?: string): Promise<APIResponse> {
    const headers = token === undefined ? undefined : { Cookie: `token=${token}` };
    return this.request.put(`/booking/${id}`, { data, headers });
  }

  delete(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
}
