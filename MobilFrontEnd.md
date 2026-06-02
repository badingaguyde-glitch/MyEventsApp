# Mobil Frontend Görev Dağılımı

Bu dokümanda, mobil uygulamanın kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan ekranların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumlu ve yetkilidir.

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Guyde Freny Badinga'nın Mobil Frontend Görevleri](Guyde-Badinga/Guyde-Badinga-Mobil-Frontend-Gorevleri.md)
2. [Alain Jospin Dushime'nin Mobil Frontend Görevleri](Alain-Jospin-Dushime/Alain-Jospin-Dushime-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi & Arayüz (UI)
- **CSS ve Stil Yönetimi:** Tailwind CSS tabanlı NativeWind entegrasyonu ile tutarlı mobil arayüz geliştirme.
- **Renk Paleti:** Tutarlı renk yönetimi (`COLORS.primary`, `COLORS.secondary`, `bg-white`, nötr gri tonları).
- **Tipografi:** Okunabilir mobil font boyutları ve ağırlık hiyerarşisi.
- **Iconography:** `@expo/vector-icons` paketindeki standart `Ionicons` ikon seti kullanımı.
- **Micro-Animations:** Şık ve dinamik kullanıcı etkileşimleri için yükleme ve başarı animasyonları.

### 2. Responsive Tasarım
- Farklı ekran boyutlarına uyum sağlayan esnek tasarımlar (Telefon ve Tablet uyumlu).
- Safe area desteği (`react-native-safe-area-context` paketinin `SafeAreaView` bileşeni yardımıyla çentik ve durum çubuğu taşma koruması).
- Dikey (Portrait) ve Yatay (Landscape) görünüm uyumluluğu.

### 3. Kullanıcı Deneyimi (UX)
- **Loading States:** Veri yükleme süreçlerinde `ActivityIndicator` ve özel loading spinner bileşenleri ile geri bildirim.
- **Error Handling:** API hatalarında ve doğrulama başarısızlıklarında kullanıcı dostu uyarı dialogları (`Alert.alert`).
- **Empty States:** Listelenecek veri bulunmadığı durumlarda bilgilendirici ve yönlendirici şablon gösterimleri.
- **Feedback:** Stripe test ödeme işlemleri, bilet satışı ve bilet doğrulama süreçlerinde anında geri bildirim.

### 4. Erişilebilirlik (Accessibility)
- Touch target boyutları (Kullanıcı etkileşimini kolaylaştırmak için minimum 44x44dp touch alanı).
- Form alanları için net etiketler ve ekran okuyucu uyumluluğu.

### 5. Performans & Veri Saklama
- **Listeleme Optimizasyonu:** `ScrollView` ve dinamik listelerde pull-to-refresh (`RefreshControl`) desteği.
- **Local Cache (Yerel Önbellek):** Cihazın yerel depolama biriminde (`AsyncStorage`) etkinlik verilerinin ve bilet listelerinin saklanması.
- **Çevrimdışı Mod:** İnternet bağlantısı koptuğunda veya erişilemediğinde yerel önbellek (offline cache) üzerinden bilet doğrulama imkanı.

### 6. Navigasyon
- **Expo Router:** Dosya tabanlı (file-based) modern yönlendirme yapısı.
- **Tab Navigation (Sekmeli Gezinme):** `Home` (Dashboard), `Events` (Keşfet), `Search` (Arama), `My Tickets` (Biletlerim) ve `Profile` (Profil) sekmeleri arasında hızlı geçiş.
- **Deep Linking / External Linking:** Stripe ödeme sayfalarını ve diğer dış bağlantıları güvenli bir şekilde `Linking.openURL` ile tarayıcıda açma.

### 7. Form Yönetimi ve Validasyon
- Çok adımlı form yapıları (örn: Detaylı etkinlik oluşturma formu).
- Klavye etkileşimleri (dismiss mekanizmaları, `keyboardType` yapılandırması).

### 8. Çevrimdışı Doğrulama (Offline QR Mode) & Senkronizasyon
- İnternet erişimi olmadığında QR kod bilet doğrulamasının yerel veritabanından gerçekleştirilmesi.
- Çevrimdışı doğrulanmış bilet kodlarının `AsyncStorage` üzerinde bir kuyrukta (`offline_queue`) biriktirilmesi.
- Yeniden çevrimiçi olunduğunda veya **Sync Now** butonuna basıldığında birikmiş tüm check-in işlemlerinin backend tarafındaki `/tickets/bulk-verify` endpoint'ine toplu halde (batch) gönderilerek veritabanlarının eşitlenmesi.