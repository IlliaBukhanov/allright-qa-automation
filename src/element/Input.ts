import { FormControl } from "./FormControl";

export class Input extends FormControl {
  async fill(value: string): Promise<void> {
    await this.locator.fill(value);
  }

  async clear(): Promise<void> {
    await this.locator.clear();
  }
}
