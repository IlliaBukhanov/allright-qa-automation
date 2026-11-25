import { expect, type Page } from "@playwright/test";
import { ParentComponent } from "./ParentComponent";
import { WebElement } from "./WebElement";

export abstract class BasePage extends ParentComponent {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    super(new WebElement(page.locator("body")));
  }

  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForElement();
  }

  async shouldHavePath(path: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(path);
  }
}
