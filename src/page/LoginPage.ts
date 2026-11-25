import { expect, test, type Page } from "@playwright/test";
import { standardUser } from "../data/dict/users";
import { BasePage } from "../base/BasePage";
import { Button } from "../element/Button";
import { Input } from "../element/Input";
import type { TLoginData } from "../type/TLoginData";

export class LoginPage extends BasePage {
  protected readonly path = "/";

  readonly username: Input;
  readonly password: Input;
  readonly submit: Button;

  constructor(page: Page) {
    super(page);
    this.username = new Input(page.getByTestId("username"));
    this.password = new Input(page.getByTestId("password"));
    this.submit = new Button(page.getByTestId("login-button"));
    // Readiness is deliberately limited to the actionable login controls.
    this.requiredElements.push(this.username, this.password, this.submit);
  }

  async login(credentials: TLoginData): Promise<void> {
    await test.step("Enter login credentials", async () => {
      await this.username.fill(credentials.username);
      await this.password.fill(credentials.password);
    });
    await test.step("Submit the login form", async () => {
      await this.submit.click();
    });
  }

  async expectStaticContent(): Promise<void> {
    await test.step("Verify login page static content", async () => {
      await test.step("Verify the Swag Labs logo", async () => {
        await expect(this.page.locator(".login_logo")).toBeVisible();
        await expect(this.page.locator(".login_logo")).toHaveText("Swag Labs");
      });
      await test.step("Verify accepted usernames and demo password panel", async () => {
        await expect(this.page.locator(".login_credentials_wrap")).toBeVisible();
        const users = this.page.getByTestId("login-credentials");
        const password = this.page.getByTestId("login-password");
        await expect(users).toBeVisible();
        await expect(password).toBeVisible();
        await expect(users.getByRole("heading")).toHaveText("Accepted usernames are:");
        await expect(password.getByRole("heading")).toHaveText("Password for all users:");
        // Compare username tokens independently of the panel's line breaks.
        await expect.poll(async () => (await users.innerText()).trim().split(/\s+/).slice(3).sort()).toEqual([
          "error_user",
          "locked_out_user",
          "performance_glitch_user",
          "problem_user",
          standardUser.username,
          "visual_user",
        ]);
        await expect.poll(async () => (await password.innerText()).trim().endsWith(standardUser.password),
          { message: "The panel displays the expected public demo password" }).toBe(true);
      });
      await test.step("Verify login form and input attributes", async () => {
        await expect(this.page.getByTestId("login-container")).toBeVisible();
        await expect(this.page.locator('form[aria-label="Login"]')).toBeVisible();
        await expect(this.username.locator).toHaveAttribute("type", "text");
        await expect(this.password.locator).toHaveAttribute("type", "password");
      });
      await test.step("Verify the error container starts empty", async () => {
        const errorContainer = this.page.locator(".error-message-container");
        await expect(errorContainer).toBeAttached();
        await expect(errorContainer).toHaveText("");
      });
    });
  }

  async expectError(message: string): Promise<void> {
    await expect(this.page.getByTestId("error")).toHaveText(message);
  }
}
