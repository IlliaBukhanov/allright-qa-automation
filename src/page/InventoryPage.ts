import { test, type Page } from "@playwright/test";
import { BasePage } from "../base/BasePage";
import { WebElement } from "../base/WebElement";
import { ProductCard } from "../component/ProductCard";
import { Select } from "../element/Select";
import type { TInventorySortOption } from "../type/TInventorySortingCase";

export class InventoryPage extends BasePage {
  protected readonly path = "/inventory.html";
  private readonly items = this.page.getByTestId("inventory-item");
  private readonly sortControl = new Select(this.page.getByTestId("product-sort-container"));
  readonly productNames = this.items.getByTestId("inventory-item-name");
  readonly productPrices = this.items.getByTestId("inventory-item-price");
  readonly cartBadge = this.page.getByTestId("shopping-cart-badge");
  readonly footer = this.page.getByRole("contentinfo");
  private readonly cartLink = new WebElement(this.page.getByTestId("shopping-cart-link"));

  constructor(page: Page) {
    super(page);
    this.requiredElements.push(
      this.sortControl,
      new WebElement(page.getByTestId("inventory-list")),
      this.cartLink,
    );
  }

  override async open(): Promise<void> {
    await test.step("Open the inventory", () => super.open());
  }

  async sortBy(option: TInventorySortOption): Promise<void> {
    await test.step("Select the requested catalog sort order", () => this.sortControl.select(option));
  }

  async openCart(): Promise<void> {
    await test.step("Open the cart from inventory", () => this.cartLink.click());
  }

  async getProductCards(): Promise<ProductCard[]> {
    return (await this.items.all()).map(item => new ProductCard(new WebElement(item)));
  }

  getProductCardByName(productName: string): ProductCard {
    const exactName = this.page.getByTestId("inventory-item-name")
      .and(this.page.getByText(productName, { exact: true }));
    return new ProductCard(new WebElement(this.items.filter({ has: exactName })));
  }
}
