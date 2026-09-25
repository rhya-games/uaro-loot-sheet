/**
 * Copies text to the clipboard. Returns true if it worked.
 * Uses the modern Clipboard API, and falls back to the older "select a hidden
 * text box and copy" way for browsers or settings that block the API.
 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const previousFocus = document.activeElement; // selecting the box moves focus
    const box = document.createElement('textarea');
    box.value = text;
    box.setAttribute('readonly', '');
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.appendChild(box);
    box.select();
    let copied;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    box.remove();
    previousFocus?.focus();
    return copied;
  }
}
