
import { test, expect } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator("body")).toBeVisible();
});

test("homepage has no uncaught page errors", async ({ page }) => {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  expect(errors).toEqual([]);
});

test("promotional product quote form submits successfully", async ({ page }) => {
  await page.goto("/promotional-products/business-cards");

  await page.locator('input[placeholder="Jane Doe"]').fill("Jane Doe");
  await page.locator('input[placeholder="jane@company.com"]').fill("jane@company.com");
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"),
  });

  await page.getByRole("button", { name: "Submit Request" }).click();

  await expect(page.getByText("Quote request submitted successfully!")).toBeVisible({ timeout: 20000 });
});
