import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// ISR cache di R2 (dibungkus Cache API regional agar hemat operasi R2) dan
// revalidasi latar belakang lewat memory-queue. Halaman dengan `revalidate`
// tidak lagi dirender + query Turso pada setiap kunjungan.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "short-lived" }),
  queue: memoryQueue,
});
