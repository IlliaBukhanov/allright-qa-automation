export type TBooking = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
};

export type TBookingCreated = {
  bookingid: number;
  booking: TBooking;
};
