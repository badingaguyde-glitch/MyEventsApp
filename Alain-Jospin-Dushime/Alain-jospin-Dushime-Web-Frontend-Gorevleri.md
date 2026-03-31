# MyEvents Web Frontend Components Documentation

## 1. Authentication & User Management
- *Components:* Register.jsx, Login.jsx, Profile.jsx
- *Görev:* Kullanıcı kayıt, giriş, profil görüntüleme ve düzenleme işlemlerini sağlayan arayüzlerin implementasyonu.
- *UI Bileşenleri:*
  - *Register:* Ad, soyad, email, şifre ve ilgi alanları (interests) içeren kayıt formu. Framer Motion ile animasyonlu giriş.
  - *Login:* Email ve şifre ile giriş formu. Redux store güncellemeleri (login, checkOrganizerStatus).
  - *Profile:* Kullanıcı bilgilerini (Ad, Soyad, Email, İlgi Alanları) gösteren ve güncelleyen form. Hesabı silme (Delete Account) butonu ve onay tabanlı (modal) silme akışı. Silme işleminden sonra Redux store'dan logout tetiklenmesi.
- *Teknik Detaylar:*
  - Form validasyonları ve error stateleri.
  - Redux entegrasyonu (useSelector, useDispatch).
  - API servisleri (UserDataService.register, login, updateProfile, deleteUser).

## 2. Platform Layout & Infrastructure
- *Components:* Template.jsx, Navbar.jsx, Footer.jsx, Loader.jsx, PageError.jsx, ErrorBoundary.jsx, ProtectedRoute.jsx
- *Görev:* Uygulamanın genel iskeletini, navigasyonunu, hata yönetimini ve ortak bileşenlerini sağlamak.
- *UI Bileşenleri:*
  - *Navbar:* Statik değil, kullanıcı durumuna göre dinamik linkler (Home, Events, Search, My Tickets, Organizer, Admin, Verify). Responsive tasarım, mobile menü (hamburger) ve Framer Motion ile slide animasyonları.
  - *Footer:* Sade ve bilgilendirici alt bilgi alanı, sosyal medya linkleri.
  - *Template:* Outlet kullanarak sayfa içeriklerini saran ana layout wrapper.
  - *Loader:* Framer motion tabanlı, şık ve animasyonlu yükleme göstergesi.
  - *PageError:* 404 gibi sayfa bulunamadı hatalarını gösteren, geri dönüş butonları barındıran component.
  - *ErrorBoundary:* React komponent ağacındaki çökmeleri yakalayan ve kullanıcı dostu bir hata ekranı çıkaran sınıf tabanlı component.
  - *ProtectedRoute:* Sadece giriş yapmış kullanıcıların, belli rollere (admin, organizer) veya sahipliğe (ownership) sahip kişilerin erişebileceği rotaları koruyan logic componenti. Redux'tan gelen isLoggedIn ve user state'ini kontrol eder.

## 3. Event Discovery & Viewing
- *Components:* Home.jsx, EventList.jsx, EventCard.jsx, EventSearch.jsx, EventDetails.jsx
- *Görev:* Kullanıcıların etkinlikleri keşfetmesini, aramasını ve incelemesini sağlayan arayüzler.
- *UI Bileşenleri:*
  - *Home:* Hero banner, "Explore Events" ve "Host an Event" CTA'ları. Yaklaşan (Upcoming) veya yakındaki (Nearby) etkinliklerin kısa bir listesini gösterir.
  - *EventList:* Tüm etkinlikleri grid yapısında listeler. navigator.geolocation kullanarak "Near Me" butonu ile yakındaki etkinlikleri filtreleme özelliği.
  - *EventCard:* Etkinlik resmi, kategori, fiyat, tarih/saat, mekan ve "Details" butonu içeren reusable kart tasarımı. Hover efektleri (Framer Motion).
  - *EventSearch:* Arama çubuğu (Search butonu) ile kelime bazlı etkinlik arama. Bulunan sonuçları EventCard'lar ile listeler.
  - *EventDetails:* Seçili etkinliğin detay sayfası. Büyük kapak resmi, detaylı açıklamalar, tarih/mekan/kapasite bilgileri, kalan kontenjan (availableSpots) durumları. Giriş yapmış kullanıcılar için "Purchase Ticket" butonu (TicketService.buyTicket).

## 4. Event Creation & Organizer Management
- *Components:* CreateEvents.jsx, EditEvent.jsx, MyEvents.jsx, Organizerdashboard.jsx, EventParticipants.jsx
- *Görev:* Etkinlik organizatörleri için etkinlik oluşturma, düzenleme, katılımcıları görme ve istatistikleri takip etme arayüzleri.
- *UI Bileşenleri:*
  - *CreateEvents:* Çok alanlı form. Başlık, açıklama, kategori, lokasyon (şehir, adres, mekan, lat/long koordinatları), tarih, saat, kapasite, bilet fiyatı ve resim (file upload via FormData) içerir.
  - *EditEvent:* Mevcut etkinliğin verilerini doldurur ve sadece belirli alanların (başlık, açıklama, kategori, durum (active/cancelled), tarih vb.) güncellenmesine izin verir.
  - *MyEvents:* Organizatörün kendi oluşturduğu etkinliklerin listesi. Etkinlik başına katılımcıları görme, düzenleme ve iptal etme (silme) hızlı aksiyon butonları içerir.
  - *Organizerdashboard:* İstatistiksel özetler sunar (Total Events, Active Events, Tickets Sold, Total Revenue). "Verify Tickets" ve "Portfolio Management" hızlı bağlantılarını barındırır.
  - *EventParticipants:* Etkinliğe kayıtlı katılımcıların detaylı tablosu (profil ismi, iletişim bilgisi, telefon, kayıt tarihi). Katılımcı listesini CSV olarak dışa aktarabilme özelliği (Export Manifest).

## 5. Ticket Management & Verification
- *Components:* MyTickets.jsx, TicketCard.jsx, VerifyTicket.jsx
- *Görev:* Kullanıcıların satın aldıkları biletleri yönetmesi ve yetkililerin biletleri kapıda doğrulaması.
- *UI Bileşenleri:*
  - *MyTickets:* Kullanıcının geçmiş veya gelecek biletlerini listeler (TicketService.getUserTickets). Bilet iptali (cancelTicket) işlemlerini yönetir. Redux bazlı loading state takibi.
  - *TicketCard:* Bilet detaylarını ve iptal butonunu (Trash icon) gösteren, kesikli (ticket cutout) UI stili barındıran tasarım. Fatura/Makbuz numarası (Ticket ID) ve ödenen ücret bilgisi.
  - *VerifyTicket:* Organizatör/Adminler için bilet doğrulama modülü. Bilet referans kodunu (ticketCode) text input olarak alıp backend üzerinden doğrular (TicketService.verifyTicket). Başarılıysa bilet sahibinin adı soyadı ve etkinlik adı görüntülenir.

## 6. Admin Control
- *Components:* AdminDashboard.jsx
- *Görev:* Platform yöneticileri (admin) için genel platform istatistikleri arayüzü.
- *UI Bileşenleri:*
  - Tüm platformdaki etkinlik sayısını (Platform Events), Active Users, Growth Vector gibi metrik kartlarını gösterir.
  - Arama çubukları ve "System Logs" statik görünümleri. EventService.getAllEvents ile platform verilerini çeker.