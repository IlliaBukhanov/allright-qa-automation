import type { TBooking } from "../../../type/api/TBooking";

export const validBooking: TBooking = {
  firstname: "Avery",
  lastname: "Tester",
  totalprice: 120,
  depositpaid: true,
  bookingdates: { checkin: "2030-06-10", checkout: "2030-06-12" },
  additionalneeds: "Breakfast",
};

export const updatedBooking: TBooking = {
  ...validBooking,
  totalprice: 180,
  bookingdates: { checkin: "2030-06-10", checkout: "2030-06-13" },
};
