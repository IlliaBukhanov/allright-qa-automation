import { expect } from "@playwright/test";
import { WebElement } from "./WebElement";

export abstract class ParentComponent {
  protected readonly requiredElements: WebElement[] = [];

  constructor(protected readonly root: WebElement) {}

  protected getChildElement(selector: string): WebElement {
    return this.root.child(selector);
  }

  async waitForElement(): Promise<void> {
    await expect(this.root.locator).toBeVisible();
    for (const element of this.requiredElements) {
      await element.waitForElement();
    }
  }
}
