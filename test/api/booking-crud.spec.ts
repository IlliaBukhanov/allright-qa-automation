import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { AuthController } from "../../src/api/AuthController";
import { BookingController } from "../../src/api/BookingController";
import { bookerCredentials } from "../../src/data/fixture/api/auth";
import { updatedBooking, validBooking } from "../../src/data/fixture/api/booking";
import type { TBooking, TBookingCreated } from "../../src/type/api/TBooking";

test("Create, read, update and delete an authenticated booking", async ({ request }) => {
  const auth = new AuthController(request);
  const bookings = new BookingController(request);
  const lastname = `${validBooking.lastname}-${randomUUID()}`;
  const initial: TBooking = { ...validBooking, lastname };
  const updated: TBooking = { ...updatedBooking, lastname };
  const token = await test.step("Authenticate with Restful Booker", async () => {
    const response = await auth.authenticate(bookerCredentials);
    expect(response.status()).toBe(200);
    const issuedToken: unknown = (await response.json()).token;
    if (typeof issuedToken !== "string" || !issuedToken.trim()) {
      throw new Error("Authentication did not return a nonempty token");
    }
    return issuedToken;
  });

  let id: number | undefined;
  let deleted = false;
  try {
    const bookingId = await test.step("Create a uniquely named booking", async () => {
      const response = await bookings.create(initial);
      expect(response.status(), "Verify booking creation succeeded").toBe(200);
      const created: TBookingCreated = await response.json();
      expect(Number.isSafeInteger(created.bookingid) && created.bookingid > 0).toBe(true);
      id = created.bookingid;
      expect(created.booking).toEqual(initial);
      return id;
    });

    await test.step("Read the booking and verify its original content", async () => {
      const response = await bookings.get(bookingId);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(initial);
    });

    await test.step("Update the booking and verify the persisted changes", async () => {
      const response = await bookings.update(bookingId, updated, token);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(updated);
      const persisted = await bookings.get(bookingId);
      expect(persisted.status()).toBe(200);
      const saved: TBooking = await persisted.json();
      expect(typeof saved.totalprice === "number" ? saved.totalprice : "<unavailable>", "Verify the persisted booking price").toEqual(updated.totalprice);
      expect(saved).toEqual(updated);
    });

    await test.step("Delete the booking and verify it is gone", async () => {
      const response = await bookings.delete(bookingId, token);
      expect(response.status(), "Verify booking deletion succeeded").toBe(201);
      expect((await bookings.get(bookingId)).status(), "Verify the deleted booking is absent").toBe(404);
      deleted = true;
    });
  } finally {
    if (id !== undefined && !deleted) {
      const cleanupId = id;
      const problem = await test.step("Attempt cleanup of the test booking", async () => {
        try {
          const response = await bookings.delete(cleanupId, token);
          if (![201, 404].includes(response.status())) return `Unexpected cleanup HTTP status ${response.status()}`;
          const remaining = await bookings.get(cleanupId);
          return remaining.status() === 404 ? undefined : `Cleanup GET returned ${remaining.status()}`;
        } catch {
          return "The cleanup request did not complete";
        }
      });
      if (problem) test.info().annotations.push({ type: "cleanup", description: problem });
    }
  }
});
