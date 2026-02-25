# Gereksinim Analizi

Tüm gereksinimlerinizi çıkardıktan sonra beraber tartışıyoruz ve son gereksinimlerin isimlerini hangi API metoduna karşılık geleceğini ve kısa açıklamalarını buraya numaralı bir şekilde yazıyorsunuz. Daha sonra aşağıya herkes kendi gereksinimiyle ilgili sayfayı oluşturmalı ve kendi sayfasında kendine ait gereksinimleri numaralı bir şekilde listeleyerek her bir gereksinimin açıklamalarını yazmalı. Toplamda grup üyesi sayısı kadar sayfa oluşturulmalı. Her grup üyesine eşit sayıda gereksinim atanmalı.

## Gereksinim Sayıları (En Az)

- **1 Kişi:** 10 gereksinim
- **2 Kişi:** 16 gereksinim
- **3 Kişi:** 21 gereksinim
- **4 Kişi:** 24 gereksinim
- **5 Kişi:** 30 gereksinim

## Gereksinimlerde Uyulması Gereken Kurallar

1. **İsimler anlamlı olmalı:** Gereksinim isimleri net ve anlaşılır olmalıdır.
2. **Açıklamalar net olmalı:** Her gereksinimin açıklaması açık ve anlaşılır şekilde yazılmalıdır.
3. **Açıklamalar teknik jargon ve kısaltmalar içermemeli:** Gereksinim açıklamaları herkesin anlayabileceği basit bir dille yazılmalıdır.
4. **Gereksinim isimleri çok uzun olmamalı ve bir eylem bildirmeli:** 
   - İsimler kısa ve öz olmalıdır
   - Bir eylem fiili içermelidir
   - Örnekler: "Kayıt Olma", "Giriş Yapma", "Profil Güncelleme", "Hesap Silme"

# Tüm Gereksinimler 

1. **Kullanıcı Kaydı Oluşturma**(Guyde Freny Badinga)
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur. Bu işlem, kullanıcıların sisteme giriş yapabilmesi için gereklidir ve güvenlik açısından önemlidir. Kayıt sırasında kullanıcıların sağladığı bilgilerin doğruluğu ve güvenliği sağlanmalıdır.

2. **Kullanıcı Girişi Yapma**(Guyde Freny Badinga)
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kullanıcıların sisteme giriş yaparak hizmetlere erişmesini sağlar. Email adresi ve şifre ile kimlik doğrulama yapılır. Başarılı giriş sonrası kullanıcıya erişim izni verilir ve kişisel verilerin güvenliği sağlanır.

3. **Kullanıcı Bilgilerini Güncelleme**(Guyde Freny Badinga)
   - **API Metodu:** `PUT /users/{userId}`
   - **Açıklama:** Kullanıcının profil bilgilerini güncellemesini sağlar. Kullanıcılar ad, soyad, email, telefon gibi kişisel bilgilerini değiştirebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi bilgilerini güncelleyebilir.

4. **Kullanıcı Hesabını Silme**(Guyde Freny Badinga)
   - **API Metodu:** `DELETE /users/{userId}`
   - **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Kullanıcı hesabını kapatmak istediğinde veya yönetici tarafından hesap kapatılması gerektiğinde kullanılır. Bu işlem geri alınamaz ve kullanıcının tüm verileri silinir. Güvenlik için giriş yapmış olmak gerekir.

5. **Tüm Etkinlikleri Listeleme**(Guyde Freny Badinga)
   - **API Metodu:** `GET /events`
   - **Açıklama:** Sistemdeki tüm etkinlikleri listelemesini sağlar. Bu işlem, kullanıcıların etkinlikleri keşfetmesine ve ilgili etkinliklere katılmalarına olanak tanır. Etkinliklerin başlık, tarih, konum gibi bilgileri ile birlikte listelenmesi sağlanır.

6. **Etkinlik Arama**(Guyde Freny Badinga)
   - **API Metodu:** `GET /events/search`
   - **Açıklama:** Kullanıcıların etkinlikleri başlık, konum veya tarih gibi kriterlere göre aramasını sağlar. Arama sonuçları, kullanıcıya ilgili etkinliklerin listelenmesini sağlar.

7. **Kategoriye Göre Etkinlik Filtreleme**(Guyde Freny Badinga)
   - **API Metodu:** `GET /events/category/{categoryId}`
   - **Açıklama:** Kullanıcıların belirli bir kategoriye ait etkinlikleri filtreleyerek listelemesini sağlar. Kullanıcı, ilgili kategoriye ait etkinlikleri keşfetmek için bu işlemi kullanabilir.

8. **İlgi Alanına Göre Etkinlik Önerme **(Guyde Freny Badinga)
   - **API Metodu:** `GET /events/suggested`
   - **Açıklama:** Kullanıcının ilgi alanlarına göre önerilen etkinlikleri listelemesini sağlar. Kullanıcı, ilgili etkinlikleri keşfetmek için bu işlemi kullanabilir.

# Gereksinim Dağılımları

1. [Guyde Badinga'nın Gereksinimleri](Guyde-Badinga/Guyde-Badinga-Gereksinimler.md)
2. [Alain Jospin Dushime'nin Gereksinimleri](Alain-Jospin-Dushime/Alain-Jospin-Dushime-Gereksinimler.md)