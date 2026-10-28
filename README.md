# Zuzu Games — Kurulum

## Klasör yapısı
```
zuzu-games/
├── index.html            ana sayfa
├── style.css, app.js
├── assets/logo.svg       logo
├── games/
│   ├── index.html        oyun listesi
│   └── <oyun-klasoru>/   her oyunun dosyaları (index.html burada)
├── admin/index.html      admin panel  →  siteadresin.com/admin/
└── functions/api/games.js  admin paneli çalıştıran küçük sunucu kodu
```

## Yayına alma (Cloudflare Pages + GitHub)

> Admin panel sunucu kodu (functions/) içerdiği için Pages'e **sürükle-bırak upload ile OLMAZ**.
> GitHub bağlantısı (önerilen) ya da Wrangler gerekir.

1. GitHub'da yeni repo aç, bu klasörün içeriğini yükle (`index.html` repo'nun kökünde olmalı).
2. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → repoyu seç.
   Build command: boş bırak · Build output directory: `/` (ya da boş) → **Save and Deploy**.
3. **KV oluştur:** Cloudflare → **Storage & Databases** → **KV** → **Create** → adı `zuzu-games`.
4. Pages projesi → **Settings** → **Bindings** → **Add** → **KV namespace**
   - Variable name: `GAMES_KV` (aynen böyle)
   - KV namespace: `zuzu-games`
5. Pages projesi → **Settings** → **Variables and Secrets** → **Add** → tip **Secret**
   - Name: `ADMIN_PASSWORD` · Value: uzun ve güçlü bir şifre
6. **Deployments** sekmesinden son deploy'u **Retry/Redeploy** et (binding ve secret ancak yeni deploy'da devreye girer).
7. **Custom domains** → **Set up a custom domain** → Cloudflare'den aldığın domaini yaz.

Wrangler ile istersen: `npx wrangler pages deploy . --project-name zuzu-games`

## Yeni oyun ekleme
1. Oyunun dosyalarını `games/oyun-adi/` içine koy (içinde `index.html` olsun), GitHub'a push et.
2. `siteadresin.com/admin/` → şifreyle gir → **Yeni oyun ekle** → ad, kapak görseli, açıklama gir → Kaydet.
   Oyun adresi otomatik `/games/oyun-adi/` olur. Kart anında sitede görünür.

## Notlar
- Oyunlardaki dosya yolları göreli olmalı: `./script.js` (`/script.js` değil).
- `index.html` içindeki `merhaba@siteadresin.com` adresini kendi e-postanla değiştir.
- Tek dosya limiti 25 MB, projede toplam 20.000 dosya.
