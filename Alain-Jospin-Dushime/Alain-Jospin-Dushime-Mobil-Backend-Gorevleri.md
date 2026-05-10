# Alain Jospin Dushime'nin Mobil Backend Görevleri

## 1. Yeni Etkinlik Oluşturma Servisi
- **API Endpoint:** `POST /events`
- **Görev:** Mobil uygulama üzerinden yeni etkinlik yaratma
- **İşlevler:**
  - Etkinlik detaylarını (tarih, kapasite, vb.) ve görseli backend'e iletme
- **Teknik Detaylar:**
  - Resim yüklemek için HTTP Client ile `multipart/form-data` yapılandırması

## 2. Etkinlik Bilgilerini Güncelleme Servisi
- **API Endpoint:** `PUT /events/{eventid}`
- **Görev:** Daha önce oluşturulmuş bir etkinliğin detaylarını düzenleme
- **İşlevler:**
  - Mevcut verileri forma doldurma ve değiştirilen kısımları API'ye iletme
- **Teknik Detaylar:**
  - Görsel güncelleme işlemleri ve UI'da anında yansıtma

## 3. Etkinlik İptal Etme Servisi
- **API Endpoint:** `DELETE /events/{eventid}`
- **Görev:** Organizatörün kendi etkinliğini tamamen iptal edip sistemden kaldırması
- **İşlevler:**
  - Etkinlik detay sayfasında iptal seçeneği sunma ve API çağrısı
- **Teknik Detaylar:**
  - Onay (Confirmation) dialog yönetimi ve ardından liste ekranına dönüş

## 4. Bilet Satın Alma Servisi (Stripe Entegrasyonu)
- **API Endpoint:** `POST /tickets`
- **Görev:** Etkinliğe katılmak için bilet satın alma ve ödeme sürecini başlatma
- **İşlevler:**
  - API çağrısı yaparak Stripe Checkout URL'sini (`stripeUrl`) alma
- **Teknik Detaylar:**
  - WebView veya CustomTabs ile Stripe ödeme sayfasına güvenli yönlendirme
  - Deep linking ile (`successUrl` ve `cancelUrl`) uygulamaya dönüş işlemi

## 5. Kullanıcının Biletlerini Listeleme Servisi
- **API Endpoint:** `GET /tickets`
- **Görev:** Satın alınan tüm biletleri "Mes Billets" ekranında listeleme
- **İşlevler:**
  - Aktif, geçmiş veya kullanılmış biletleri filtreleyip mobil arayüzde gösterme
- **Teknik Detaylar:**
  - Pull-to-refresh mekanizması ile en güncel bilet durumlarını yükleme

## 6. Katılım Kodunu Doğrulama (Check-in) Servisi
- **API Endpoint:** `POST /tickets/verify`
- **Görev:** Organizatörün bilet üzerindeki QR veya kodu tarayarak doğrulama yapması
- **İşlevler:**
  - Taranan kodu API'ye gönderip biletin geçerliliğini kontrol etme
- **Teknik Detaylar:**
  - Mobil kamera kütüphanesi (ZXing veya Vision Framework) entegrasyonu

## 7. Etkinlik Katılımcılarını Listeleme Servisi
- **API Endpoint:** `GET /events/{eventid}/participants`
- **Görev:** Organizatörün kendi etkinliğine katılan kullanıcıları listeleyebilmesi
- **İşlevler:**
  - İlgili etkinliğe ait bilet sahiplerinin verilerini API'den çekme
- **Teknik Detaylar:**
  - Katılımcı sayısını ve doluluk oranını mobil ekranda görselleştirme

## 8. Bilet İptal Etme Servisi
- **API Endpoint:** `DELETE /tickets/{ticketid}`
- **Görev:** Kullanıcının aldığı bileti iade/iptal etmesi
- **İşlevler:**
  - Bilet iptal onayı sonrası silme işlemi
- **Teknik Detaylar:**
  - API çağrısı sonrası UI'dan bileti anlık kaldırma

## 9. Stripe Ödeme Doğrulama Webhook'u (RabbitMQ Asenkron Senkronizasyon)
- **API Endpoint:** `POST /api/payment/webhook` (Backend Tarafı)
- **Görev:** Mobil uygulamanın RabbitMQ arka plan süreçlerinden (email gönderimi) haberdar olması
- **İşlevler:**
  - Ödeme tamamlandığında uygulamanın, webhook ve RabbitMQ tarafından bilet durumunun `active` olarak güncellendiğini UI'da göstermesi
- **Teknik Detaylar:**
  - Ödeme başarılı sayfasından dönüldüğünde RabbitMQ işlemlerinin (PDF/Email) tamamlandığını varsayarak bilet listesini sunucudan tekrar çekme
