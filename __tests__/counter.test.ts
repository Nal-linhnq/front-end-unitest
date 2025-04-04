import { describe, test, expect, beforeEach } from "vitest";
import { setupCounter } from "../src/counter";

beforeEach(() => {
  document.body.innerHTML = `
    <div id="app">
      <div>
        <h1>Vite + TypeScript</h1>
        <div class="card">
          <button id="counter" type="button"></button>
        </div>
      </div>
    </div>
  `;
});

describe("src/counter.ts", () => {
  test("Should initial counter to 0", () => {
    const button = document.getElementById("counter") as HTMLButtonElement;
    setupCounter(button);

    expect(button.innerHTML).toBe("count is 0");
  });

  test("Should update counter on click", () => {
    const button = document.getElementById("counter") as HTMLButtonElement;
    setupCounter(button);
    button.click();

    expect(button.innerHTML).toBe("count is 1");
  });

  test("Should increase counter correctly when multiple click", () => {
    const button = document.getElementById("counter") as HTMLButtonElement;
    setupCounter(button);
    button.click();
    button.click();
    button.click();

    expect(button.innerHTML).toBe("count is 3");
  });
});
