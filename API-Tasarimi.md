# API Tasarımı - OpenAPI Specification Örneği

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## OpenAPI Nedir?

**OpenAPI** (eski adıyla Swagger), RESTful API'lerin tasarımı, dokümantasyonu ve kullanımı için kullanılan açık bir spesifikasyondur. OpenAPI, API'lerin yapısını, endpoint'lerini, parametrelerini, request/response formatlarını ve güvenlik gereksinimlerini standart bir formatta tanımlamanıza olanak sağlar.

### Temel Özellikler:

- **Standart Format**: YAML veya JSON formatında API'yi tanımlar
- **Otomatik Dokümantasyon**: Swagger UI gibi araçlarla interaktif dokümantasyon oluşturur
- **Kod Üretimi**: Client ve server kodlarını otomatik olarak üretebilir
- **Test Kolaylığı**: API'leri doğrudan dokümantasyondan test edebilirsiniz
- **Takım İşbirliği**: Frontend ve backend ekipleri arasında net bir sözleşme sağlar

### Neden Kullanılır?

1. **Tutarlılık**: Tüm API'ler aynı standartta dokümante edilir
2. **Zaman Tasarrufu**: Otomatik dokümantasyon ve kod üretimi
3. **Hata Azaltma**: API tasarımı kodlamadan önce netleşir
4. **Kolay Entegrasyon**: Farklı ekipler ve sistemler arasında entegrasyon kolaylaşır

## Genel Bakış

Bu örnek, bir e-ticaret platformu için kullanıcı ve ürün yönetimi API'sini göstermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: MyEvents APP API
  version: 1.0.0
  description: >
    Etkinlik yönetimi için kapsamlı bir API.

    ## Ana Özellikler
    - Etkinlik oluşturma ve yönetme (kapasite, katılımcılar, yoklama doğrulama)
    - Her bilet için benzersiz katılım kodu ile hızlı ve güvenli giriş
    - Güvenli ödeme altyapısı ve kullanıcı verilerini koruyan gizlilik politikası
    - Organizasyon ve katılımcılar için merkezi panel
  contact:
    name: Guyde Freny Badinga
    email: badingaguyde@gmail.com

servers:
  - url: https://api.vercel.com
    description: Üretim sunucusu (Production)
  - url: https://staging-api.vercel.com
    description: Test sunucusu (Staging)
  - url: https://localhost:3000
    description: Yerel geliştirme sunucusu (Development)

tags:
  - name: Users
    description: Kullanıcı hesabı oluşturma,liteleme , güncelleme ve silme işlemleri
  - name: Events
    description: Etkinlik oluşturma, listeleme, güncelleme ve silme işlemleri
  - name: Tickets
    description: Bilet oluşturma, listeleme, güncelleme ve silme işlemleri
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama
security:
  - BearerAuth: []

paths:
  /api/users:
    post:
      tags:
        - Users
      summary: Kullanıcı Oluştur
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserInput"
      responses:
        "201":
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
    get:
      tags:
        - Users
      summary: Bır etkınlığe katılan kullanıcıları listele
      operationId: listUsers
      parameters:
        - name: eventid
          in: query
          required: true
          description: Kullanıcıların katıldığı etkinliğin kimlik numarası
          schema:
            type: string
          example: "evt789"

        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Kullanıcılar başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/User"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/users/{userid}:
    parameters:
      - name: userid
        in: path
        required: true
        description: Kullanıcının benzersiz kimlik numarası
        schema:
          type: string
        example: "abc123"

    put:
      tags:
        - Users
      summary: Kullanıcı Güncelle
      operationId: updateUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserInput"
      responses:
        "200":
          description: Kullanıcı başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    delete:
      tags:
        - Users
      summary: Kullanıcı Sil
      operationId: deleteUser
      responses:
        "204":
          description: Kullanıcı başarıyla silindi
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/events:
    get:
      tags:
        - Events
      summary: Etkinlikleri Listele
      operationId: listEvents
      parameters:
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Etkinlikler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    post:
      tags:
        - Events
      summary: Etkinlik Oluştur
      operationId: createEvent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EventInput"
      responses:
        "201":
          description: Etkinlik başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/events/search:
    get:
      tags:
        - Events
      summary: Etkinlikleri Ara
      operationId: searchEvents
      parameters:
        - name: query
          in: query
          required: true
          description: Arama terimi (etkinlik adı veya açıklaması)
          schema:
            type: string
          example: "müzik"
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Arama sonuçları başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/events/category/{category}:
    get:
      tags:
        - Events
      summary: Kategoriye Göre Etkinlikleri Listele
      operationId: listEventsByCategory
      parameters:
        - name: category
          in: path
          required: true
          description: Etkinlik kategorisi ( müzik, spor, sanat ...)
          schema:
            type: string
          example: "müzik"
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Kategoriye göre etkinlikler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/events/inmyarea:
    get:
      tags:
        - Events
      summary: Yakınımdaki Etkinlikleri Listele
      operationId: listNearbyEvents
      parameters:
        - name: lat
          in: query
          required: true
          description: Enlem değeri (latitude)
          schema:
            type: number
            format: float
          example: 37.7749
        - name: long
          in: query
          required: true
          description: Boylam değeri (longitude)
          schema:
            type: number
            format: float
          example: 35.3213
        - name: radius
          in: query
          required: false
          description: Arama yarıçapı (kilometre cinsinden, varsayılan 10 km)
          schema:
            type: integer
            minimum: 1
            default: 10
          example: 10
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Yakınımdaki etkinlikler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi (örneğin, eksik veya hatalı koordinatlar)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı (belirtilen konumda etkinlik yok)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/events/{eventid}:
    get:
      tags:
        - Events
      summary: Katılımcıların listesini getir
      operationId: getEventParticipants
      parameters:
        - name: eventid
          in: path
          required: true
          description: Etkinliğin benzersiz kimlik numarası
          schema:
            type: string
          example: "evt789"
      responses:
        "200":
          description: Katılımcılar başarıyla getirildi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Event"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    put:
      tags:
        - Events
      summary: Etkinlik Güncelle
      operationId: updateEvent
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EventInput"
      responses:
        "200":
          description: Etkinlik başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Event"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    delete:
      tags:
        - Events
      summary: Etkinlik Sil
      operationId: deleteEvent
      responses:
        "204":
          description: Etkinlik başarıyla silindi
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/tickets:
    post:
      tags:
        - Tickets
      summary: Bilet Oluştur
      operationId: createTicket
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/TicketInput"
      responses:
        "201":
          description: Bilet başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Ticket"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    get:
      tags:
        - Tickets
      summary: Biletleri Listele
      operationId: listTickets
      parameters:
        - name: eventid
          in: query
          required: true
          description: Biletlerin ait olduğu etkinliğin kimlik numarası
          schema:
            type: string
          example: "evt789"
        - name: page
          in: query
          required: false
          description: Sayfa numarası (varsayılan 1)
          schema:
            type: integer
            minimum: 1
            default: 1
          example: 1
        - name: limit
          in: query
          required: false
          description: Sayfa başına sonuç sayısı (varsayılan 10, maksimum 50)
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 10
          example: 10
      responses:
        "200":
          description: Biletler başarıyla listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Ticket"
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Etkinlik bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

  /api/tickets/{ticketid}:
    parameters:
      - name: ticketid
        in: path
        required: true
        description: Biletin benzersiz kimlik numarası
        schema:
          type: string
        example: "bkt123"

    post:
      tags:
        - Tickets
      summary: Bileti Kontrol et
      operationId: checkTicket
      responses:
        "200":
          description: Bilet doğrulandı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Ticket"
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Bilet bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "409":
          description: Bilet zaten kullanılmış
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

    delete:
      tags:
        - Tickets
      summary: Bilet Sil
      operationId: deleteTicket
      responses:
        "204":
          description: Bilet başarıyla silindi
        "401":
          description: Kimlik doğrulama başarısız (token eksik veya geçersiz)
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "403":
          description: Bu işlem için yetkiniz bulunmuyor
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
        "404":
          description: Bilet bulunamadı
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"

```

## API Tasarım Prensipleri

### 1. RESTful Yaklaşım
- **Kaynak odaklı URL'ler**: `/users`, `/products`, `/orders`
- **HTTP metodları**: GET (okuma), POST (oluşturma), PUT (güncelleme), DELETE (silme)
- **Durum kodları**: 200 (başarılı), 201 (oluşturuldu), 404 (bulunamadı), vb.

### 2. Versiyonlama
- URL tabanlı versiyonlama: `/v1/users`
- Geriye dönük uyumluluk için önemli

### 3. Güvenlik
- **JWT Authentication**: Bearer token ile kimlik doğrulama
- **HTTPS**: Tüm endpoint'ler için zorunlu
- **Rate Limiting**: API kötüye kullanımını önleme

### 4. Sayfalama
- `page` ve `limit` parametreleri
- Response'da pagination metadata

### 5. Filtreleme ve Sıralama
- Query parametreleri ile filtreleme
- Örnek: `?category=Elektronik&minPrice=1000`

### 6. Hata Yönetimi
- Standart hata formatı
- Anlamlı hata kodları ve mesajları
- Detaylı hata bilgileri (field-level validation)

### 7. Dokümantasyon
- OpenAPI Specification ile otomatik dokümantasyon
- Swagger UI ile interaktif API testi
- Örnek request/response'lar

## Kullanım Örnekleri

### Kullanıcı Kaydı
```bash
curl -X POST https://api.yazmuh.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com",
    "password": "Guvenli123!",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  }'
```

### Giriş Yapma
```bash
curl -X POST https://api.yazmuh.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com",
    "password": "Guvenli123!"
  }'
```

### Ürün Listesi (Filtreleme ile)
```bash
curl -X GET "https://api.yazmuh.com/v1/products?category=Elektronik&minPrice=1000&page=1&limit=20"
```

### Yeni Sipariş Oluşturma
```bash
curl -X POST https://api.yazmuh.com/v1/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "987e6543-e21b-12d3-a456-426614174000",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "Atatürk Caddesi No:123",
      "city": "İstanbul",
      "postalCode": "34000",
      "country": "Türkiye"
    }
  }'
```

## Araçlar ve Kaynaklar

### OpenAPI Editörleri
- [Swagger Editor](https://editor.swagger.io/) - Online OpenAPI editörü
- [VS Code OpenAPI Extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)

### Dokümantasyon Araçları
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - İnteraktif API dokümantasyonu
- [Postman](https://www.postman.com/) - API testş

### Validasyon
- [OpenAPI Validator](https://apitools.dev/swagger-parser/online/) - Spec doğrulama
- [Spectral](https://stoplight.io/open-source/spectral) - API linting

## Rest API Tasarımı

Projemizde kullanılan REST API tasarımı aşağıdaki YAML dosyasında bulunmaktadır:  
[OpenAPI YAML Dosyası](docs/openapi.yaml)