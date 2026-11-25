import { expect, type Locator } from "@playwright/test";

/** Thin locator wrapper; no additional hidden wait or retry logic. */
export class WebElement {
  constructor(public readonly locator: Locator) {}

  child(selector: string): WebElement {
    return new WebElement(this.locator.locator(selector));
  }

  nth(index: number): WebElement {
    return new WebElement(this.locator.nth(index));
  }

  async click(): Promise<void> {
    await this.locator.click();
  }

  async innerText(): Promise<string> {
    return this.locator.innerText();
  }

  async getAttribute(name: string): Promise<string | null> {
    return this.locator.getAttribute(name);
  }

  async waitForElement(): Promise<void> {
    await expect(this.locator).toBeVisible();
  }
}
