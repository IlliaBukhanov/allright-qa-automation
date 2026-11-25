import { test } from "@playwright/test";
import { ParentComponent } from "../base/ParentComponent";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";
import { Link } from "../element/Link";

export class ProductCard extends ParentComponent {
  readonly name = this.getChildElement('[data-test="inventory-item-name"]');
  readonly description = this.getChildElement('[data-test="inventory-item-desc"]');
  readonly price = this.getChildElement('[data-test="inventory-item-price"]');
  readonly image = this.getChildElement("img.inventory_item_img");
  readonly detailsLink = new Link(this.root.locator.locator('a[data-test$="-title-link"]'));
  readonly addButton = new Button(this.root.locator.getByRole("button", { name: "Add to cart", exact: true }));
  readonly removeButton = new Button(this.root.locator.getByRole("button", { name: "Remove", exact: true }));

  constructor(root: WebElement) {
    super(root);
    this.requiredElements.push(this.name, this.description, this.price, this.image, this.detailsLink);
  }

  async openDetails(): Promise<void> {
    await test.step(`Open details for ${await this.name.innerText()}`, () => this.detailsLink.click());
  }

  async addToCart(): Promise<void> {
    await test.step(`Add ${await this.name.innerText()} to the cart`, () => this.addButton.click());
  }

  async removeFromCart(): Promise<void> {
    await test.step(`Remove ${await this.name.innerText()} from the cart`, () => this.removeButton.click());
  }
}
