import puppeteer from "puppeteer";

const url = process.argv[2] ?? "http://localhost:3000";
const errors = [];
const pageErrors = [];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();

page.on("console", (msg) => {
  const text = msg.text();
  if (
    text.includes("Maximum update depth") ||
    text.includes("update depth exceeded") ||
    text.includes("TERMINAL HALT") ||
    text.includes("Error:")
  ) {
    errors.push(`[console.${msg.type()}] ${text}`);
  }
});

page.on("pageerror", (err) => {
  pageErrors.push(err.stack ?? String(err));
});

try {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 8000));
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) ?? "");
  const hasHalt = bodyText.includes("TERMINAL HALT");
  console.log("URL:", url);
  console.log("TERMINAL_HALT:", hasHalt);
  if (hasHalt) {
    const haltLine = bodyText.split("\n").find((l) => l.includes("React error") || l.includes("Maximum"));
    if (haltLine) console.log("HALT_MSG:", haltLine.trim());
  }
  if (pageErrors.length) {
    console.log("--- PAGE ERRORS ---");
    for (const e of pageErrors) console.log(e);
  }
  if (errors.length) {
    console.log("--- CONSOLE ---");
    for (const e of errors) console.log(e);
  }
  if (!hasHalt && !pageErrors.length && !errors.length) {
    console.log("No crash detected in 8s window");
  }
} catch (e) {
  console.error("NAV_FAIL:", e.message);
} finally {
  await browser.close();
}
