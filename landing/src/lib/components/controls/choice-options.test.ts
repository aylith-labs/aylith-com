import { describe, expect, it } from 'vitest';
import {
  filterChoices,
  highlightSegments,
  languageChoices,
  moveChoiceIndex,
  SPEECH_LANGUAGE_CODES,
  VIEW_CHOICES,
  VOICE_ROUTE_CHOICES,
} from './choice-options';

describe('rich choice data', () => {
  it('retains the full source-known language catalog and dynamic additions without a small cap', () => {
    expect(SPEECH_LANGUAGE_CODES.length).toBe(100);
    const choices = languageChoices([...SPEECH_LANGUAGE_CODES, 'en-US', 'hu-HU', 'x-custom'], 'en');
    expect(choices.length).toBe(103);
    expect(choices.find((choice) => choice.value === 'hu')?.label).toMatch(/Hungarian/i);
    expect(choices.find((choice) => choice.value === 'hu')?.description).toMatch(/magyar/i);
    expect(choices.find((choice) => choice.value === 'hu')?.meta).toBe('hu');
    expect(choices.find((choice) => choice.value === 'x-custom')?.meta).toBe('x-custom');
  });

  it('matches label, native description, and code while marking only visible substrings', () => {
    const choices = languageChoices(['en', 'hu', 'fr'], 'en');
    expect(filterChoices(choices, 'magyar').map((choice) => choice.value)).toEqual(['hu']);
    expect(filterChoices(choices, 'hu').map((choice) => choice.value)).toEqual(['hu']);
    expect(highlightSegments('Hungarian', 'gar')).toEqual([
      { text: 'Hun', match: false },
      { text: 'gar', match: true },
      { text: 'ian', match: false },
    ]);
    expect(highlightSegments('Hungarian', '')).toEqual([{ text: 'Hungarian', match: false }]);
  });

  it('offers descriptive view and route choices and predictable keyboard movement', () => {
    expect(VIEW_CHOICES.map((choice) => choice.value)).toEqual(['explore', 'ayla']);
    expect(VOICE_ROUTE_CHOICES.map((choice) => choice.value)).toEqual([
      'auto',
      'browser',
      'owned',
    ]);
    expect(moveChoiceIndex('ArrowDown', 2, 3)).toBe(0);
    expect(moveChoiceIndex('ArrowUp', 0, 3)).toBe(2);
    expect(moveChoiceIndex('Home', 2, 3)).toBe(0);
    expect(moveChoiceIndex('End', 0, 3)).toBe(2);
    expect(moveChoiceIndex('ArrowDown', -1, 0)).toBe(-1);
  });
});
