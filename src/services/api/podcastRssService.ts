import { XMLParser } from 'fast-xml-parser';
import { PodcastEpisode } from '../../models/podcast';
import { generateId } from '../../utils/id';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

function parseDurationToSeconds(raw: unknown): number | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  const parts = value.split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return null;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function stripHtml(html: unknown): string {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function fetchEpisodes(feedUrl: string, limit = 30): Promise<PodcastEpisode[]> {
  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`Failed to load RSS feed: ${response.status}`);
  }
  const xml = await response.text();
  const parsed = parser.parse(xml);
  const rawItems = asArray(parsed?.rss?.channel?.item);

  return rawItems
    .slice(0, limit)
    .map((item: any): PodcastEpisode => {
      const enclosure = item.enclosure ?? {};
      return {
        id: generateId(),
        title: String(item.title ?? 'Untitled episode'),
        pubDate: String(item.pubDate ?? ''),
        description: stripHtml(item.description ?? item['itunes:summary']),
        audioUrl: String(enclosure['@_url'] ?? ''),
        durationSeconds: parseDurationToSeconds(item['itunes:duration']),
      };
    })
    .filter((episode) => episode.audioUrl.length > 0);
}

export const podcastRssService = { fetchEpisodes };
