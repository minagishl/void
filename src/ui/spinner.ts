import ora, { Ora } from 'ora';

/**
 * Create and start a spinner
 */
export function startSpinner(text: string): Ora {
  return ora(text).start();
}

/**
 * Stop a spinner with success message
 */
export function succeedSpinner(spinner: Ora, text?: string): void {
  spinner.succeed(text);
}

/**
 * Stop a spinner with failure message
 */
export function failSpinner(spinner: Ora, text?: string): void {
  spinner.fail(text);
}

/**
 * Update spinner text
 */
export function updateSpinner(spinner: Ora, text: string): void {
  spinner.text = text;
}
