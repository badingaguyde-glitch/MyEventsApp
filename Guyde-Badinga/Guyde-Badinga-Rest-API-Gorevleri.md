# Guyde-Badinga'nın REST API Metotları

## 1. Kullanıcı Kaydı Oluşturma
- **Endpoint:** `POST /user`
- **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur. Kayıt sırasında bilgilerin doğruluğu ve güvenliği sağlanmalıdır.
- **Request Body:**
  ```json
  {
    "name": "Guyde",
    "lastName": "Badinga",
    "email": "kullanici@example.com",
    "password": "Guvenli123!",
    "interests": ["Müzik", "Spor"]
  }
  ```
- **Response:** `201 Created` - Kullanıcı başarıyla oluşturuldu

## 2. Kullanıcı Girişi Yapma
- **Endpoint:** `POST /user/login`
- **Açıklama:** Kullanıcıların sisteme giriş yaparak hizmetlere erişmesini sağlar. Email adresi ve şifre ile kimlik doğrulama yapılır. Başarılı giriş sonrası kullanıcıya JWT erişim tokeni verilir ve kişisel verilerin güvenliği sağlanır.
- **Request Body:**
  ```json
  {
    "email": "kullanici@example.com",
    "password": "Guvenli123!"
  }
  ```
- **Response:** `200 OK` - Kullanıcı başarıyla giriş yaptı (JWT token içerir)

## 3. Kullanıcı Bilgilerini Güncelleme
- **Endpoint:** `PUT /user`
- **Açıklama:** Kullanıcının profil bilgilerini güncellemesini sağlar. Kullanıcılar ad, soyad, email, ilgi alanları gibi kişisel bilgilerini değiştirebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi bilgilerini güncelleyebilir.
- **Request Body:**
  ```json
  {
    "firstName": "Guyde",
    "lastName": "Badinga",
    "email": "yeni@example.com",
    "interests": ["Sinema", "Teknoloji"],
    "password": "YeniSifre123!"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı bilgileri başarıyla güncellendi

## 4. Kullanıcı Hesabını Silme
- **Endpoint:** `DELETE /user/:userid`
- **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Hesap silindiğinde kullanıcıya ait tüm biletler de otomatik olarak silinir. Bu işlem geri alınamaz. Güvenlik için giriş yapmış olmak gerekir.
- **Path Parameters:**
  - `userid` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı ve ilişkili biletler başarıyla silindi

## 5. Tüm Etkinlikleri Listeleme
- **Endpoint:** `GET /events`
- **Açıklama:** Sistemdeki tüm aktif etkinlikleri listelemesini sağlar. Kullanıcıların etkinlikleri keşfetmesine ve ilgili etkinliklere katılmalarına olanak tanır. Kategori, şehir, tarih ve fiyat aralığına göre filtreleme yapılabilir.
- **Query Parameters:**
  - `category` (string, optional) - Etkinlik kategorisi
  - `city` (string, optional) - Şehir adı
  - `search` (string, optional) - Başlık veya açıklamada arama
  - `date` (string, optional) - Tarih (YYYY-MM-DD)
  - `priceMin` (number, optional) - Minimum fiyat
  - `priceMax` (number, optional) - Maksimum fiyat
- **Response:** `200 OK` - Etkinlik listesi başarıyla getirildi

## 6. Etkinlik Arama
- **Endpoint:** `GET /events/search`
- **Açıklama:** Kullanıcıların etkinlikleri başlık, açıklama, konum veya kategoriye göre aramasını sağlar. Arama sonuçları, kullanıcıya ilgili aktif etkinliklerin listelenmesini sağlar.
- **Query Parameters:**
  - `q` (string, required) - Arama terimi
- **Response:** `200 OK` - Arama sonuçları başarıyla getirildi

## 7. Kategoriye Göre Etkinlik Filtreleme
- **Endpoint:** `GET /events/category`
- **Açıklama:** Kullanıcıların belirli bir kategoriye ait aktif etkinlikleri filtreleyerek listelemesini sağlar. Kullanıcı, ilgili kategoriye ait etkinlikleri keşfetmek için bu işlemi kullanabilir.
- **Query Parameters:**
  - `category` (string, required) - Filtrelenecek kategori adı
- **Response:** `200 OK` - Kategoriye göre filtrelenmiş etkinlikler getirildi

## 8. Yakınımdaki Etkinlikleri Listele
- **Endpoint:** `GET /events/nearby`
- **Açıklama:** Kullanıcının konumuna göre yakınındaki aktif etkinlikleri listelemesini sağlar. Koordinatlar ve yarıçap sağlandıktan sonra yakın çevresindeki etkinlikler mesafeye göre sıralı şekilde listelenir.
- **Query Parameters:**
  - `lat` (number, required) - Enlem
  - `lng` (number, required) - Boylam
  - `radius` (number, optional) - Arama yarıçapı (varsayılan: 10)
  - `unit` (string, optional) - Birim: `km` veya `miles` (varsayılan: `km`)
- **Response:** `200 OK` - Yakındaki etkinlikler başarıyla getirildi
