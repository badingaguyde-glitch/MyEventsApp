1. **Yeni Etkinlik Oluşturma**
   - **API Metodu:** `POST `
   - **Açıklama:** Kullanıcının yeni bir etkinlik oluşturmasını sağlar. Etkinlik adı, açıklaması, tarihi, saati, yeri ve kapasitesi girilir.

2. **Etkinlik Bilgilerini Güncelleme**
   - **API Metodu:** `PUT`
   - **Açıklama:**Etkinlik sahibinin oluşturduğu etkinliğin bilgilerini güncellemesini sağlar.

3. **Etkinlik İptal Etme**
   - **API Metodu:** `DELETE`
   - **Açıklama:**Etkinlik sahibinin oluşturduğu etkinliği iptal edip sistemden kaldırmasını sağlar.

4. **Etkinliğe Katılım Bildirimi**
   - **API Metodu:** `POST`
   - **Açıklama:** Kullanıcının bir etkinliğe katılmak için bilet satın almasını ve katılım bildirimi yapmasını sağlar.

5. **Kullanıcının Biletlerini Listeleme**
   - **API Metodu:** `GET`
   - **Açıklama:** Kullanıcının satın aldığı tüm biletleri ve katılacağı etkinlikleri listeler.

6. **Katılım Kodunu Doğrulama**
   - **API Metodu:** `POST`
   - **Açıklama:** Etkinlik yöneticisinin, kullanıcının gösterdiği kodu girerek katılımı onaylamasını sağlar.

7. **Etkinlik Katılımcılarını Listeleme**
   - **API Metodu:** `GET`
   - **Açıklama:** Etkinlik sahibinin, etkinliğine katılacak tüm kullanıcıları listelemesini sağlar.

8. **Bilet İptal Etme**
   - **API Metodu:** `DELETE`
   - **Açıklama:** Kullanıcının satın aldığı bileti iptal ederek etkinlikten vazgeçmesini sağlar.