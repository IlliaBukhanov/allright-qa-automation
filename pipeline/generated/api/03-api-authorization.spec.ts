import { randomUUID } from "node:crypto";
import { expect, request as apiRequest, test, type APIRequestContext } from "@playwright/test";
import { AuthController } from "../../../src/api/AuthController";
import { BookingController } from "../../../src/api/BookingController";
import { bookerCredentials } from "../../../src/data/fixture/api/auth";
import { updatedBooking, validBooking } from "../../../src/data/fixture/api/booking";
import type { TBookingCreated } from "../../../src/type/api/TBooking";

test("Reject a booking update with an invalid token and preserve the original booking", async ({ request, baseURL }) => {
  const authenticatedBookings = new BookingController(request);
  let bookingId: number | undefined;
  let anonymousContext: APIRequestContext | undefined;

  const token = await test.step("Authenticate for setup and cleanup", async () => {
    const response = await new AuthController(request).authenticate(bookerCredentials);
    expect(response.status(), "Verify setup authentication succeeded").toBe(200);

    const body: unknown = await response.json();
    const receivedToken =
      typeof body === "object" && body !== null && "token" in body
        ? (body as { token?: unknown }).token
        : undefined;

    expect(typeof receivedToken).toBe("string");
    expect((receivedToken as string).trim().length).toBeGreaterThan(0);
    return receivedToken as string;
  });

  const originalBooking = {
    ...validBooking,
    lastname: `Tester-${randomUUID()}`,
  };

  try {
    await test.step("Create an isolated booking", async () => {
      const response = await authenticatedBookings.create(originalBooking);
      expect(response.status(), "Verify booking creation succeeded").toBe(200);

      const body: TBookingCreated = await response.json();
      expect(Number.isSafeInteger(body.bookingid) && body.bookingid > 0, "Verify the created booking has a positive identifier").toEqual(true);
      bookingId = body.bookingid;
    });

    anonymousContext = await apiRequest.newContext({
      baseURL,
      storageState: { cookies: [], origins: [] },
    });

    await test.step("Attempt to update the booking with an invalid token", async () => {
      const changedBooking = {
        ...updatedBooking,
        lastname: originalBooking.lastname,
      };
      const response = await new BookingController(anonymousContext!).update(
        bookingId!,
        changedBooking,
        "invalid-demo-token",
      );

      expect(response.status(), "Verify the invalid token update was rejected").toBe(403);
    });

    await test.step("Verify the complete original booking remains unchanged", async () => {
      const response = await authenticatedBookings.get(bookingId!);
      expect(response.status(), "Verify the original booking remains available").toBe(200);

      const persistedBooking: unknown = await response.json();
      expect(persistedBooking, "Verify the persisted booking matches the original booking").toEqual(originalBooking);
    });
  } finally {
    try {
      if (bookingId !== undefined) {
        await test.step("Delete the booking created by this test and verify its absence", async () => {
          const deleteResponse = await authenticatedBookings.delete(bookingId!, token);
          expect(deleteResponse.status(), "Verify booking cleanup succeeded").toBe(201);

          const getResponse = await authenticatedBookings.get(bookingId!);
          expect(getResponse.status(), "Verify the deleted booking is absent").toBe(404);
        });
      }
    } finally {
      await anonymousContext?.dispose();
    }
  }
});
