# Reject a booking update with an invalid token

Preconditions: Restful Booker API. Authenticate with the demo account for setup and cleanup only.

Steps:
1. Create a booking using existing valid fixture data and a unique last name; verify status 200 and a positive booking ID.
2. Use a separate API request context with empty storage state to send an update with an invalid token and changed booking data.
3. GET the original booking using its ID.
4. In finally, delete only the booking created by this test using the valid token; confirm GET returns 404; dispose of the anonymous context.

Expected: update returns 403, GET returns 200 and the full original booking is unchanged. Cleanup must be attempted even if the scenario fails. Do not expose tokens in attachments.
