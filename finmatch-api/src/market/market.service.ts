import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { GoldPrice } from './gold-price.entity';
import { ExchangeRate } from './exchange-rate.entity';
import { NewsArticle } from './news-article.entity';

const rssParser = new Parser();

// Public RSS feeds — these are standard, publicly published feeds meant for
// syndication, not private/authenticated endpoints.
const NEWS_FEEDS: { url: string; source: string }[] = [
  { url: 'https://cafef.vn/thi-truong-tai-chinh.rss', source: 'CafeF' },
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

  // ── Cron jobs — populate the tables above. Runs every 30 minutes. ──
  // NOTE: SJC/DOJI/PNJ have no official public JSON API. The scraper below
  // targets each brand's public price page; selectors WILL need updating
  // if a site's markup changes — that's expected maintenance for any
  // scraper-based integration, not a bug. If a fetch fails, the job logs
  // and leaves the last known price in place rather than wiping data.

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshGoldPrices() {
    try {
      // Example target: SJC's public price page. Replace selector with the
      // actual DOM structure at deploy time (verify in a browser devtools).
      const { data } = await axios.get('https://sjc.com.vn/giavang/textContent.php', {
        timeout: 8000,
      });
      const $ = cheerio.load(data);
      // TODO: adjust selector to the real table structure once verified live.
      const buy = Number($('.buy').first().text().replace(/[.,]/g, '')) || undefined;
      const sell = Number($('.sell').first().text().replace(/[.,]/g, '')) || undefined;
      if (buy && sell) {
        await this.goldRepo.upsert({ brand: 'SJC', buy, sell }, ['brand']);
      }
    } catch (err) {
      this.logger.warn(`Gold price crawl failed (SJC): ${(err as Error).message}`);
    }
    // DOJI / PNJ follow the same pattern — add once their page structure is confirmed.
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshExchangeRates() {
    try {
      // exchangerate.host (or SBV's published reference-rate feed) — pick one
      // and set the API key / URL via .env in production.
      const { data } = await axios.get(
        'https://api.exchangerate.host/latest?base=USD&symbols=VND',
        { timeout: 8000 },
      );
      const vndPerUsd = data?.rates?.VND;
      if (vndPerUsd) {
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
          await this.newsRepo.upsert(
            {
              title: item.title,
              summary: (item.contentSnippet ?? '').slice(0, 300),
              imageUrl: item.enclosure?.url,
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
