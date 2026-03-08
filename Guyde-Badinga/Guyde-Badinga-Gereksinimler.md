1. **Kullanıcı Kaydı Oluşturma**
   - **API Metodu:** `POST /users`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur. Bu işlem, kullanıcıların sisteme giriş yapabilmesi için gereklidir ve güvenlik açısından önemlidir. Kayıt sırasında kullanıcıların sağladığı bilgilerin doğruluğu ve güvenliği sağlanmalıdır.

2. **Kullanıcı Girişi Yapma**
   - **API Metodu:** `POST /users/login`
   - **Açıklama:** Kullanıcıların sisteme giriş yaparak hizmetlere erişmesini sağlar. Email adresi ve şifre ile kimlik doğrulama yapılır. Başarılı giriş sonrası kullanıcıya erişim izni verilir ve kişisel verilerin güvenliği sağlanır.

3. **Kullanıcı Bilgilerini Güncelleme**
   - **API Metodu:** `PUT /users/{userId}`
   - **Açıklama:** Kullanıcının profil bilgilerini güncellemesini sağlar. Kullanıcılar ad, soyad, email, telefon gibi kişisel bilgilerini değiştirebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi bilgilerini güncelleyebilir.

4. **Kullanıcı Hesabını Silme**
   - **API Metodu:** `DELETE /users/{userid}`
   - **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Kullanıcı hesabını kapatmak istediğinde veya yönetici tarafından hesap kapatılması gerektiğinde kullanılır. Bu işlem geri alınamaz ve kullanıcının tüm verileri silinir. Güvenlik için giriş yapmış olmak gerekir.

5. **Tüm Etkinlikleri Listeleme**
   - **API Metodu:** `GET /events`
   - **Açıklama:** Sistemdeki tüm etkinlikleri listelemesini sağlar. Bu işlem, kullanıcıların etkinlikleri keşfetmesine ve ilgili etkinliklere katılmalarına olanak tanır. Etkinliklerin başlık, tarih, konum gibi bilgileri ile birlikte listelenmesi sağlanır.

6. **Etkinlik Arama**
   - **API Metodu:** `GET /events/search`
   - **Açıklama:** Kullanıcıların etkinlikleri başlık, konum veya tarih gibi kriterlere göre aramasını sağlar. Arama sonuçları, kullanıcıya ilgili etkinliklerin listelenmesini sağlar.

7. **Kategoriye Göre Etkinlik Filtreleme**
   - **API Metodu:** `GET /events/category/{category}`
   - **Açıklama:** Kullanıcıların belirli bir kategoriye ait etkinlikleri filtreleyerek listelemesini sağlar. Kullanıcı, ilgili kategoriye ait etkinlikleri keşfetmek için bu işlemi kullanabilir.

8. **Yakınımdaki Etkinlikleri Listele **
   - **API Metodu:** `GET /events/inmyarea`
   - **Açıklama:** Kullanıcının konumuna göre yakınındaki etkinlikleri listelemesini sağlar. Kullanıcı, konum bilgisi sağladıktan sonra, yakın çevresindeki etkinlikler listelenir ve kullanıcı bu etkinliklere katılabilir.
