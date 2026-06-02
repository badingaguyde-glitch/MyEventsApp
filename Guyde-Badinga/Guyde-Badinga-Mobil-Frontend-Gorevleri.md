# Guyde Freny Badinga'nın Mobil Frontend Görevleri

Bu dokümanda, Guyde Freny Badinga tarafından mobil uygulamada (Expo / React Native) üstlenilen ve gerçekleştirilen arayüz (UI) ve kullanıcı deneyimi (UX) görevleri yer almaktadır.

---

## 1. Navigasyon & Uygulama İskeleti (Layout & Navigation)
- **Sayfa Rotaları:** `app/(tabs)/_layout.tsx`, `app/_layout.tsx`
- **Görev:** Expo Router dosya tabanlı yönlendirme altyapısının kurulması ve Tab Layout yapısının tasarlanması.
- **UI Bileşenleri:**
  - **Bottom Tab Navigation:** Ana sayfa, Etkinlikler, Arama, Biletlerim ve Profil sayfaları arasında geçiş sağlayan alt menü çubuğu.
  - **Header Bileşeni:** Sayfa başlıklarını ve geri dönüş butonunu yöneten ortak `Header.tsx` bileşeninin implementasyonu.
  - **Auth Modülü Entegrasyonu:** Giriş durumuna göre rotaların korunmasını sağlayan `AuthContext` sağlayıcısının layout'a sarmalanması.

## 2. Ana Ekran (Home Screen)
- **Sayfa Rotası:** `app/(tabs)/Home.tsx`
- **Görev:** Kullanıcının karşılandığı, yaklaşan etkinliklerin ve kendi düzenlediği etkinliklerin özetini sunan panel.
- **UI Bileşenleri:**
  - **Yaklaşan Etkinlikler Listesi:** Aktif etkinliklerin listelenmesi.
  - **Organizatör Etkinlikleri:** Kullanıcının kendi oluşturduğu etkinliklerin hızlı görünümü.
  - **Kategori Listesi:** Etkinlikleri filtrelemek için şık kategori kartları (`CategoryItem.tsx`).
  - **Pull-to-refresh:** Listenin aşağı çekilerek güncel veriyle yenilenmesi.

## 3. Arama Ekranı (Search Screen)
- **Sayfa Rotası:** `app/(tabs)/search.tsx`
- **Görev:** Kullanıcıların kelime bazlı arama yapabildikleri ve sonuçları inceledikleri ekran.
- **UI Bileşenleri:**
  - Arama çubuğu (ikon destekli, input takibi).
  - Arama kriterlerine uyan etkinlik kartlarının listelenmesi.
  - Sonuç bulunamadığında kullanıcı dostu "Sonuç Bulunamadı" tasarımı.

## 4. Biletlerim Ekranı (My Tickets Screen)
- **Sayfa Rotası:** `app/(tabs)/mytickets.jsx`
- **Görev:** Kullanıcının satın aldığı tüm biletleri (Aktif, Kullanılmış, İptal Edilmiş) listelediği ekran.
- **UI Bileşenleri:**
  - **Bilet Kartları:** Kesik bilet stili barındıran bilet detay görünümü.
  - **Bilet İptal Mekanizması:** Biletin iptal edilebilmesi için onay penceresi (`Alert.alert`) ve API tetiklemesi.
  - Etkinlik zamanı geçmiş biletlerin durum göstergeleri.

## 5. Profil Ekranı (Profile Screen)
- **Sayfa Rotası:** `app/(tabs)/profile.jsx`
- **Görev:** Kullanıcının hesap bilgilerini görüntülediği ve çıkış yapabildiği ekran.
- **UI Bileşenleri:**
  - Profil başlığı, kullanıcı adı ve e-posta bilgileri.
  - Çıkış yap (Sign Out) butonu yardımıyla `AuthContext` üzerinden token'ların silinmesi ve giriş ekranına yönlendirme.
