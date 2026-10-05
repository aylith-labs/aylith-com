export type RichChoice = {
  value: string;
  label: string;
  description?: string;
  meta?: string;
  keywords?: string[];
};

// Full source-known Whisper language registry, copied as codes from
// aylith-ai/speech/catalog/stt-languages.json at backend 49222f4. These are
// *candidates*, not claims that a browser speech pack or server model is ready.
// Merge current browser voices, navigator locales and live gateway capabilities
// at the call site; selecting a browser language must still run its real probe.
export const SPEECH_LANGUAGE_CODES =
  'en zh de es ru ko fr ja pt tr pl ca nl ar sv it id hi fi vi he uk el ms cs ro da hu ta no th ur hr bg lt la mi ml cy sk te fa lv bn sr az sl kn et mk br eu is hy ne mn bs kk sq sw gl mr pa si km sn yo so af oc ka be tg sd gu am yi lo uz fo ht ps tk nn mt sa lb my bo tl mg as tt haw ln ha ba jw su yue'.split(
    ' ',
  );

export const VIEW_CHOICES: RichChoice[] = [
	{ value: 'explore', label: 'Web', description: 'Browse projects with Ayla nearby' },
	{ value: 'ayla', label: 'Ayla', description: 'Open the full conversation' },
];

export const VOICE_ROUTE_CHOICES: RichChoice[] = [
  { value: 'auto', label: 'Automatic', description: 'On-device first, then Aylith speech' },
  { value: 'browser', label: 'On-device only', description: 'Use local recognition and voices' },
  { value: 'owned', label: 'Aylith server', description: 'Use available server speech' },
];

function displayName(code: string, uiLocale: string): string {
  try {
    const name = new Intl.DisplayNames([uiLocale], { type: 'language' }).of(code.replace('_', '-'));
    return name && name !== code ? name : code;
  } catch {
    return code;
  }
}

export function languageChoices(codes: readonly string[], uiLocale = 'en'): RichChoice[] {
  const unique = [...new Set(codes.map((code) => code.trim()).filter(Boolean))];
  const collator = new Intl.Collator(uiLocale, { sensitivity: 'base' });
  return unique
    .map((code) => {
      const label = displayName(code, uiLocale);
      const native = displayName(code, code);
      return {
        value: code,
        label,
        ...(native !== label && native !== code ? { description: native } : {}),
        meta: code,
        keywords: [native, code],
      };
    })
    .sort((left, right) => collator.compare(left.label, right.label));
}

export function voiceChoices(
  voices: readonly { value: string; name: string; locale: string }[],
  uiLocale = 'en',
): RichChoice[] {
  return voices.map((voice) => ({
    value: voice.value,
    label: voice.name,
    description: displayName(voice.locale, uiLocale),
    meta: voice.locale,
    keywords: [voice.locale],
  }));
}

export function filterChoices(options: readonly RichChoice[], query: string): RichChoice[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [...options];
  return options.filter((option) =>
    [option.label, option.description ?? '', option.meta ?? '', ...(option.keywords ?? [])].some(
      (field) => field.toLocaleLowerCase().includes(needle),
    ),
  );
}

export function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  const needle = query.trim();
  if (!needle) return [{ text, match: false }];
  const lower = text.toLocaleLowerCase();
  const target = needle.toLocaleLowerCase();
  const output: { text: string; match: boolean }[] = [];
  let offset = 0;
  while (offset < text.length) {
    const index = lower.indexOf(target, offset);
    if (index === -1) {
      output.push({ text: text.slice(offset), match: false });
      break;
    }
    if (index > offset) output.push({ text: text.slice(offset, index), match: false });
    output.push({ text: text.slice(index, index + needle.length), match: true });
    offset = index + needle.length;
  }
  return output.length ? output : [{ text, match: false }];
}

export function moveChoiceIndex(key: string, current: number, count: number): number {
  if (count === 0) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowDown') return (current + 1 + count) % count;
  if (key === 'ArrowUp') return (current - 1 + count) % count;
  return current;
}
