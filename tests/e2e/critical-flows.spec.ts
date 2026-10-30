import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@devcraft.test';
const ADMIN_PASSWORD = 'DevCraft#2026';

async function login(page: Page) {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.locator('#email').fill(ADMIN_EMAIL);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/admin$/);
}

test.describe.serial('critical user flows', () => {
    test('visitor can compare packages', async ({ page }) => {
        await page.goto('/paket/bandingkan');
        await expect(page.getByRole('heading', { name: 'Perbandingan paket' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('admin creates and publishes a project that appears publicly', async ({ page }) => {
        await login(page);

        await page.goto('/admin/portfolio/create');
        await page.locator('#title').fill('E2E Inventory Tool');
        await page.locator('#slug').fill('e2e-inventory-tool');
        await page.locator('#excerpt').fill('Alat pencatatan stok sederhana yang dibangun sebagai proyek internal.');
        await page.locator('#project_type').selectOption('internal_project');
        await page.locator('#project_status').selectOption('completed');
        await page.getByLabel(/Publikasikan setelah disimpan/).click();
        await page.getByRole('button', { name: 'Simpan' }).click();

        await expect(page).toHaveURL(/\/admin\/portfolio\/e2e-inventory-tool\/edit/);

        await page.goto('/portfolio');
        await expect(page.getByRole('link', { name: /E2E Inventory Tool/ }).first()).toBeVisible();
        await page.getByRole('link', { name: /E2E Inventory Tool/ }).first().click();
        await expect(page).toHaveURL(/\/portfolio\/e2e-inventory-tool$/);
        await expect(page.getByRole('heading', { level: 1, name: 'E2E Inventory Tool' })).toBeVisible();
    });

    test('visitor submits a brief and the admin follows it up', async ({ page }) => {
        await page.goto('/kontak');
        await page.locator('#name').fill('E2E Visitor');
        await page.locator('#email').fill('e2e.visitor@example.com');
        await page.locator('#phone').fill('081298765432');
        await page.locator('#organization').fill('Toko E2E');
        await page.locator('#message').fill('Kami ingin mencatat stok barang masuk dan keluar secara sederhana.');
        await page.locator('#privacy_consent').click();
        await page.getByRole('button', { name: 'Kirim project brief' }).click();

        await expect(page.getByText(/Terima kasih sudah menceritakan kebutuhan Anda/)).toBeVisible();

        await login(page);
        await page.goto('/admin/leads');
        await page.getByRole('link', { name: 'E2E Visitor' }).click();

        await page.locator('#status').selectOption('contacted');
        await page.getByRole('button', { name: 'Simpan status' }).click();
        await expect(page.getByText('Status lead diperbarui.')).toBeVisible();

        await page.locator('#note').fill('Sudah dihubungi melalui email, menunggu balasan.');
        await page.getByRole('button', { name: 'Simpan catatan' }).click();
        await expect(page.getByText('Sudah dihubungi melalui email, menunggu balasan.')).toBeVisible();
    });
});
