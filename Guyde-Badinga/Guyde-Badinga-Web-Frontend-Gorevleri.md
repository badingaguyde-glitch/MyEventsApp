# Guyde-Badinga'nın Web Frontend Görevleri

## 1. Üye Olma (Kayıt) Sayfası
- **API Endpoint:** `POST /user`
- **Service:** `UserDataService.register(data)` — `src/services/UserDataServices.jsx`
- **Redux Action:** `register(data)` — `src/redux/reducer.jsx`
- **Sayfa Rotası:** `/register` → `<Register />` bileşeni
- **Görev:** Kullanıcı kayıt işlemi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Responsive kayıt formu (desktop ve mobile uyumlu)
  - `name` input alanı (kullanıcının adı)
  - `lastName` input alanı (kullanıcının soyadı)
  - `email` input alanı (type="email")
  - `password` input alanı (type="password")
  - `interests` seçim alanı (çoklu seçim, örn. Müzik, Spor...)
  - "Kayıt Ol" butonu (primary button style)
  - "Zaten hesabınız var mı? Giriş Yap" linki (`/login` rotasına)
  - Loading spinner (kayıt işlemi sırasında)
- **Form Validasyonu:**
  - Tüm alanlar zorunlu (`name`, `lastName`, `email`, `password`, `interests`)
  - Email format kontrolü
  - Şifre güvenlik kuralları
  - Client-side validation
- **Kullanıcı Deneyimi:**
  - Başarılı kayıt sonrası `/login` sayfasına yönlendirme
  - Hata durumunda kullanıcı dostu mesaj (`SIGNUP_FAILURE` → `isError: true`)
  - Form submission prevention (double-click koruması)
- **Teknik Detaylar:**
  - Framework: React
  - State management: Redux (`isSignedUp`, `isError` state'leri)
  - Routing: React Router DOM (`/register` rotası)

## 2. Kullanıcı Girişi Yapma Sayfası
- **API Endpoint:** `POST /user/login`
- **Service:** `UserDataService.login({ email, password })` — `src/services/UserDataServices.jsx`
- **Redux Action:** `login({ email, password })` — `src/redux/reducer.jsx`
- **Sayfa Rotası:** `/login` → `<Login />` bileşeni
- **Görev:** Kullanıcı giriş işlemi için web sayfası tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Responsive giriş formu
  - `email` input alanı (type="email")
  - `password` input alanı (type="password")
  - "Giriş Yap" butonu (primary button style)
  - "Hesabınız yok mu? Kayıt Ol" linki (`/register` rotasına)
  - Loading spinner (`isLoading: true` durumunda)
- **Kullanıcı Deneyimi:**
  - Başarılı giriş sonrası JWT token ve kullanıcı bilgileri `localStorage`'a kaydedilir
  - Başarısız giriş durumunda hata mesajı (`LOGIN_FAILURE` → `isError: true`)
  - Redirect: giriş sonrası `Home` sayfasına yönlendirme
- **Teknik Detaylar:**
  - Framework: React
  - State management: Redux (`isLoggedIn`, `user`, `isLoading`, `isError`)
  - Kullanıcı bilgileri `localStorage.setItem("user", ...)` ile saklanır
  - Routing: React Router DOM (`/login` rotası)

## 3. Kullanıcı Profil Sayfası (Görüntüleme & Güncelleme)
- **API Endpoint:** `PUT /user`
- **Service:** `UserDataService.updateProfile(data, token)` — `src/services/UserDataServices.jsx`
- **Redux Action:** `ADD_UPDATE_KAYIT_SUCCESS` / `ADD_UPDATE_KAYIT_FAILURE`
- **Sayfa Rotası:** `/profile` → `<Profile />` bileşeni (ProtectedRoute)
- **Görev:** Kullanıcı profil bilgilerini görüntüleme ve düzenleme sayfası implementasyonu
- **UI Bileşenleri:**
  - Kullanıcı adı ve soyadı görüntüleme
  - Email adresi görüntüleme
  - `firstName`, `lastName`, `email`, `interests`, `password` güncelleme alanları
  - "Kaydet" butonu (primary button)
  - "Hesabı Sil" butonu (danger button)
- **Form Validasyonu:**
  - Email format kontrolü (real-time)
  - Değişiklik yoksa "Kaydet" butonu disabled
- **Kullanıcı Deneyimi:**
  - Başarılı güncelleme sonrası success bildirimi (`isKayitUpdated: true`)
  - Hata durumunda error mesajı (`isError: true`)
  - Sayfa korumalı: giriş yapmamış kullanıcılar `ProtectedRoute` ile engellenir
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token (`Authorization: Bearer ${token}`)
  - State management: Redux

## 4. Hesap Silme Akışı
- **API Endpoint:** `DELETE /user/:userid`
- **Service:** `UserDataService.deleteUser(id, token)` — `src/services/UserDataServices.jsx`
- **Redux Action:** `DELETE_KAYIT_SUCCESS` / `DELETE_KAYIT_FAILURE` + `logout()`
- **Sayfa Rotası:** `/profile` → `<Profile />` bileşeni içinde
- **Görev:** Kullanıcı hesabını silme işlemi için web UI akışı implementasyonu
- **UI Bileşenleri:**
  - "Hesabı Sil" butonu (danger button style, profil sayfasında)
  - Onay dialog/modal (destructive action için çift onay)
  - Warning icons ve kırmızı renk göstergeleri
- **Kullanıcı Deneyimi:**
  - Silme işlemi sonrası `logout()` çağrılır → `localStorage`'dan `user` silinir
  - Başarılı silme sonrası `/login` sayfasına yönlendirme
  - `isDeleted: true` state'i ile işlem durumu takip edilir
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token
  - Logout: `localStorage.removeItem("user")` + `LOGOUT` action dispatch

## 5. Etkinlik Listeleme Sayfası
- **API Endpoint:** `GET /events`
- **Service:** `EventService.getAllEvents()` — `src/services/EventServices.jsx`
- **Redux Action:** `retrieveEvents()` — `src/redux/reducer.jsx`
- **Sayfa Rotası:** `/events` → `<EventList />` bileşeni
- **Görev:** Tüm aktif etkinlikleri listeleyen sayfa implementasyonu
- **UI Bileşenleri:**
  - Etkinlik kartları grid/liste görünümü
  - Her kart: başlık, tarih, konum, fiyat, mevcut kapasite bilgisi
  - "Detayları Gör" butonu (her kart için `/events/:id` rotasına yönlendirme)
  - Loading skeleton (`isLoading: true` durumunda)
  - Hata durumunda retry mesajı (`isError: true`)
- **Teknik Detaylar:**
  - Framework: React
  - State management: Redux (`data`, `isLoading`, `isError`)
  - Routing: `/events/:id` → `<EventDetails />` rotasına geçiş

## 6. Etkinlik Arama Sayfası
- **API Endpoint:** `GET /events/search?q=...`
- **Service:** `EventService.searchEvents(query)` — `src/services/EventServices.jsx`
- **Sayfa Rotası:** `/search` → `<EventSearch />` bileşeni
- **Görev:** Kullanıcıların etkinlikleri başlık, konum veya kategoriye göre arayabildiği sayfa
- **UI Bileşenleri:**
  - Arama input alanı (gerçek zamanlı veya submit ile)
  - Sonuç listesi (etkinlik kartları)
  - Sonuç bulunamadı durumu için empty state
- **Teknik Detaylar:**
  - Framework: React
  - API çağrısı: `EventService.searchEvents(q)` ile `/events/search?q=...`
  - Routing: React Router DOM (`/search` rotası)

## 7. Yakındaki Etkinlikler
- **API Endpoint:** `GET /events/nearby?lat=...&lng=...&radius=...`
- **Service:** `EventService.getNearbyEvents(lat, lng, radius)` — `src/services/EventServices.jsx`
- **Redux Action:** `retrieveNearbyEvents(lat, lng, radius)` — `src/redux/reducer.jsx`
- **Görev:** Kullanıcının coğrafi konumuna göre yakın etkinlikleri listeleyen özellik
- **UI Bileşenleri:**
  - "Konumumu Kullan" butonu (Geolocation API)
  - Sonuç: mesafeye göre sıralı etkinlik kartları
  - Konum izni reddedilirse bilgi mesajı
- **Teknik Detaylar:**
  - Framework: React
  - Geolocation: `navigator.geolocation.getCurrentPosition()`
  - State management: Redux (`FETCH_SUCCESS` → `data: res.data.events`)
  - Varsayılan yarıçap: `radius = 50` (reducer'da)

## 8. Etkinlik Detay Sayfası
- **API Endpoint:** `GET /events/:id`
- **Service:** `EventService.getEventById(id)` — `src/services/EventServices.jsx`
- **Sayfa Rotası:** `/events/:id` → `<EventDetails />` bileşeni
- **Görev:** Seçilen etkinliğin tüm detaylarının gösterildiği sayfa
- **UI Bileşenleri:**
  - Etkinlik başlığı, açıklaması, tarihi, saati, konumu
  - Kapasite ve mevcut yer bilgisi (`availableSpots`, `isSoldOut`)
  - Organizatör bilgisi
  - Etkinlik görseli
  - "Bilet Al" butonu (`TicketService.buyTicket`)
  - "Katılımcıları Gör" butonu (organizatör için)
- **Teknik Detaylar:**
  - Framework: React
  - Routing: React Router DOM (`useParams` ile `:id` alınır)

## 9. Etkinlik Oluşturma & Düzenleme Sayfası
- **API Endpoints:** `POST /events` / `PUT /events/:id`
- **Services:** `EventService.createEvent(data, token)` / `EventService.updateEvent(id, data, token)` — `src/services/EventServices.jsx`
- **Sayfa Rotaları:**
  - `/create-event` → `<CreateEvent />` bileşeni
  - `/edit-event/:id` → `<EditEvent />` bileşeni
- **Görev:** Etkinlik oluşturma ve düzenleme formlarının implementasyonu
- **UI Bileşenleri:**
  - `title`, `description`, `category`, `date`, `time`, `location`, `capacity`, `price` input alanları
  - `image` dosya yükleme alanı (Cloudinary'ye yükleme)
  - `coordinates` (enlem/boylam) input alanları
  - "Oluştur" / "Güncelle" butonu
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token
  - Image upload: `multipart/form-data`

## 10. Organizatör Dashboard & Katılımcı Yönetimi
- **API Endpoints:** `GET /events/mine` / `GET /events/:id/participants`
- **Services:** `EventService.getMyEvents(token)` / `EventService.getEventParticipants(id, token)`
- **Redux Action:** `checkOrganizerStatus(token)` — `src/redux/reducer.jsx`
- **Sayfa Rotaları:**
  - `/my-events` → `<MyEvents />` bileşeni
  - `/organizer-dashboard` → `<OrganizerDashboard />` (ProtectedRoute: `requireOwnership`)
  - `/events/:id/participants` → `<EventParticipants />` bileşeni
- **Görev:** Organizatörlerin kendi etkinliklerini ve katılımcılarını yönettiği panel
- **UI Bileşenleri:**
  - Etkinlik kartları (`soldTickets`, `checkedIn`, `availableSpots` istatistikleriyle)
  - Her etkinlik için "Düzenle" ve "Sil" butonları
  - Katılımcı listesi (bilet kodu, kullanıcı adı, check-in durumu)
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token
  - State management: Redux (`myEvents` dizisi, `FETCH_MY_EVENTS_SUCCESS`)

## 11. Bilet Yönetimi
- **API Endpoints:** `POST /tickets` / `GET /tickets` / `DELETE /tickets/:id`
- **Services:** `TicketService.buyTicket(data, token)` / `TicketService.getUserTickets(token)` / `TicketService.cancelTicket(id, token)`
- **Sayfa Rotası:** `/my-tickets` → `<MyTickets />` bileşeni
- **Görev:** Kullanıcının biletlerini görüntülediği ve yönettiği sayfa
- **UI Bileşenleri:**
  - Bilet kartları (bilet kodu, etkinlik adı, tarih, durum)
  - "Bilet İptal Et" butonu (geçmemiş etkinlikler için)
  - Bilet durumu: `active`, `used`, `cancelled`
  - `eventStatus` göstergesi: `upcoming`, `past`, `attended`
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token

## 12. Bilet Doğrulama Sayfası
- **API Endpoints:** `POST /tickets/verify` / `POST /tickets/bulk-verify`
- **Services:** `TicketService.verifyTicket(data, token)` / `TicketService.bulkVerifyTickets(data, token)`
- **Sayfa Rotası:** `/verify-ticket` → `<VerifyTicket />` (ProtectedRoute)
- **Görev:** Organizatörlerin etkinlik girişinde bilet doğrulama işlemini yapabildiği sayfa
- **UI Bileşenleri:**
  - Bilet kodu giriş alanı (`ticketCode`)
  - Etkinlik ID seçimi (`eventId`)
  - "Doğrula" butonu
  - Sonuç göstergesi (`valid: true/false`, kullanıcı bilgileri, check-in saati)
  - Toplu doğrulama (bulk-verify) formu
- **Teknik Detaylar:**
  - Framework: React
  - Authentication: Bearer Token

## 13. Teknik Altyapı

### Redux Store (`src/redux/store.js`)
- `createStore` + `applyMiddleware(thunk)` ile oluşturulmuş global state
- `redux-thunk` middleware ile asenkron action'lar desteklenir
- `kayitReducer` tek reducer olarak kullanılır

### Redux State Alanları (`src/redux/reducer.jsx`)
| State Alanı | Açıklama |
|---|---|
| `isLoggedIn` | Kullanıcı oturum durumu |
| `user` | Giriş yapmış kullanıcı bilgileri |
| `data` | Etkinlik listesi |
| `isLoading` | Yükleme durumu |
| `isError` | Hata durumu |
| `isSuccess` | Başarılı işlem durumu |
| `isSignedUp` | Kayıt başarısı |
| `isKayitUpdated` | Profil güncelleme başarısı |
| `isDeleted` | Hesap silme başarısı |
| `myEvents` | Organizatörün kendi etkinlikleri |

### HTTP İstemcisi (`src/services/http-common.jsx`)
- `axios` ile oluşturulmuş temel HTTP istemcisi
- **Base URL:** `https://my-events-app-backend.vercel.app/api`
- **Content-Type:** `application/json`
- Tüm servis dosyaları bu istemciyi kullanır

### Vercel Deployment (`vercel.json`)
- Tüm rotalar `index.html`'e yönlendirilir (SPA desteği için rewrite kuralı)
- React Router DOM'un client-side routing'i doğru çalışması için gereklidir
- Kural: `"source": "/(.*)"` → `"destination": "/index.html"`

### Uygulama Rotaları (`src/main.jsx`)
| Rota | Bileşen | Koruma |
|---|---|---|
| `/` | `<Home />` | Herkese açık |
| `/search` | `<EventSearch />` | Herkese açık |
| `/login` | `<Login />` | Herkese açık |
| `/register` | `<Register />` | Herkese açık |
| `/events` | `<EventList />` | Herkese açık |
| `/events/:id` | `<EventDetails />` | Herkese açık |
| `/create-event` | `<CreateEvent />` | ProtectedRoute |
| `/edit-event/:id` | `<EditEvent />` | ProtectedRoute (ownership) |
| `/my-events` | `<MyEvents />` | Herkese açık |
| `/events/:id/participants` | `<EventParticipants />` | ProtectedRoute (ownership) |
| `/my-tickets` | `<MyTickets />` | Herkese açık |
| `/profile` | `<Profile />` | ProtectedRoute |
| `/admin-dashboard` | `<AdminDashboard />` | ProtectedRoute (admin) |
| `/organizer-dashboard` | `<OrganizerDashboard />` | ProtectedRoute (ownership) |
| `/verify-ticket` | `<VerifyTicket />` | ProtectedRoute |
| `*` | `<PageError />` | Herkese açık |
