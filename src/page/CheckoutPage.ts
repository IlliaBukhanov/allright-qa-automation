import { test, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { Button } from "../element/Button";
import { Input } from "../element/Input";
import type { TCheckoutData } from "../type/TCheckoutData";

export class CheckoutPage extends BasePage {
  protected readonly path = "/checkout-step-one.html";
  private readonly firstName = new Input(this.page.getByTestId("firstName"));
  private readonly lastName = new Input(this.page.getByTestId("lastName"));
  private readonly postalCode = new Input(this.page.getByTestId("postalCode"));
  private readonly continueButton = new Button(this.page.getByTestId("continue"));
  private readonly cancelButton = new Button(this.page.getByTestId("cancel"));
  readonly error = this.page.getByTestId("error");

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(this.firstName, this.lastName, this.postalCode, this.continueButton, this.cancelButton);
  }

  async fillInformation(data: TCheckoutData): Promise<void> {
    await test.step("Enter checkout information", async () => {
      await this.firstName.fill(data.firstName);
      await this.lastName.fill(data.lastName);
      await this.postalCode.fill(data.postalCode);
    });
  }

  async continue(): Promise<void> {
    await test.step("Submit checkout information", () => this.continueButton.click());
  }

  async cancel(): Promise<void> {
    await test.step("Cancel checkout", () => this.cancelButton.click());
  }
}
