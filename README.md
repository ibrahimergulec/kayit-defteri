# 📘 Kayıt Defteri

> Cari defter işlemlerinizi cebinize taşıyan, **çevrimdışı çalışan** modern bir hesap takip uygulaması.

[![GitHub Pages](https://img.shields.io/badge/demo-canlı-2563eb?style=for-the-badge&logo=github)](https://ibrahimergulec.github.io/kayit-defteri/)
[![PWA](https://img.shields.io/badge/PWA-kurulabilir-10b981?style=for-the-badge&logo=pwa)](https://ibrahimergulec.github.io/kayit-defteri/)
[![Offline](https://img.shields.io/badge/çevrimdışı-destekli-f59e0b?style=for-the-badge)](https://ibrahimergulec.github.io/kayit-defteri/)

---

## ✨ Özellikler

| | |
|---|---|
| 👥 **Müşteri Yönetimi** | Ad, telefon, adres ve vergi numarası ile müşteri kartları |
| 📝 **Hareket Takibi** | Borç ekleme / ödeme alma, açıklama ve tarih ile |
| 📊 **Rapor Ekranı** | Toplam borç, alacak ve net bakiye özetleri |
| 🔍 **Arama** | Müşteriler arasında anlık isim arama |
| 🔒 **Kullanıcı Sistemi** | Giriş / çıkış, şifre değiştirme, admin paneli ile kullanıcı yönetimi |
| 📴 **Çevrimdışı Mod** | İnternet yokken bile tüm işlemler **IndexedDB** ile cihazda saklanır |
| ☁️ **Otomatik Senkronizasyon** | Bağlantı geldiğinde veriler sunucuyla (Supabase) otomatik eşitlenir |
| 📱 **PWA** | Telefona kurulabilir, uygulama gibi çalışır |
| 🌐 **Çevrimiçi / Çevrimdışı Rozeti** | Anlık bağlantı durumu üstte görünür |

---

## 🚀 Canlı Demo

👉 **[ibrahimergulec.github.io/kayit-defteri](https://ibrahimergulec.github.io/kayit-defteri/)**

> Tarayıcıda "Ana ekrana ekle" derseniz telefonunuza uygulama olarak kurulur. 📲

---

## 🛠️ Teknolojiler

**Ön Yüz** — tamamen bağımsız çalışır, derleme adımı yoktur

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)

**Arka Yüz & Veri**

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![IndexedDB](https://img.shields.io/badge/IndexedDB-4285F4?logo=googlechrome&logoColor=white)

---

## 📂 Proje Yapısı

```
kayit-defteri/
├── index.html      # Tüm arayüz + uygulama mantığı (tek dosya, bağımlılıksız)
├── manifest.json   # PWA tanımı
├── sw.js           # Service worker
├── server.js       # Express API sunucusu
└── package.json
```

---

## ⚙️ Kurulum

### 1️⃣ Ön yüzü çalıştır (yeterli)

GitHub Pages üzerinde barındırıldığı için ekstra bir şey gerekmez.
Yerelde denemek isterseniz:

```bash
npx serve .
```

### 2️⃣ API sunucusunu çalıştır (isteğe bağlı — senkronizasyon için)

```bash
npm install
npm start
```

Sunucu, Supabase'e bağlanarak müşteri ve hareket verilerini eşitler.
Sunucu yoksa uygulama **tamamen çevrimdışı modda** çalışmaya devam eder.

---

## 🔐 Varsayılan Giriş

| Kullanıcı adı | Şifre | Rol |
|---|---|---|
| `admin` | `admin` | Admin |

> ⚠️ İlk girişten sonra şifrenizi **Ayarlar → Şifre Değiştir** bölümünden mutlaka güncelleyin.

---

## 🧠 Nasıl Çalışır?

```
┌─────────────────┐         ┌──────────────┐         ┌────────────┐
│   Tarayıcı      │────────▶│   Express    │────────▶│  Supabase  │
│  (PWA)          │  /api   │   API        │         │  (PostgreSQL)
│                 │◀────────│              │◀────────│            │
└────────┬────────┘         └──────────────┘         └────────────┘
         │  senkron
         ▼
┌─────────────────┐
│   IndexedDB     │  ← internet yokken burada tutulur,
│  + localStorage │    bağlantı gelince otomatik gönderilir
└─────────────────┘
```

1. Tüm veriler önce cihazdaki **IndexedDB**'ye yazılır.
2. İnternet varsa **Express API** üzerinden **Supabase**'e gönderilir.
3. Bağlantı koparsa işlemler kuyruğa alınır, bağlantı dönünce **otomatik senkronize** edilir.
4. Kullanıcı bilgileri çevrimdışı giriş için **localStorage**'da tutulur.

---

## 🗺️ Yol Haritası

- [ ] PDF / Excel rapor dışa aktarma
- [ ] Hatırlatma bildirimleri (vadesi yaklaşan borçlar)
- [ ] Çoklu para birimi desteği
- [ ] Karanlık mod 🌙

---

## ⚠️ Not

Bu proje kişisel/küçük işletme kullanımı için geliştirilmiştir ve **resmi muhasebe kaydı yerine geçmez**.

---


<div align="center">

**📘 Kayıt Defteri** — *Defteriniz her zaman cebinizde.*

⭐ Beğendiyseniz yıldız vermeyi unutmayın!

</div>
