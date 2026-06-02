# Alain Jospin Dushime'nin Mobil Frontend Görevleri

Bu dokümanda, Alain Jospin Dushime tarafından mobil uygulamada (Expo / React Native) üstlenilen ve gerçekleştirilen arayüz (UI) ve kullanıcı deneyimi (UX) görevleri yer almaktadır.

---

## 1. Giriş Ekranı (Login Screen)
- **Sayfa Rotası:** `app/login.tsx`
- **Görev:** Kullanıcıların e-posta ve şifre kullanarak giriş yapmasını sağlayan ekran.
- **UI Bileşenleri:**
  - E-posta ve Şifre giriş alanları (secure text entry ve keyboard handling).
  - Giriş Yap butonu (loading/spinner durumu entegrasyonlu).
  - Şifre ve e-posta kontrolü sonrasında `AuthContext` aracılığıyla JWT token'ın `AsyncStorage`'a kaydedilmesi ve yönlendirme.

## 2. Etkinlik Listesi Ekranı (Events List Screen)
- **Sayfa Rotası:** `app/(tabs)/events.tsx`
- **Görev:** Sistemde kayıtlı olan tüm aktif etkinlikleri listeleyen ekran.
- **UI Bileşenleri:**
  - **Dinamik Kart Tasarımları (`EventCard.tsx`):** Etkinliğin resmi, başlığı, tarihi, konumu ve fiyatı.
  - Pull-to-refresh desteği ile listelerin güncellenmesi.
  - Kartların üzerine tıklandığında detay sayfasına yönlendirme.

## 3. Etkinlik Detay Ekranı (Event Details Screen)
- **Sayfa Rotası:** `app/event/[id].tsx`
- **Görev:** Seçilen etkinliğin tüm ayrıntılarının görüntülendiği ekran.
- **UI Bileşenleri:**
  - Başlık, tarih, konum, bilet fiyatı ve açıklama bilgileri.
  - Kontenjan durumu takibi ve bilet kalmadığında devre dışı kalan satın alım butonları.
  - **Stripe Entegrasyonu:** Bilet satın alma talebinde kullanıcıyı doğrudan Stripe ödeme sayfasına yönlendiren external linking altyapısı.

## 4. Etkinlik Oluşturma Ekranı (Create Event Screen)
- **Sayfa Rotası:** `app/create-event.tsx`
- **Görev:** Organizatörler için çok adımlı etkinlik oluşturma formu.
- **UI Bileşenleri:**
  - Etkinlik detayları formu: Başlık, açıklama, kategori seçimi (birden fazla kategori desteği), konum (şehir, adres, mekan adı ve enlem/boylam koordinatları), tarih, kapasite ve bilet fiyatı.
  - **Stripe Ücret Entegrasyonu:** Oluşturulan ücretli etkinlikler için ödenmesi gereken listeleme komisyonunun Stripe checkout sayfasına yönlendirilmesi.

## 5. Etkinlik Yönetim ve Doğrulama Ekranı (Manage Event & QR Verification Screen)
- **Sayfa Rotası:** `app/manage-event/[id].tsx`
- **Görev:** Organizatörlerin katılımcıları yönettiği, bilet durumlarını izlediği ve biletleri kapıda doğruladığı kontrol paneli.
- **UI Bileşenleri:**
  - İstatistiki kartlar: Satılan Bilet Sayısı, Check-in Yapan Katılımcı Sayısı, Toplam Gelir.
  - Katılımcı tablosu: Katılımcı isimleri, e-posta adresleri, bilet kodları, check-in zamanları ve manuel check-in butonları.
  - **Çevrimdışı Bilet Doğrulama Modu (Offline QR Mode):** İnternet bağlantısı koptuğunda bilet listesini yerel cihaz önbelleğinde (`AsyncStorage`) tutarak QR kod ve manuel kod sorgulamalarını yerel verilerle gerçekleştirme.
  - **Veri Kuyruğu & Toplu Eşitleme (Bulk Sync):** Çevrimdışı yapılan giriş işlemlerinin yerel olarak kaydedilmesi ve internet bağlantısı geldiğinde toplu olarak `/tickets/bulk-verify` üzerinden backend veritabanıyla senkronize edilmesi.
