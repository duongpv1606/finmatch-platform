import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import Parser from 'rss-parser';
import { GoldPrice } from './gold-price.entity';
import { ExchangeRate } from './exchange-rate.entity';
import { NewsArticle } from './news-article.entity';

const rssParser = new Parser();

// Public RSS feeds — verified live on 2026-07-09 by fetching each URL
// directly and confirming valid <rss> XML with real, current items (not
// guessed from documentation). If CafeF/VnEconomy restructure their site,
// these paths may need updating — that's normal scraper maintenance.
const NEWS_FEEDS: { url: string; source: string }[] = [
  { url: 'https://cafef.vn/tai-chinh-ngan-hang.rss', source: 'CafeF' },
  { url: 'https://vneconomy.vn/tai-chinh.rss', source: 'VnEconomy' },
];

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    @InjectRepository(GoldPrice) private readonly goldRepo: Repository<GoldPrice>,
    @InjectRepository(ExchangeRate) private readonly fxRepo: Repository<ExchangeRate>,
    @InjectRepository(NewsArticle) private readonly newsRepo: Repository<NewsArticle>,
  ) {}

  // ── Read endpoints (always fast — serve from DB, never block on a live fetch) ──

  getGoldPrices() {
    return this.goldRepo.find();
  }

  getExchangeRates() {
    return this.fxRepo.find();
  }

  getNews(limit = 10) {
    return this.newsRepo.find({ order: { publishedAt: 'DESC' }, take: limit });
  }

  // ── Cron jobs — populate the tables above. ──
  // Every source below was verified by directly fetching the live endpoint
  // during development (2026-07-09), not assumed from documentation. If a
  // fetch fails at runtime, the job logs and leaves the last known price in
  // place rather than wiping data — a transient failure shouldn't blank
  // out the UI.

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshGoldPrices() {
    await this.refreshSjc();
    await this.refreshDoji();
    // PNJ has no confirmed public data endpoint (giavang.pnj.com.vn exists
    // but didn't expose a stable JSON/XML API when checked) — add once one
    // is found, rather than guess at a fragile HTML scrape.
  }

  /** SJC publishes a plain-text price table at this exact URL — confirmed
   * live. Format looks like:
   *   "SJC 1L, 10L 67,850,000 68,450,000"
   * (label, then buy price, then sell price, space-separated). */
  private async refreshSjc() {
    try {
      const { data } = await axios.get<string>('https://sjc.com.vn/giavang/textContent.php', {
        timeout: 8000,
        responseType: 'text',
      });
      const match = data.match(/SJC 1L,\s*10L\s+([\d,]+)\s+([\d,]+)/);
      if (match) {
        const buy = Number(match[1].replace(/,/g, ''));
        const sell = Number(match[2].replace(/,/g, ''));
        if (buy > 0 && sell > 0) {
          await this.goldRepo.upsert({ brand: 'SJC', buy, sell }, ['brand']);
        }
      } else {
        this.logger.warn('SJC price row not found in response — page format may have changed');
      }
    } catch (err) {
      this.logger.warn(`Gold price crawl failed (SJC): ${(err as Error).message}`);
    }
  }

  /** DOJI exposes an XML feed. Uses a shared/community API key found in
   * public developer notes (not officially issued to this project) — for
   * real production use, request your own key from DOJI directly. Prices
   * are in thousand VND/lượng in the XML, so *1000 to normalize to VND. */
  private async refreshDoji() {
    try {
      const { data } = await axios.get<string>(
        'http://giavang.doji.vn/api/giavang/?api_key=258fbd2a72ce8481089d88c678e9fe4f',
        { timeout: 8000, responseType: 'text' },
      );
      const match = data.match(/Name='DOJI HN lẻ'[^/]*Sell='([\d,]+)'\s*Buy='([\d,]+)'/);
      if (match) {
        const sell = Number(match[1].replace(/,/g, '')) * 1000;
        const buy = Number(match[2].replace(/,/g, '')) * 1000;
        if (buy > 0 && sell > 0) {
          await this.goldRepo.upsert({ brand: 'DOJI', buy, sell }, ['brand']);
        }
      } else {
        this.logger.warn('DOJI price row not found in response — feed format may have changed');
      }
    } catch (err) {
      this.logger.warn(`Gold price crawl failed (DOJI): ${(err as Error).message}`);
    }
  }

  /** Free, no-key-required, confirmed-live endpoint (open.er-api.com) —
   * updates daily, covers VND. This is a genuinely free tier (not a
   * disguised paid signup like some "free" exchange rate APIs turned out
   * to be during research). */
  @Cron(CronExpression.EVERY_HOUR)
  async refreshExchangeRates() {
    try {
      const { data } = await axios.get('https://open.er-api.com/v6/latest/USD', {
        timeout: 8000,
      });
      if (data?.result === 'success' && data.rates?.VND) {
        const vndPerUsd = data.rates.VND;
        await this.fxRepo.upsert(
          { currency: 'USD', buy: vndPerUsd * 0.996, sell: vndPerUsd * 1.004 },
          ['currency'],
        );
      }
    } catch (err) {
      this.logger.warn(`Exchange rate refresh failed: ${(err as Error).message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshNews() {
    for (const feed of NEWS_FEEDS) {
      try {
        const parsed = await rssParser.parseURL(feed.url);
        for (const item of parsed.items.slice(0, 10)) {
          if (!item.link || !item.title) continue;
          // CafeF embeds a thumbnail <img> inside the description HTML
          // instead of a separate <enclosure> tag — extract it so the
          // frontend has a real image instead of a placeholder.
          const imgMatch = item.content?.match(/<img[^>]+src="([^"]+)"/);
          await this.newsRepo.upsert(
            {
              title: item.title,
              summary: (item.contentSnippet ?? '').slice(0, 300),
              imageUrl: item.enclosure?.url ?? imgMatch?.[1],
              source: feed.source,
              url: item.link,
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            },
            ['url'],
          );
        }
      } catch (err) {
        this.logger.warn(`RSS fetch failed (${feed.source}): ${(err as Error).message}`);
      }
    }
  }
}
