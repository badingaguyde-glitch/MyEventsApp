## 1. Yeni Etkinlik Oluşturma
- *Endpoint:* POST /events
- *Açıklama:* Kullanıcının yeni bir etkinlik oluşturmasını sağlar. Etkinlik adı, açıklaması, tarihi, saati, yeri ve kapasitesi girilir.
- *Request Body (FormData):* 
  text
  title: "Yazılım Konferansı 2026"
  description: "Geleceğin teknolojileri üzerine konuşmalar."
  category: "Conference"
  date: "2026-05-20"
  time: "10:00"
  location[city]: "İstanbul"
  location[address]: "Şişli"
  location[venue]: "Kongre Merkezi"
  capacity: 500
  price: 150
  coordinates[0]: 28.9784
  coordinates[1]: 41.0082
  image: (File)
  
- *Authentication:* Bearer Token gerekli
- *Response:* 201 Created - Etkinlik başarıyla oluşturuldu

## 2. Etkinlik Bilgilerini Güncelleme
- *Endpoint:* PUT /events/{eventid}
- *Açıklama:* Etkinlik sahibinin oluşturduğu etkinliğin bilgilerini güncellemesini sağlar. Etkinlik fotoğrafı dahil tüm alanlar güncellenebilir.
- *Path Parameters:* 
  - eventid (string, required) - Güncellenecek etkinliğin ID'si
- *Request Body (FormData/JSON):* Form verisi üzerinden title, description, category, date, time vb. alanlar gönderilir.
- *Authentication:* Bearer Token gerekli (Sadece etkinliğin sahibi veya admin güncelleyebilir)
- *Response:* 200 OK - Etkinlik başarıyla güncellendi

## 3. Etkinlik İptal Etme
- *Endpoint:* DELETE /events/{eventid}
- *Açıklama:* Etkinlik sahibinin oluşturduğu etkinliği iptal edip sistemden kaldırmasını sağlar. Bağlı olan aktif biletler de iptal (cancelled) durumuna çekilir.
- *Path Parameters:* 
  - eventid (string, required) - İptal edilecek etkinliğin ID'si
- *Authentication:* Bearer Token gerekli (Sadece etkinliğin sahibi veya admin silebilir)
- *Response:* 200 OK - "Event cancelled successfully" / "Event and associated tickets deleted successfully"

## 4. Etkinliğe Katılım Bildirimi (Bilet Satın Alma)
- *Endpoint:* POST /tickets
- *Açıklama:* Kullanıcının bir etkinliğe katılmak için bilet satın almasını ve katılım bildirimi yapmasını sağlar. Kapasite kontrolü yapılır.
- *Request Body (JSON):* 
  json
  {
    "eventId": "65ab8c9df01...",
    "price": 150
  }
  
- *Authentication:* Bearer Token gerekli
- *Response:* 201 Created - "Ticket purchased successfully" ve oluşturulan Ticket nesnesi döner

## 5. Kullanıcının Biletlerini Listeleme
- *Endpoint:* GET /tickets
- *Açıklama:* Kullanıcının satın aldığı tüm biletleri ve katılacağı etkinlikleri listeler. İptal edilmiş biletler hariç tutulur, etkinliklerin 'upcoming', 'past' veya 'attended' durumları hesaplanır.
- *Authentication:* Bearer Token gerekli
- *Response:* 200 OK - Bilet objeleri dizisi (array)

## 6. Katılım Kodunu Doğrulama
- *Endpoint:* POST /tickets/verify
- *Açıklama:* Etkinlik yöneticisinin, kullanıcının gösterdiği bilet kodunu (Reference Code) girerek katılımı onaylamasını sağlar. Bilet geçerliyse check-in işlemi yapılır (statüsü 'used' olur).
- *Request Body (JSON):* 
  json
  {
    "eventId": "65ab8c9df01...",
    "ticketCode": "TKT-1234-ABCD"
  }
  
- *Authentication:* Bearer Token gerekli (Etkinlik sahibi yetkilidir)
- *Response:* 200 OK - "Ticket verified and checked in successfully" (Geçerlilik ve doğrulama sonucu)

## 7. Etkinlik Katılımcılarını Listeleme
- *Endpoint:* GET /events/{eventid}/participants
- *Açıklama:* Etkinlik sahibinin, etkinliğine katılacak tüm kullanıcıları listelemesini sağlar. Satın alınan aktif biletler üzerinden listeleme yapılır.
- *Path Parameters:* 
  - eventid (string, required) - Etkinlik ID'si
- *Authentication:* Bearer Token gerekli (Sadece etkinliğin sahibi yetkilidir)
- *Response:* 200 OK - Event detayları ve katılımcı objeleri dizisi (participants)

## 8. Bilet İptal Etme
- *Endpoint:* DELETE /tickets/{ticketid}
- *Açıklama:* Kullanıcının satın aldığı bileti iptal ederek etkinlikten vazgeçmesini sağlar. Etkinlik tarihi geçmiş biletler veya kullanılmış ('used') biletler iptal edilemez.
- *Path Parameters:* 
  - ticketid (string, required) - İptal edilecek biletin ID'si
- *Authentication:* Bearer Token gerekli (Bilet sahibi veya admin yetkilidir)
- *Response:* 200 OK - "Ticket cancelled successfully"