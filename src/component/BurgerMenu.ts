import { test, type Page } from "@playwright/test";
import { ParentComponent } from "../base/ParentComponent";
import { WebElement } from "../base/WebElement";
import { Button } from "../element/Button";
import { Link } from "../element/Link";

export class BurgerMenu extends ParentComponent {
  readonly entries = this.root.locator.locator(".bm-item");
  readonly about = new Link(this.root.locator.getByTestId("about-sidebar-link"));
  private readonly toggle: Button;

  constructor(page: Page) {
    super(new WebElement(page.getByRole("navigation").filter({ has: page.getByTestId("about-sidebar-link") })));
    this.requiredElements.push(this.about);
    this.toggle = new Button(page.getByRole("button", { name: "Open Menu", exact: true }));
  }

  async open(): Promise<void> {
    await test.step("Open the navigation menu", async () => {
      await this.toggle.click();
      await this.waitForElement();
    });
  }

  async showAllItems(): Promise<void> {
    await test.step("Select All Items from the menu", () => this.root.locator.getByTestId("inventory-sidebar-link").click());
  }

  async resetAppState(): Promise<void> {
    await test.step("Reset app state from the menu", () => this.root.locator.getByTestId("reset-sidebar-link").click());
  }

  async logout(): Promise<void> {
    await test.step("Log out from the menu", () => this.root.locator.getByTestId("logout-sidebar-link").click());
  }
}
