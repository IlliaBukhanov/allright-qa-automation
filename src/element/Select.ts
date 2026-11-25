import { FormControl } from "./FormControl";

export class Select extends FormControl {
  async select(value: string): Promise<void> {
    await this.locator.selectOption(value);
  }

  async getValue(): Promise<string> {
    return this.locator.inputValue();
  }
}
