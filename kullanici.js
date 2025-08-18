/**
 * Gelir-Gider Takip Sistemi - Kullanıcı İşlemleri
 * Tüm kullanıcı işlemlerini (kayıt, giriş, profil yönetimi, şifre sıfırlama) yönetir
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Kullanıcı işlemleri başlatılıyor...");
    
    // Her durumda test hesabını oluştur
    testHesabiKur();
    
    // Sayfanın hangi işlem için olduğunu belirle
    const sayfaTipi = belirleIslemTipi();
    console.log("Sayfa tipi:", sayfaTipi);
    
    // Sayfaya göre farklı işlemler başlat
    switch(sayfaTipi) {
        case 'giris':
            initGirisIslemleri();
            break;
        case 'kayit':
            initKayitIslemleri();
            break;
        case 'sifre-sifirla':
            initSifreSifirlaIslemleri();
            break;
        case 'kullanici-panel':
            initKullaniciPanelIslemleri();
            break;
        default:
            // Standart kullanıcı durum kontrolü
            aktifKullaniciKontrolEt();
    }
});

/**
 * Sayfanın hangi işlem için olduğunu belirler
 */
function belirleIslemTipi() {
    const sayfaYolu = window.location.pathname;
    const sayfaAdi = sayfaYolu.split('/').pop();
    
    if (sayfaAdi.includes('giris')) return 'giris';
    if (sayfaAdi.includes('kayit')) return 'kayit';
    if (sayfaAdi.includes('sifre')) return 'sifre-sifirla';
    if (sayfaAdi.includes('kullanici-panel')) return 'kullanici-panel';
    
    return 'diger';
}

//==================================
// TEST HESABI
//==================================

/**
 * Test hesabı oluşturur
 * NOT: Bu fonksiyon sadece geliştirme aşamasında test için kullanılmaktadır!
 */
function testHesabiKur() {
    console.log("Test hesabı kontrol ediliyor...");
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    // Test hesabının var olup olmadığını kontrol et
    const testHesapVar = kullanicilar.some(k => k.kullaniciAdi === 'test');
    
    if (!testHesapVar) {
        // Test hesabı oluştur
        const testHesap = {
            adSoyad: 'Test Kullanıcı',
            kullaniciAdi: 'test',
            email: 'test@gelirgider.com',
            sifre: '123456',
            kayitTarihi: new Date().toISOString(),
            sonGirisTarihi: new Date().toISOString()
        };
        
        kullanicilar.push(testHesap);
        localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
        console.log('Test hesabı oluşturuldu:', testHesap);
    } else {
        console.log('Test hesabı zaten mevcut.');
    }
}

//==================================
// GİRİŞ İŞLEMLERİ
//==================================

/**
 * Giriş işlemlerini başlatır
 */
function initGirisIslemleri() {
    console.log("Giriş işlemleri başlatılıyor...");
    
    // Oturum kontrolü
    if (aktifKullaniciVarMi()) {
        console.log("Aktif kullanıcı var, anasayfaya yönlendiriliyor");
        window.location.href = 'index.html';
        return;
    }
    
    // Test hesabı bilgisine tıklanınca form doldurma
    const testHesapInfo = document.querySelector('.test-account');
    if (testHesapInfo) {
        testHesapInfo.addEventListener('click', function() {
            document.getElementById('kullaniciAdiEmail').value = 'test';
            document.getElementById('sifre').value = '123456';
        });
    }
    
    // Şifre göster/gizle butonu
    const sifreGoster = document.getElementById('sifreGoster');
    if (sifreGoster) {
        sifreGoster.addEventListener('click', function() {
            const sifreInput = document.getElementById('sifre');
            const icon = this.querySelector('i');
            
            if (sifreInput.type === 'password') {
                sifreInput.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                sifreInput.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    }
    
    // Giriş formunu dinle
    const girisForm = document.getElementById('girisForm');
    if (girisForm) {
        girisForm.addEventListener('submit', (e) => {
            e.preventDefault();
            girisYap();
        });
    }
}

/**
 * Giriş yapar
 */
function girisYap() {
    const kullaniciAdiEmail = document.getElementById('kullaniciAdiEmail').value.trim();
    const sifre = document.getElementById('sifre').value;
    const beniHatirla = document.getElementById('beniHatirla') ? document.getElementById('beniHatirla').checked : false;
    
    if (!kullaniciAdiEmail || !sifre) {
        mesajGoster('Lütfen kullanıcı adı/e-posta ve şifrenizi girin.', 'danger');
        return;
    }
    
    console.log("Giriş yapılıyor:", kullaniciAdiEmail);
    
    // Kullanıcılar listesini al
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    console.log("Mevcut kullanıcılar:", kullanicilar);
    
    // Kullanıcıyı bul
    const kullanici = kullanicilar.find(k => 
        (k.kullaniciAdi === kullaniciAdiEmail || k.email === kullaniciAdiEmail) && 
        k.sifre === sifre
    );
    
    if (kullanici) {
        console.log("Kullanıcı bulundu:", kullanici);
        
        // Son giriş tarihini güncelle
        kullanici.sonGirisTarihi = new Date().toISOString();
        
        // Beni hatırla
        kullanici.hatirla = beniHatirla;
        
        // Kullanıcılar listesinde güncelle
        const index = kullanicilar.findIndex(k => k.kullaniciAdi === kullanici.kullaniciAdi);
        if (index !== -1) {
            kullanicilar[index] = kullanici;
            localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
        }
        
        // Aktif kullanıcıyı ayarla
        localStorage.setItem('aktifKullanici', JSON.stringify(kullanici));
        
        mesajGoster('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        console.log("Kullanıcı bulunamadı veya şifre hatalı");
        mesajGoster('Kullanıcı adı/e-posta veya şifre hatalı.', 'danger');
    }
}

//==================================
// KAYIT İŞLEMLERİ
//==================================

/**
 * Kayıt işlemlerini başlatır
 */
function initKayitIslemleri() {
    console.log("Kayıt işlemleri başlatılıyor...");
    
    // Oturum kontrolü
    if (aktifKullaniciVarMi()) {
        console.log("Aktif kullanıcı var, anasayfaya yönlendiriliyor");
        window.location.href = 'index.html';
        return;
    }
    
    // Şifre göster/gizle butonları
    const sifreGoster = document.getElementById('sifreGoster');
    if (sifreGoster) {
        sifreGoster.addEventListener('click', function() {
            const sifreInput = document.getElementById('sifre');
            const icon = this.querySelector('i');
            
            if (sifreInput.type === 'password') {
                sifreInput.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                sifreInput.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    }
    
    const sifreOnayGoster = document.getElementById('sifreOnayGoster');
    if (sifreOnayGoster) {
        sifreOnayGoster.addEventListener('click', function() {
            const sifreOnayInput = document.getElementById('sifreOnay');
            const icon = this.querySelector('i');
            
            if (sifreOnayInput.type === 'password') {
                sifreOnayInput.type = 'text';
                icon.classList.replace('bi-eye-slash', 'bi-eye');
            } else {
                sifreOnayInput.type = 'password';
                icon.classList.replace('bi-eye', 'bi-eye-slash');
            }
        });
    }
    
    // Kayıt formunu dinle
    const kayitForm = document.getElementById('kayitForm');
    if (kayitForm) {
        kayitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            kayitOl();
        });
    }
}

/**
 * Kayıt yapar
 */
function kayitOl() {
    const adSoyad = document.getElementById('adSoyad').value.trim();
    const kullaniciAdi = document.getElementById('kullaniciAdi').value.trim();
    const email = document.getElementById('email').value.trim();
    const sifre = document.getElementById('sifre').value;
    const sifreOnay = document.getElementById('sifreOnay').value;
    const kosullarKabul = document.getElementById('kosullarKabul').checked;
    
    console.log("Kayıt bilgileri:", { adSoyad, kullaniciAdi, email });
    
    // Form doğrulama
    if (!adSoyad || !kullaniciAdi || !email || !sifre) {
        mesajGoster('Lütfen tüm alanları doldurun.', 'danger');
        return;
    }
    
    if (!kosullarKabul) {
        mesajGoster('Devam etmek için kullanım koşullarını kabul etmelisiniz.', 'danger');
        return;
    }
    
    if (sifre !== sifreOnay) {
        mesajGoster('Şifreler eşleşmiyor.', 'danger');
        return;
    }
    
    if (sifre.length < 6) {
        mesajGoster('Şifre en az 6 karakter olmalıdır.', 'danger');
        return;
    }
    
    // E-posta geçerliliği
    if (!gecerliEmail(email)) {
        mesajGoster('Lütfen geçerli bir e-posta adresi girin.', 'danger');
        return;
    }
    
    // Kullanıcı adı geçerliliği - Özel karakter ve boşluk olmamalı
    if (!/^[a-zA-Z0-9_]+$/.test(kullaniciAdi)) {
        mesajGoster('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.', 'danger');
        return;
    }
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    // Kullanıcı adı veya e-posta kullanılıyor mu kontrol et
    const kullaniciAdiVar = kullanicilar.some(k => k.kullaniciAdi === kullaniciAdi);
    const emailVar = kullanicilar.some(k => k.email === email);
    
    if (kullaniciAdiVar) {
        mesajGoster('Bu kullanıcı adı zaten kullanılıyor.', 'danger');
        return;
    }
    
    if (emailVar) {
        mesajGoster('Bu e-posta adresi zaten kullanılıyor.', 'danger');
        return;
    }
    
    // Yeni kullanıcı oluştur
    const yeniKullanici = {
        adSoyad,
        kullaniciAdi,
        email,
        sifre,
        kayitTarihi: new Date().toISOString(),
        sonGirisTarihi: new Date().toISOString()
    };
    
    // Kullanıcıyı kaydet
    kullanicilar.push(yeniKullanici);
    localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
    
    console.log("Yeni kullanıcı oluşturuldu:", yeniKullanici);
    
    // Otomatik giriş yap
    localStorage.setItem('aktifKullanici', JSON.stringify(yeniKullanici));
    
    mesajGoster('Kayıt başarılı! Yönlendiriliyorsunuz...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

//==================================
// ŞİFRE SIFIRLAMA İŞLEMLERİ
//==================================

/**
 * Şifre sıfırlama işlemlerini başlatır
 */
function initSifreSifirlaIslemleri() {
    console.log("Şifre sıfırlama işlemleri başlatılıyor...");
    
    // Oturum kontrolü
    if (aktifKullaniciVarMi()) {
        console.log("Aktif kullanıcı var, anasayfaya yönlendiriliyor");
        window.location.href = 'index.html';
        return;
    }
    
    // Şifre sıfırlama formunu dinle
    const sifreSifirlaForm = document.getElementById('sifreSifirlaForm');
    if (sifreSifirlaForm) {
        sifreSifirlaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sifreSifirlamaMailiGonder();
        });
    }
}

/**
 * Şifre sıfırlama e-postası gönderir (simülasyon)
 */
function sifreSifirlamaMailiGonder() {
    const email = document.getElementById('email').value.trim();
    const yuklemeSpinner = document.getElementById('yuklemeSpinner');
    const mesajKutusu = document.getElementById('mesajKutusu');
    
    if (!email) {
        mesajGoster('Lütfen e-posta adresinizi girin.', 'danger');
        return;
    }
    
    // E-posta geçerliliği
    if (!gecerliEmail(email)) {
        mesajGoster('Lütfen geçerli bir e-posta adresi girin.', 'danger');
        return;
    }
    
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    // Kullanıcı var mı kontrol et
    const kullanici = kullanicilar.find(k => k.email === email);
    
    if (!kullanici) {
        mesajGoster('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.', 'danger');
        return;
    }
    
    // Yükleme göstergesini göster
    if (yuklemeSpinner) {
        yuklemeSpinner.classList.remove('d-none');
    }
    
    console.log("Şifre sıfırlama e-postası gönderiliyor:", email);
    
    // Sıfırlama işlemi simülasyonu
    setTimeout(() => {
        // Yükleme göstergesini gizle
        if (yuklemeSpinner) {
            yuklemeSpinner.classList.add('d-none');
        }
        
        // Mesaj kutusunu göster
        if (mesajKutusu) {
            mesajKutusu.classList.remove('d-none');
            mesajKutusu.classList.add('alert-success');
            mesajKutusu.textContent = `Şifre sıfırlama bağlantısı ${email} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.`;
        } else {
            mesajGoster(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.`, 'success');
        }
        
        // Formu temizle
        document.getElementById('email').value = '';
    }, 2000);
}

//==================================
// KULLANICI PANELİ İŞLEMLERİ
//==================================

/**
 * Kullanıcı paneli işlemlerini başlatır
 */
function initKullaniciPanelIslemleri() {
    console.log("Kullanıcı paneli işlemleri başlatılıyor...");
    
    // Oturum kontrolü yap
    const aktifKullanici = aktifKullaniciKontrolEt();
    if (!aktifKullanici) return; // Kontrol fonksiyonu yönlendirme yapar
    
    // Kullanıcı bilgilerini yükle
    kullaniciBilgileriniYukle(aktifKullanici);
    
    // Avatar harfini güncelle
    updateAvatar(aktifKullanici);
    
    // Form ve modal dinleyicileri ekle
    panelFormDinleyicileriEkle();
    panelModalDinleyicileriEkle();
}

/**
 * Kullanıcı bilgilerini sayfaya yükler
 */
function kullaniciBilgileriniYukle(aktifKullanici) {
    // Navigasyon ve başlık bilgilerini güncelle
    const kullaniciAdiElements = document.querySelectorAll('[id="kullaniciAdi"]');
    const panelKullaniciAdi = document.getElementById('panelKullaniciAdi');
    const profilAdSoyad = document.getElementById('profilAdSoyad');
    
    kullaniciAdiElements.forEach(element => {
        element.textContent = aktifKullanici.adSoyad || aktifKullanici.kullaniciAdi;
    });
    
    if (panelKullaniciAdi) {
        panelKullaniciAdi.textContent = aktifKullanici.adSoyad || aktifKullanici.kullaniciAdi;
    }
    
    if (profilAdSoyad) {
        profilAdSoyad.textContent = aktifKullanici.adSoyad || aktifKullanici.kullaniciAdi;
    }
    
    // Form alanlarını doldur
    const adSoyadInput = document.getElementById('adSoyad');
    const emailInput = document.getElementById('email');
    const telefonInput = document.getElementById('telefonNo');
    
    if (adSoyadInput) adSoyadInput.value = aktifKullanici.adSoyad || '';
    if (emailInput) emailInput.value = aktifKullanici.email || '';
    
    // Telefon varsa doldur
    if (telefonInput && aktifKullanici.telefonNo) {
        telefonInput.value = aktifKullanici.telefonNo;
    }
    
    // Kayıt tarihi
    const kayitTarihiElement = document.getElementById('kayitTarihi');
    if (kayitTarihiElement && aktifKullanici.kayitTarihi) {
        const kayitTarihi = new Date(aktifKullanici.kayitTarihi);
        kayitTarihiElement.textContent = kayitTarihi.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Son giriş bilgisi
    const sonGirisTarihiElement = document.getElementById('sonGirisTarihi');
    if (sonGirisTarihiElement && aktifKullanici.sonGirisTarihi) {
        const sonGiris = new Date(aktifKullanici.sonGirisTarihi);
        sonGirisTarihiElement.textContent = sonGiris.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Bildirim tercihleri (varsa)
    if (aktifKullanici.bildirimler) {
        if (document.getElementById('bildirimEmail')) {
            document.getElementById('bildirimEmail').checked = aktifKullanici.bildirimler.email;
        }
        if (document.getElementById('bildirimTavsiye')) {
            document.getElementById('bildirimTavsiye').checked = aktifKullanici.bildirimler.tavsiye;
        }
        if (document.getElementById('bildirimYenilik')) {
            document.getElementById('bildirimYenilik').checked = aktifKullanici.bildirimler.yenilik;
        }
    }
}

/**
 * Kullanıcı avatarını günceller
 */
function updateAvatar(aktifKullanici) {
    const avatarHarf = document.getElementById('avatarHarf');
    if (avatarHarf && aktifKullanici.adSoyad) {
        avatarHarf.textContent = aktifKullanici.adSoyad.charAt(0).toUpperCase();
    } else if (avatarHarf && aktifKullanici.kullaniciAdi) {
        avatarHarf.textContent = aktifKullanici.kullaniciAdi.charAt(0).toUpperCase();
    }
}

/**
 * Panel form dinleyicileri ekler
 */
function panelFormDinleyicileriEkle() {
    // Profil bilgileri formunu dinle
    const profilBilgileriForm = document.getElementById('profilBilgileriForm');
    if (profilBilgileriForm) {
        profilBilgileriForm.addEventListener('submit', (e) => {
            e.preventDefault();
            profilGuncelle();
        });
    }
    
    // Şifre değiştirme formunu dinle
    const sifreDegistirForm = document.getElementById('sifreDegistirForm');
    if (sifreDegistirForm) {
        sifreDegistirForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sifreGuncelle();
        });
    }
    
    // Bildirim ayarları formunu dinle
    const bildirimAyarlariForm = document.getElementById('bildirimAyarlariForm');
    if (bildirimAyarlariForm) {
        bildirimAyarlariForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bildirimTercihleriniGuncelle();
        });
    }
}

/**
 * Panel modal dinleyicileri ekler
 */
function panelModalDinleyicileriEkle() {
    // Hesap silme onayını kontrol et
    const silmeOnayKutusu = document.getElementById('silmeOnayKutusu');
    const hesapSilBtn = document.getElementById('hesapSilBtn');
    
    if (silmeOnayKutusu && hesapSilBtn) {
        silmeOnayKutusu.addEventListener('input', function() {
            hesapSilBtn.disabled = this.value !== 'SİL';
        });
        
        // Hesap silme işlemi
        hesapSilBtn.addEventListener('click', function() {
            hesabiSil();
        });
    }
}

/**
 * Profil bilgilerini günceller
 */
function profilGuncelle() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    const yeniAdSoyad = document.getElementById('adSoyad').value.trim();
    const yeniEmail = document.getElementById('email').value.trim();
    const yeniTelefon = document.getElementById('telefonNo') ? document.getElementById('telefonNo').value.trim() : '';
    
    // E-posta kontrolü - başka bir kullanıcı tarafından kullanılıyor mu?
    const emailKullanildi = kullanicilar.some(k => 
        k.kullaniciAdi !== aktifKullanici.kullaniciAdi && 
        k.email === yeniEmail
    );
    
    if (emailKullanildi) {
        mesajGoster('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.', 'danger');
        return;
    }
    
    // Kullanıcı bilgilerini güncelle
    aktifKullanici.adSoyad = yeniAdSoyad;
    aktifKullanici.email = yeniEmail;
    
    if (yeniTelefon) {
        aktifKullanici.telefonNo = yeniTelefon;
    }
    
    // Kullanıcılar listesinde güncelle
    const index = kullanicilar.findIndex(k => k.kullaniciAdi === aktifKullanici.kullaniciAdi);
    if (index !== -1) {
        kullanicilar[index] = aktifKullanici;
        localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
    }
    
    // Aktif kullanıcıyı güncelle
    localStorage.setItem('aktifKullanici', JSON.stringify(aktifKullanici));
    
    // Arayüzü güncelle
    kullaniciBilgileriniYukle(aktifKullanici);
    updateAvatar(aktifKullanici);
    
    mesajGoster('Profil bilgileriniz başarıyla güncellendi.', 'success');
}

/**
 * Şifre değiştirir
 */
function sifreGuncelle() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    const eskiSifre = document.getElementById('eskiSifre').value;
    const yeniSifre = document.getElementById('yeniSifre').value;
    const yeniSifreOnay = document.getElementById('yeniSifreOnay').value;
    
    // Şifre kontrolleri
    if (eskiSifre !== aktifKullanici.sifre) {
        mesajGoster('Mevcut şifreniz hatalı.', 'danger');
        return;
    }
    
    if (yeniSifre !== yeniSifreOnay) {
        mesajGoster('Yeni şifreler eşleşmiyor.', 'danger');
        return;
    }
    
    if (yeniSifre.length < 6) {
        mesajGoster('Yeni şifre en az 6 karakter olmalıdır.', 'danger');
        return;
    }
    
    // Şifreyi güncelle
    aktifKullanici.sifre = yeniSifre;
    
    // Kullanıcılar listesinde güncelle
    const index = kullanicilar.findIndex(k => k.kullaniciAdi === aktifKullanici.kullaniciAdi);
    if (index !== -1) {
        kullanicilar[index] = aktifKullanici;
        localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
    }
    
    // Aktif kullanıcıyı güncelle
    localStorage.setItem('aktifKullanici', JSON.stringify(aktifKullanici));
    
    // Formu temizle
    document.getElementById('eskiSifre').value = '';
    document.getElementById('yeniSifre').value = '';
    document.getElementById('yeniSifreOnay').value = '';
    
    mesajGoster('Şifreniz başarıyla güncellendi.', 'success');
}

/**
 * Bildirim tercihlerini günceller
 */
function bildirimTercihleriniGuncelle() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    // Bildirim tercihlerini al
    const emailBildirim = document.getElementById('bildirimEmail').checked;
    const tavsiyeBildirim = document.getElementById('bildirimTavsiye').checked;
    const yenilikBildirim = document.getElementById('bildirimYenilik').checked;
    
    // Kullanıcı tercihlerini güncelle
    aktifKullanici.bildirimler = {
        email: emailBildirim,
        tavsiye: tavsiyeBildirim,
        yenilik: yenilikBildirim,
        guncellenmeTarihi: new Date().toISOString()
    };
    
    // Kullanıcılar listesinde güncelle
    const index = kullanicilar.findIndex(k => k.kullaniciAdi === aktifKullanici.kullaniciAdi);
    if (index !== -1) {
        kullanicilar[index] = aktifKullanici;
        localStorage.setItem('kullanicilar', JSON.stringify(kullanicilar));
    }
    
    // Aktif kullanıcıyı güncelle
    localStorage.setItem('aktifKullanici', JSON.stringify(aktifKullanici));
    
    mesajGoster('Bildirim tercihleriniz başarıyla güncellendi.', 'success');
}