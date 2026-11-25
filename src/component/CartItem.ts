import { test } from "@playwright/test";
import { ParentComponent } from "../base/ParentComponent";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";

export class CartItem extends ParentComponent {
  readonly name = this.getChildElement('[data-test="inventory-item-name"]');
  readonly price = this.getChildElement('[data-test="inventory-item-price"]');
  readonly quantity = this.getChildElement('[data-test="item-quantity"]');
  private readonly removeButton = new Button(this.root.locator.getByRole("button", { name: "Remove", exact: true }));

  constructor(root: WebElement) {
    super(root);
    this.requiredElements.push(this.name, this.price, this.quantity, this.removeButton);
  }

  async remove(): Promise<void> {
    await test.step(`Remove ${await this.name.innerText()} from the cart page`, () => this.removeButton.click());
  }
}
