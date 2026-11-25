import { WebElement } from "../base/WebElement";

export class Link extends WebElement {
  async getHref(): Promise<string | null> {
    return this.getAttribute("href");
  }
}
