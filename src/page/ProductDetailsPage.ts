import { test, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";

export class ProductDetailsPage extends BasePage {
  protected readonly path = "/inventory-item.html";
  readonly name = new WebElement(this.page.getByTestId("inventory-item-name"));
  readonly description = new WebElement(this.page.getByTestId("inventory-item-desc"));
  readonly price = new WebElement(this.page.getByTestId("inventory-item-price"));
  readonly image = new WebElement(this.page.locator("img.inventory_details_img"));
  private readonly backButton = new Button(this.page.getByTestId("back-to-products"));

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(this.name, this.description, this.price, this.image, this.backButton);
  }

  async returnToInventory(): Promise<void> {
    await test.step("Return to the inventory", () => this.backButton.click());
  }
}
