import { test, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { WebElement } from "../base/WebElement";
import { CartItem } from "../component/CartItem";
import { Button } from "../element/Button";
import type { TProduct } from "../type/TProduct";

export class CartPage extends BasePage {
  protected readonly path = "/cart.html";
  readonly items = this.page.getByTestId("cart-list").getByTestId("inventory-item");
  readonly cartBadge = this.page.getByTestId("shopping-cart-badge");
  private readonly continueButton = new Button(this.page.getByTestId("continue-shopping"));
  private readonly checkoutButton = new Button(this.page.getByTestId("checkout"));

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(new WebElement(page.getByTestId("cart-list")), this.continueButton, this.checkoutButton);
  }

  itemFor(product: Pick<TProduct, "name">): CartItem {
    const exactName = this.page.getByTestId("inventory-item-name").and(this.page.getByText(product.name, { exact: true }));
    return new CartItem(new WebElement(this.items.filter({ has: exactName })));
  }

  async continueShopping(): Promise<void> {
    await test.step("Continue shopping from the cart", () => this.continueButton.click());
  }

  async checkout(): Promise<void> {
    await test.step("Start checkout from the cart", () => this.checkoutButton.click());
  }
}
