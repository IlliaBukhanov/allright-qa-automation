# Preserve cart contents across navigation

Preconditions: authenticated standard_user, empty cart.

Steps:
1. Open inventory and add Sauce Labs Backpack and Sauce Labs Bike Light.
2. Open the cart; verify both names, prices ($29.99 and $9.99), quantities (1 each), and badge 2.
3. Continue shopping; verify both products still have Remove buttons and badge 2.
4. Open the cart again; verify both entries and their quantities survived.
5. Remove the backpack; verify only the bike light remains, quantity 1, badge 1.
6. Remove the bike light.

Expected: cart is empty and the badge is absent. All intermediate checks must hold.
