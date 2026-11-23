import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });
import { purgeCloudflareCache } from "../src/lib/cloudflare";

// Dijalankan setelah deploy agar CDN tidak menyajikan HTML lama yang merujuk aset build lama.
purgeCloudflareCache().then((ok) => {
  console.log(ok ? "Cache Cloudflare dibersihkan." : "Purge dilewati/gagal (cek CLOUDFLARE_ZONE_ID & CLOUDFLARE_API_TOKEN).");
});
