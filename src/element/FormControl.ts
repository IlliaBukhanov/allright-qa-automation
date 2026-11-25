import { expect } from "@playwright/test";
import { WebElement } from "../base/WebElement";

/** Shared enabled/disabled assertions for HTML form controls. */
export abstract class FormControl extends WebElement {
  async waitForEnabled(): Promise<void> {
    await expect(this.locator).toBeEnabled();
  }

  async waitForDisabled(): Promise<void> {
    await expect(this.locator).toBeDisabled();
  }
}
