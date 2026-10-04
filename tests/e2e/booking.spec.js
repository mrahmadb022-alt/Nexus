import { test, expect } from '@playwright/test'

// Hebrew, RTL, 375px: pick a service → "No preference" staff → first open slot → confirm.
// Also checks no horizontal scroll and no interactive element nested inside another.

async function assertMobileLayout(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow, 'horizontal overflow at 375px').toBeLessThanOrEqual(0)
  const nested = await page.evaluate(() => document.querySelectorAll('button button, button a, a button, a a, label button').length)
  expect(nested, 'nested interactive elements').toBe(0)
}

test('books an appointment in Hebrew at 375px', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nexus_lang', 'he'))
  await page.goto('/services')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'בחרו שירות' })).toBeVisible()
  await assertMobileLayout(page)

  // Service
  await page.getByRole('button', { name: /מניקור מלא/ }).click()
  await page.getByRole('button', { name: 'המשך לבחירת איש מקצוע' }).click()

  // Staff: "No preference" = any available
  await page.getByRole('button', { name: /ללא העדפה/ }).click()
  await page.getByRole('button', { name: /המשך לבחירת שעה/ }).click()
  await expect(page.getByText('מוצגות שעות שבהן מישהו מהצוות פנוי.')).toBeVisible()
  await assertMobileLayout(page)

  // Date/time: walk the open days until one shows time slots.
  const slot = page.getByRole('button', { name: /^\d{2}:\d{2}$/ }).first()
  const days = page.locator('.grid-cols-7 button:not([disabled])')
  if (!(await slot.isVisible())) {
    const count = await days.count()
    for (let i = 0; i < count && !(await slot.isVisible()); i++) await days.nth(i).click()
  }
  await expect(slot).toBeVisible()
  await slot.click()
  await page.getByRole('button', { name: 'המשך', exact: true }).click()

  // Confirm: marketing consent exists and is NOT pre-checked.
  const consent = page.getByRole('checkbox', { name: /מבצעים ועדכונים/ })
  await expect(consent).toBeVisible()
  await expect(consent).not.toBeChecked()
  await expect(page.getByText(/כל הזמין: נשבץ/)).toBeVisible()
  await assertMobileLayout(page)
  await page.getByRole('button', { name: /אישור תור/ }).click()

  // Success: assigned to a real staff member, with calendar actions.
  await expect(page.getByRole('heading', { name: 'התור אושר' })).toBeVisible()
  await expect(page.getByText(/איש הצוות שלך:/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'הוספה ליומן' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Google Calendar/ })).toHaveAttribute('href', /calendar\.google\.com/)
  await assertMobileLayout(page)
})

test('manager pages fit 375px in Arabic (RTL) without nested interactive elements', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nexus_lang', 'ar'))
  for (const path of ['/manager', '/manager/calendar', '/manager/finance', '/manager/messages', '/manager/settings', '/profile']) {
    await page.goto(path)
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await assertMobileLayout(page)
  }
})
