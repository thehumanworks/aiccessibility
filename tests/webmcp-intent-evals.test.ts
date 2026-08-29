import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect as vitestExpect } from 'vitest';

type JsonRecord = Record<string, unknown>;

// Vitest's runtime supports assertion messages, while its matcher type accepts
// only the value. Keep corpus diagnostics without weakening any case types.
const expect = <T>(actual: T, _message?: string) => vitestExpect(actual);

const corpusPath = resolve(process.cwd(), 'evals/webmcp-intent-corpus.json');
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as JsonRecord;

const expectedToolCatalog = [
  'get_gallery_state',
  'list_artworks',
  'navigate_to_artwork',
  'set_experience_mode',
  'list_regions',
  'focus_artwork_area',
  'analyze_artwork_regions',
  'zoom_to_artwork_detail',
  'focus_region',
  'describe_region',
  'clear_region_focus',
  'get_artwork_context',
  'publish_gallery_response',
  'clear_gallery_response',
  'configure_presentation',
  'get_session_activity',
  'undo_last_change',
] as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function records(value: unknown, label: string): JsonRecord[] {
  expect(Array.isArray(value), `${label} must be an array`).toBe(true);
  return value as JsonRecord[];
}

function containsJsonString(value: unknown, target: string): boolean {
  if (value === target) return true;
  if (Array.isArray(value)) {
    return value.some((entry) => containsJsonString(entry, target));
  }
  if (isRecord(value)) {
    return Object.values(value).some((entry) => containsJsonString(entry, target));
  }
  return false;
}

describe('WebMCP intent evaluation corpus', () => {
  it('has the expected version, catalog, size, and unique case ids', () => {
    expect(Object.keys(corpus).sort()).toEqual(
      ['schemaVersion', 'name', 'description', 'toolCatalog', 'cases'].sort(),
    );
    expect(corpus.schemaVersion).toBe('1.0');
    expect(corpus.toolCatalog).toEqual(expectedToolCatalog);

    const cases = records(corpus.cases, 'cases');
    expect(cases.length).toBeGreaterThanOrEqual(35);
    expect(cases.length).toBeLessThanOrEqual(50);

    const ids = cases.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(typeof id).toBe('string');
      expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('validates every case, expected call, order stage, and mock result', () => {
    const validTools = new Set(expectedToolCatalog);
    const validLanguages = new Set(['en', 'es', 'fr']);
    const validCaseKeys = new Set([
      'id',
      'language',
      'intent',
      'tags',
      'prompt',
      'state',
      'expected',
      'mockToolResults',
      'disallowedCalls',
    ]);

    for (const testCase of records(corpus.cases, 'cases')) {
      const label = `case ${String(testCase.id)}`;
      expect(
        Object.keys(testCase).every((key) => validCaseKeys.has(key)),
        `${label} has unknown keys`,
      ).toBe(true);
      expect(validLanguages.has(String(testCase.language)), `${label} language`).toBe(true);
      expect(typeof testCase.intent, `${label} intent`).toBe('string');
      expect(String(testCase.intent).trim().length, `${label} intent`).toBeGreaterThan(0);
      expect(typeof testCase.prompt, `${label} prompt`).toBe('string');
      expect(String(testCase.prompt).trim().length, `${label} prompt`).toBeGreaterThan(0);

      const tags = testCase.tags;
      expect(Array.isArray(tags), `${label} tags`).toBe(true);
      expect((tags as unknown[]).length, `${label} tags`).toBeGreaterThan(0);
      expect((tags as unknown[]).every((tag) => typeof tag === 'string'), `${label} tag types`).toBe(true);

      expect(isRecord(testCase.expected), `${label} expected`).toBe(true);
      const expected = testCase.expected as JsonRecord;
      expect(Object.keys(expected).sort(), `${label} expected keys`).toEqual(
        ['outcome', 'calls', 'order', 'allowAdditionalCalls'].sort(),
      );
      expect(['tool_calls', 'no_tool']).toContain(expected.outcome);
      expect(typeof expected.allowAdditionalCalls, `${label} allowAdditionalCalls`).toBe('boolean');

      const calls = records(expected.calls, `${label} expected.calls`);
      const callIds = calls.map(({ id }) => id);
      expect(new Set(callIds).size, `${label} unique call ids`).toBe(callIds.length);

      for (const call of calls) {
        expect(Object.keys(call).sort(), `${label} call keys`).toEqual(
          ['id', 'tool', 'arguments', 'argumentMatch'].sort(),
        );
        expect(typeof call.id, `${label} call id`).toBe('string');
        expect(validTools.has(String(call.tool) as (typeof expectedToolCatalog)[number]), `${label} expected tool ${String(call.tool)}`).toBe(true);
        expect(isRecord(call.arguments), `${label} arguments for ${String(call.id)}`).toBe(true);
        expect(['exact', 'subset']).toContain(call.argumentMatch);
      }

      const order = records(expected.order, `${label} expected.order`) as unknown as unknown[][];
      expect(order.every((stage) => Array.isArray(stage) && stage.length > 0), `${label} non-empty order stages`).toBe(true);
      const orderedIds = order.flat();
      expect(orderedIds, `${label} order covers calls once`).toEqual(callIds);
      expect(new Set(orderedIds).size, `${label} duplicate order ids`).toBe(orderedIds.length);

      if (expected.outcome === 'no_tool') {
        expect(calls, `${label} no-tool calls`).toEqual([]);
        expect(order, `${label} no-tool order`).toEqual([]);
      } else {
        expect(calls.length, `${label} tool-call count`).toBeGreaterThan(0);
      }

      const disallowed = records(testCase.disallowedCalls, `${label} disallowedCalls`);
      const expectedTools = new Set(calls.map(({ tool }) => tool));
      for (const forbidden of disallowed) {
        expect(Object.keys(forbidden).sort(), `${label} disallowed keys`).toEqual(
          ['tool', 'reason'].sort(),
        );
        expect(validTools.has(String(forbidden.tool) as (typeof expectedToolCatalog)[number]), `${label} disallowed tool ${String(forbidden.tool)}`).toBe(true);
        expect(typeof forbidden.reason, `${label} disallowed reason`).toBe('string');
        expect(String(forbidden.reason).trim().length, `${label} disallowed reason`).toBeGreaterThan(0);
        expect(expectedTools.has(forbidden.tool), `${label} contradictory expected/disallowed tool ${String(forbidden.tool)}`).toBe(false);
      }

      if (testCase.mockToolResults !== undefined) {
        expect(isRecord(testCase.mockToolResults), `${label} mockToolResults`).toBe(true);
        for (const resultId of Object.keys(testCase.mockToolResults as JsonRecord)) {
          expect(callIds, `${label} mock result ${resultId} refers to an expected call`).toContain(resultId);
        }
      }
    }
  });

  it('maintains language, intent, safety, ambiguity, and journey coverage', () => {
    const cases = records(corpus.cases, 'cases');
    const countLanguage = (language: string) => cases.filter((entry) => entry.language === language).length;
    const countTag = (tag: string) => cases.filter((entry) => Array.isArray(entry.tags) && entry.tags.includes(tag)).length;
    const intents = new Set(cases.map(({ intent }) => intent));
    const usedTools = new Set(
      cases.flatMap((entry) =>
        isRecord(entry.expected) && Array.isArray(entry.expected.calls)
          ? entry.expected.calls
              .filter(isRecord)
              .map(({ tool }) => tool)
          : [],
      ),
    );

    expect(countLanguage('en')).toBeGreaterThanOrEqual(30);
    expect(countLanguage('es')).toBeGreaterThanOrEqual(3);
    expect(countLanguage('fr')).toBeGreaterThanOrEqual(3);
    expect(countTag('journey')).toBeGreaterThanOrEqual(8);
    expect(countTag('negative')).toBeGreaterThanOrEqual(6);
    expect(countTag('ambiguous')).toBeGreaterThanOrEqual(5);
    expect(countTag('provenance')).toBeGreaterThanOrEqual(5);
    expect(countTag('authored-region')).toBeGreaterThanOrEqual(3);
    expect(countTag('agent-grounded')).toBeGreaterThanOrEqual(2);
    expect(countTag('model-region')).toBeGreaterThanOrEqual(3);
    expect(countTag('stale-state')).toBeGreaterThanOrEqual(1);
    expect(usedTools).toEqual(new Set(expectedToolCatalog));

    for (const requiredIntent of [
      'artwork-navigation',
      'mood-navigation',
      'speaking-style',
      'visual-theme',
      'personalization',
      'description-branching',
      'region-focus',
      'model-region-analysis',
      'zoom-out',
      'response-publishing',
      'undo',
      'stale-state-recovery',
      'safe-abstention',
    ]) {
      expect(intents.has(requiredIntent), `missing intent ${requiredIntent}`).toBe(true);
    }
  });

  it('keeps subset patterns statically meaningful without executing matching', () => {
    for (const testCase of records(corpus.cases, 'cases')) {
      if (!isRecord(testCase.expected)) continue;
      const calls = records(
        testCase.expected.calls,
        `case ${String(testCase.id)} expected.calls`,
      );
      const mocks = isRecord(testCase.mockToolResults)
        ? testCase.mockToolResults
        : {};

      for (const call of calls) {
        if (call.argumentMatch !== 'subset' || !isRecord(call.arguments)) {
          continue;
        }
        const label = `case ${String(testCase.id)} subset ${String(call.tool)}`;

        if (call.tool === 'zoom_to_artwork_detail') {
          expect(typeof call.arguments.query, `${label} stable query`).toBe(
            'string',
          );
          expect(
            String(call.arguments.query).trim().length,
            `${label} non-empty query`,
          ).toBeGreaterThan(0);
        }

        if (call.tool === 'focus_artwork_area') {
          // The model may generate the required label, but the user-supplied
          // bounds are stable and must never disappear from the expectation.
          expect(isRecord(call.arguments.bounds), `${label} stable bounds`).toBe(
            true,
          );
          expect(Object.keys(call.arguments.bounds as JsonRecord).sort()).toEqual(
            ['x', 'y', 'width', 'height'].sort(),
          );
        }

        if (call.tool === 'publish_gallery_response') {
          const segments = records(
            call.arguments.segments,
            `${label} required segments`,
          );
          expect(segments.length, `${label} non-empty segments`).toBeGreaterThan(
            0,
          );
          for (const segment of segments) {
            expect(typeof segment.provenance, `${label} provenance`).toBe(
              'string',
            );
            if (
              segment.provenance === 'observed' ||
              segment.provenance === 'known'
            ) {
              expect(typeof segment.statementId, `${label} statement id`).toBe(
                'string',
              );
              const statementId = String(segment.statementId);
              expect(
                Object.values(mocks).some((mock) =>
                  containsJsonString(mock, statementId),
                ),
                `${label} statement id must originate in a prior mock result`,
              ).toBe(true);
            } else {
              expect(['interpreted', 'imagined']).toContain(segment.provenance);
              // Generated text is intentionally omitted from subset patterns.
              expect(segment.text, `${label} generated text`).toBeUndefined();
            }
          }
        }
      }
    }
  });

  it('contains real ordered and unordered journey semantics', () => {
    const cases = records(corpus.cases, 'cases');
    const journeys = cases.filter((entry) => Array.isArray(entry.tags) && entry.tags.includes('journey'));
    const multiStageJourneys = journeys.filter((entry) => {
      if (!isRecord(entry.expected)) return false;
      return Array.isArray(entry.expected.order) && entry.expected.order.length > 1;
    });
    expect(multiStageJourneys.length).toBeGreaterThanOrEqual(8);

    // Multiple call ids in one stage are unordered, while stages stay ordered.
    const hasUnorderedStage = journeys.some((entry) => {
      if (!isRecord(entry.expected) || !Array.isArray(entry.expected.order)) {
        return false;
      }
      return entry.expected.order.some(
        (stage) => Array.isArray(stage) && stage.length > 1,
      );
    });
    expect(hasUnorderedStage).toBe(true);
  });
});
