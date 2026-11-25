import { test, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = "/checkout-step-two.html";
  readonly items = this.page.getByTestId("inventory-item");
  readonly productName = this.items.getByTestId("inventory-item-name");
  readonly productPrice = this.items.getByTestId("inventory-item-price");
  readonly quantity = this.items.getByTestId("item-quantity");
  readonly subtotal = this.page.getByTestId("subtotal-label");
  readonly tax = this.page.getByTestId("tax-label");
  readonly total = this.page.getByTestId("total-label");
  private readonly finishButton = new Button(this.page.getByTestId("finish"));

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(new WebElement(this.total), this.finishButton);
  }

  async finish(): Promise<void> {
    await test.step("Finish the purchase", () => this.finishButton.click());
  }
}
