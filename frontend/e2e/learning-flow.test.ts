import { test, expect } from "@playwright/test";

test.describe("Core Learning Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Start from landing page
    await page.goto("/");
  });

  test("complete hiragana learning flow", async ({ page }) => {
    // Navigate to hiragana module
    await page.click("text=Hiragana");
    await expect(page).toHaveURL("/flashcards/hiragana");

    // Character exploration
    const characterGrid = page.locator('[data-testid="character-grid"]');
    await expect(characterGrid).toBeVisible();
    await page.click("text=あ");
    await expect(
      page.locator('[data-testid="character-details"]'),
    ).toBeVisible();

    // Practice mode
    await page.click("text=Practice");
    const practiceInput = page.locator('[data-testid="practice-input"]');
    await expect(practiceInput).toBeVisible();
    await practiceInput.fill("あ");
    await page.click("text=Check");
    await expect(page.locator("text=Correct")).toBeVisible();

    // Quiz mode
    await page.click("text=Quiz");
    const quizQuestion = page.locator('[data-testid="quiz-question"]');
    await expect(quizQuestion).toBeVisible();
    await page.click('[data-testid="quiz-option"]:has-text("a")');
    await expect(page.locator("text=Correct")).toBeVisible();

    // Progress tracking
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveAttribute("aria-valuenow", /[1-9][0-9]*/);
  });

  test("complete katakana learning flow", async ({ page }) => {
    // Navigate to katakana module
    await page.click("text=Katakana");
    await expect(page).toHaveURL("/flashcards/katakana");

    // Similar flow as hiragana
    // ... implement katakana-specific tests
  });

  test("complete numbers learning flow", async ({ page }) => {
    // Navigate to numbers module
    await page.click("text=Numbers");
    await expect(page).toHaveURL("/flashcards/numbers-basic");

    // Similar flow as other modules
    // ... implement numbers-specific tests
  });

  test("verify landing page colors module card", async ({ page }) => {
    await page.goto("/");

    // Verify Colors module card content
    const colorsCard = page.locator('a[href="/modules/colors"]');
    await expect(colorsCard).toBeVisible();
    await expect(colorsCard.locator("h3")).toHaveText("Colors");
    await expect(colorsCard.locator("p")).toHaveText(
      "Learn Japanese color words with visual aids",
    );
    await expect(colorsCard.locator("text=Beginner")).toBeVisible();
    await expect(colorsCard.locator("text=10 cards")).toBeVisible();
  });

  test("verify colors module content and functionality", async ({ page }) => {
    await page.goto("/modules/colors");

    // Verify initial loading state
    await expect(page.locator("text=Loading colors module...")).toBeVisible();
    await expect(page.locator("text=Loading colors module...")).toBeHidden();

    // Verify all 10 colors are present with correct data
    const colors = [
      { kanji: "赤", hiragana: "あか", english: "red" },
      { kanji: "青", hiragana: "あお", english: "blue" },
      { kanji: "黄色", hiragana: "きいろ", english: "yellow" },
      { kanji: "緑", hiragana: "みどり", english: "green" },
      { kanji: "紫", hiragana: "むらさき", english: "purple" },
      { kanji: "茶色", hiragana: "ちゃいろ", english: "brown" },
      { kanji: "白", hiragana: "しろ", english: "white" },
      { kanji: "黒", hiragana: "くろ", english: "black" },
      { kanji: "灰色", hiragana: "はいいろ", english: "gray" },
      { kanji: "桃色", hiragana: "ももいろ", english: "pink" },
    ];

    for (const color of colors) {
      await expect(page.locator(`text=${color.kanji}`)).toBeVisible();
      await expect(page.locator(`text=${color.hiragana}`)).toBeVisible();
      await expect(page.locator(`text=${color.english}`)).toBeVisible();
    }

    // Test practice mode content
    await page.click("text=Practice");
    await expect(page.locator("text=Loading practice module...")).toBeVisible();
    await expect(page.locator("text=Loading practice module...")).toBeHidden();

    // Verify practice sets
    const practiceSets = ["basic-colors", "dark-colors", "light-colors"];
    for (const set of practiceSets) {
      await expect(
        page.locator(`[data-testid="practice-set-${set}"]`),
      ).toBeVisible();
    }

    // Test quiz mode content
    await page.click("text=Quiz");
    await expect(page.locator("text=Loading quiz module...")).toBeVisible();
    await expect(page.locator("text=Loading quiz module...")).toBeHidden();

    // Verify quiz questions
    const questions = [
      { question: "赤", answer: "あか", hint: "Color of fire" },
      { question: "青", answer: "あお", hint: "Color of the sky" },
      { question: "黄色", answer: "きいろ", hint: "Color of the sun" },
    ];

    for (const q of questions) {
      await expect(page.locator(`text=${q.question}`)).toBeVisible();
      await expect(page.locator(`text=${q.hint}`)).toBeVisible();
    }

    // Test color interaction and progress tracking
    await page.click("text=Explore");
    const firstColor = page.locator("button").filter({ hasText: "赤" });
    await firstColor.click();
    await expect(
      page.locator('[data-testid="progress-tracker"]'),
    ).toContainText("1");
  });

  test("accessibility requirements", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Test screen reader content
    const main = page.locator("main");
    await expect(main).toHaveAttribute("role", "main");

    // Test color contrast
    // ... implement contrast checks
  });

  test("error handling", async ({ page }) => {
    // Test network error
    await page.route("**/api/**", (route) => route.abort());
    await page.goto("/flashcards/hiragana");
    await expect(page.locator("text=Error")).toBeVisible();

    // Test invalid input
    await page.click("text=Practice");
    const input = page.locator('[data-testid="practice-input"]');
    await input.fill("123");
    await page.click("text=Check");
    await expect(page.locator("text=Invalid input")).toBeVisible();
  });

  test("performance metrics", async ({ page }) => {
    // Test initial load time
    const startTime = Date.now();
    await page.goto("/flashcards/hiragana");
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2 seconds max

    // Test interaction responsiveness
    const beforeClick = Date.now();
    await page.click("text=Practice");
    const responseTime = Date.now() - beforeClick;
    expect(responseTime).toBeLessThan(100); // 100ms max
  });
});
