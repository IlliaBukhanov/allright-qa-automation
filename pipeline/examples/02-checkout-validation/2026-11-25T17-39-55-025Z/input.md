# Checkout required-field validation

Preconditions: authenticated standard_user, empty cart. Run each variation independently.

Steps:
1. Add Sauce Labs Backpack, open cart, confirm the item, and click Checkout.
2. Fill the checkout information using Avery, Tester, 12345, except leave one required field empty.
3. Click Continue.

Expected for each variation: remain on checkout-step-one.html; the exact error is:
- Empty first name: Error: First Name is required
- Empty last name: Error: Last Name is required
- Empty postal code: Error: Postal Code is required
