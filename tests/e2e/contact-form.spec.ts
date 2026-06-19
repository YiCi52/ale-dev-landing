import { test, expect } from "@playwright/test";

test.describe("Contact form — validación client-side", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#contacto").scrollIntoViewIfNeeded();
  });

  test("submit vacío muestra los errores de campos requeridos", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /enviar consulta/i }).click();

    await expect(
      page.getByText("Tu nombre, aunque sea solo el primero."),
    ).toBeVisible();
    await expect(page.getByText("Email inválido.")).toBeVisible();
    await expect(page.getByText("Elegí una opción.")).toBeVisible();
    await expect(
      page.getByText("Contame al menos 20 caracteres para no improvisar."),
    ).toBeVisible();
    await expect(
      page.getByText("Necesitamos tu consentimiento para procesar tu consulta."),
    ).toBeVisible();
  });

  test("sin consentimiento no se envía aunque el resto sea válido", async ({
    page,
  }) => {
    await page.locator("#nombre").fill("Alejandro");
    await page.locator("#email").fill("test@ejemplo.com");
    await page
      .locator("#mensaje")
      .fill("Mensaje válido con más de veinte caracteres.");
    await page.locator("#tipoProyecto").selectOption("landing");

    await page.getByRole("button", { name: /enviar consulta/i }).click();

    await expect(
      page.getByText("Necesitamos tu consentimiento para procesar tu consulta."),
    ).toBeVisible();
  });

  test("email inválido muestra error específico sin tocar otros campos", async ({
    page,
  }) => {
    await page.locator("#nombre").fill("Alejandro");
    await page.locator("#email").fill("no-es-email");
    await page.locator("#mensaje").fill("Mensaje válido con más de veinte caracteres.");
    await page.locator("#tipoProyecto").selectOption("landing");

    await page.getByRole("button", { name: /enviar consulta/i }).click();

    await expect(page.getByText("Email inválido.")).toBeVisible();
    await expect(
      page.getByText("Tu nombre, aunque sea solo el primero."),
    ).toHaveCount(0);
  });

  test("mensaje muy corto muestra error de longitud mínima", async ({
    page,
  }) => {
    await page.locator("#nombre").fill("Alejandro");
    await page.locator("#email").fill("test@ejemplo.com");
    await page.locator("#mensaje").fill("muy corto");
    await page.locator("#tipoProyecto").selectOption("webapp");

    await page.getByRole("button", { name: /enviar consulta/i }).click();

    await expect(
      page.getByText("Contame al menos 20 caracteres para no improvisar."),
    ).toBeVisible();
  });

  test("honeypot oculto está fuera del viewport para humanos", async ({
    page,
  }) => {
    const honeypot = page.locator('input[name="honeypot"]');
    await expect(honeypot).toHaveCount(1);
    const box = await honeypot.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeLessThan(-1000);
    }
  });
});
