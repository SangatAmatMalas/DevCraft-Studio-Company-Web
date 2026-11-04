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
        await page.getByRole('button', { name: 'Detail opsional' }).click();
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

    test('visitor generates a preview with one service row, then edits the brief', async ({ page }) => {
        await page.goto('/desain');
        await page.getByRole('button', { name: /Company profile/ }).click();
        await page.getByRole('button', { name: /Minimal & bersih/ }).click();
        await page.getByRole('button', { name: 'Lanjut' }).click();

        await page.locator('#brand_name').fill('E2E Kopi Senja');
        await page.getByLabel('Nama layanan 1').fill('Kopi rumahan');
        // Leave the second service row untouched: it used to block the brief.
        await page.getByRole('button', { name: 'Lanjut' }).click();

        // Reaching the review step must not submit the form. The button used to
        // be reused as a submit button mid-click, which silently reset the page.
        await expect(page.getByText('Ringkasan brief')).toBeVisible();

        await page.locator('#privacy_consent').click();
        await page.getByRole('button', { name: /Buat 3 opsi desain/ }).click();

        await expect(page).toHaveURL(/\/desain\/[0-9a-f-]{36}$/);
        await expect(page.locator('iframe')).toHaveCount(3);

        await page.getByRole('link', { name: /Edit brief/ }).first().click();
        await expect(page).toHaveURL(/\/desain\/[0-9a-f-]{36}\/edit$/);
        await expect(page.locator('#brand_name')).toHaveValue('E2E Kopi Senja');
        await expect(page.locator('#tagline')).toHaveValue('');

        await page.locator('#tagline').fill('Tagline dari alur edit');
        await page.getByRole('button', { name: 'Turunkan Layanan' }).click();
        await page.getByRole('button', { name: 'Lanjut' }).click();
        await expect(page.getByText('Ringkasan brief')).toBeVisible();
        await page.getByRole('button', { name: /Simpan perubahan/ }).click();

        await expect(page.getByText('Brief diperbarui. Preview di bawah sudah memakai teks terbaru.')).toBeVisible();

        const frame = page.frameLocator('iframe').first();
        await expect(frame.getByRole('heading', { name: 'Tagline dari alur edit' })).toBeVisible();
    });

    test('team members stay hidden until approved, then appear on /tim', async ({ page }) => {
        await login(page);

        await page.goto('/admin/team/create');
        await page.locator('#name').fill('E2E Anggota');
        await page.locator('#role').fill('QA Engineer');
        await page.locator('#bio').fill('Menguji alur rilis dan menulis skenario pengujian.');
        await page.locator('#experience-role-0').fill('QA Lead');
        await page.locator('#experience-organization-0').fill('PT Contoh');
        await page.locator('#experience-period-0').fill('2024 — sekarang');
        await page.getByRole('button', { name: 'Simpan' }).click();

        await expect(page.getByText(/disimpan sebagai draft — belum tampil di \/tim/)).toBeVisible();
        await expect(page.getByText(/anggota belum tampil di halaman/)).toBeVisible();

        await page.goto('/tim');
        await expect(page.getByRole('heading', { level: 1, name: 'Orang di balik DevCraft Studio' })).toBeVisible();
        await expect(page.getByText('Belum ada profil yang bisa ditampilkan')).toBeVisible();

        await page.goto('/admin/team');
        await page.getByRole('link', { name: 'Edit' }).first().click();
        await page.getByLabel(/menyetujui publikasi profil/).click();
        await page.getByLabel(/Aktif dan tampil di halaman publik/).click();
        await page.getByRole('button', { name: 'Simpan' }).click();

        await expect(page.getByText(/sudah tampil di \/tim/)).toBeVisible();

        await page.goto('/tim');
        await expect(page.getByText('E2E Anggota')).toBeVisible();
        await expect(page.getByText('QA Engineer')).toBeVisible();
        await expect(page.getByText('QA Lead')).toBeVisible();
        await expect(page.getByText('PT Contoh')).toBeVisible();
        await expect(page.getByText('2024 — sekarang')).toBeVisible();

        await page.goto('/tentang-kami');
        await page.getByRole('link', { name: /Lihat semua tim/ }).click();
        await expect(page).toHaveURL(/\/tim$/);
    });
});
