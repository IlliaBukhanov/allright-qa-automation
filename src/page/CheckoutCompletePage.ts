import { test, type Download, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";

export class CheckoutCompletePage extends BasePage {
  protected readonly path = "/checkout-complete.html";
  readonly heading = this.page.getByTestId("complete-header");
  readonly message = this.page.getByTestId("complete-text");
  private readonly homeButton = new Button(this.page.getByTestId("back-to-products"));
  private readonly pdfButton = new Button(this.page.getByTestId("generate-pdf-order"));

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(new WebElement(this.heading), this.homeButton, this.pdfButton);
  }

  async downloadOrder(): Promise<Download> {
    return test.step("Download the order PDF", async () => {
      const [download] = await Promise.all([this.page.waitForEvent("download"), this.pdfButton.click()]);
      return download;
    });
  }

  async returnToInventory(): Promise<void> {
    await test.step("Go back to the inventory after purchase", () => this.homeButton.click());
  }
}
