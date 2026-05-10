# Guyde Badinga'nın Mobil Backend Görevleri

## 1. Üye Olma (Kayıt) Servisi
- **API Endpoint:** `POST /user`
- **Görev:** Mobil uygulamada kullanıcı kayıt işlemini gerçekleştiren servis entegrasyonu
- **İşlevler:**
  - Kullanıcı bilgilerini (name, lastName, email, password, interests) toplama
  - Form validasyonu (email formatı, şifre güvenliği kontrolü)
  - API'ye POST isteği gönderme
  - Başarılı kayıt durumunda kullanıcıyı giriş ekranına yönlendirme
- **Teknik Detaylar:**
  - HTTP Client kullanımı (Retrofit/OkHttp - Android, URLSession/Alamofire - iOS)
  - Loading state yönetimi

## 2. Kullanıcı Girişi (Login) Servisi
- **API Endpoint:** `POST /user/login`
- **Görev:** Mobil uygulamada kullanıcı giriş işlemini gerçekleştirme ve oturumu yönetme
- **İşlevler:**
  - Email ve şifre ile giriş yapma
  - Gelen JWT Token'ı güvenli bir şekilde saklama
- **Teknik Detaylar:**
  - Güvenli depolama (Secure SharedPreferences / iOS Keychain)
  - Tüm yetki gerektiren API isteklerine otomatik Authentication (Bearer) header eklemek için HTTP Interceptor yapılandırması

## 3. Kullanıcı Bilgilerini Güncelleme Servisi
- **API Endpoint:** `PUT /user`
- **Görev:** Kullanıcı profil bilgilerini API'den güncelleyip mobil arayüze yansıtma
- **İşlevler:**
  - Profil bilgilerini düzenleme ekranından alıp API'ye iletme
- **Teknik Detaylar:**
  - Partial update desteği ve Optimistic UI update

## 4. Kullanıcı Hesabını Silme Servisi
- **API Endpoint:** `DELETE /user/{userId}`
- **Görev:** Kullanıcının kendi hesabını mobil uygulamadan kalıcı olarak silmesi
- **İşlevler:**
  - Hesabı kalıcı olarak silme (DELETE) için kullanıcı onayı alma
  - Çıkış (Logout) ve local cache temizliği
- **Teknik Detaylar:**
  - Silme sonrası Login ekranına yönlendirme

## 5. Tüm Etkinlikleri Listeleme Servisi (Redis Optimizasyonu)
- **API Endpoint:** `GET /events`
- **Görev:** Sistemdeki tüm etkinlikleri listeleyerek mobil ana ekranda gösterme
- **İşlevler:**
  - Backend'in sağladığı Redis önbellekleme (caching) mimarisinden faydalanarak listeleri anında yükleme
- **Teknik Detaylar:**
  - Infinity scroll (sonsuz kaydırma) ve hızlı yükleme (skeleton UI)

## 6. Etkinlik Arama Servisi (Redis Optimizasyonu)
- **API Endpoint:** `GET /events/search`
- **Görev:** Arama kutusundan girilen kelimelere göre etkinlikleri arama
- **İşlevler:**
  - Query (q) parametresini API'ye gönderip sonuçları anlık listeleme
- **Teknik Detaylar:**
  - Arama yaparken performansı artırmak için Redis üzerinden gelen verilerin gecikmesiz gösterilmesi

## 7. Kategoriye Göre Filtreleme Servisi (Redis Optimizasyonu)
- **API Endpoint:** `GET /events/category`
- **Görev:** Etkinlikleri belirli kategorilere göre filtreleyip listeleme
- **İşlevler:**
  - Kategori seçimine göre anlık API isteği oluşturma
- **Teknik Detaylar:**
  - Redis cache entegrasyonu sayesinde filtrelenmiş sonuçların beklemesiz (sıfır gecikme) yüklenmesi

## 8. Yakınımdaki Etkinlikleri Listeleme Servisi (Redis Optimizasyonu)
- **API Endpoint:** `GET /events/nearby`
- **Görev:** Kullanıcının mevcut konumuna göre yakınındaki etkinlikleri listeleme
- **İşlevler:**
  - Konum servisleri (GPS) entegrasyonu ile kullanıcının enlem (lat) ve boylam (lng) bilgisini kullanarak API çağırma
- **Teknik Detaylar:**
  - Redis destekli coğrafi sorguların mobil tarafta hızlı render edilmesi
