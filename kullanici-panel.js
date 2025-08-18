/**
 * Kullanıcı Paneli JavaScript Dosyası
 * Kullanıcı profilini ve hesap ayarlarını yönetir
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Kullanıcı paneli sayfası yüklendi");
    
    // Aktif kullanıcıyı kontrol et
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici) {
        mesajGoster('Lütfen giriş yapınız.', 'warning');
        setTimeout(() => {
            window.location.href = 'giris.html';
        }, 2000);
        return;
    }

    // Kullanıcı bilgilerini yükle
    kullaniciBilgileriniYukle(aktifKullanici);
    
    // Avatar harfini güncelle
    updateAvatar(aktifKullanici);
    
    // Form dinleyicileri ekle
    formDinleyicileriEkle();
    
    // Modal dinleyicileri ekle
    modalDinleyicileriEkle();
});

/**
 * Kullanıcı bilgilerini sayfaya yükler
 */
function kullaniciBilgileriniYukle(aktifKullanici) {
    console.log("Kullanıcı bilgileri yükleniyor:", aktifKullanici);
    
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
    console.log("Avatar güncelleniyor");
    
    const avatarHarf = document.getElementById('avatarHarf');
    if (avatarHarf) {
        if (aktifKullanici.adSoyad) {
            avatarHarf.textContent = aktifKullanici.adSoyad.charAt(0).toUpperCase();
        } else if (aktifKullanici.kullaniciAdi) {
            avatarHarf.textContent = aktifKullanici.kullaniciAdi.charAt(0).toUpperCase();
        }
    } else {
        console.warn("Avatar elementi bulunamadı");
    }
}

/**
 * Form dinleyicileri ekler
 */
function formDinleyicileriEkle() {
    console.log("Form dinleyicileri ekleniyor");
    
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
 * Modal dinleyicileri ekler
 */
function modalDinleyicileriEkle() {
    console.log("Modal dinleyicileri ekleniyor");
    
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
    console.log("Profil güncelleme işlemi başlatılıyor");
    
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
    console.log("Şifre güncelleme işlemi başlatılıyor");
    
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
    console.log("Bildirim tercihleri güncelleniyor");
    
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

/**
 * Hesabı siler
 */
function hesabiSil() {
    console.log("Hesap silme işlemi başlatılıyor");
    
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    
    // Kullanıcıyı listeden kaldır
    const yeniKullanicilar = kullanicilar.filter(k => k.kullaniciAdi !== aktifKullanici.kullaniciAdi);
    localStorage.setItem('kullanicilar', JSON.stringify(yeniKullanicilar));
    
    // Kullanıcının işlemlerini de kaldır
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const yeniIslemler = islemler.filter(islem => islem.kullanici !== aktifKullanici.kullaniciAdi);
    localStorage.setItem('islemler', JSON.stringify(yeniIslemler));
    
    // Aktif kullanıcıyı kaldır
    localStorage.removeItem('aktifKullanici');
    
    // Modal'ı kapat
    try {
        const modal = bootstrap.Modal.getInstance(document.getElementById('hesapSilModal'));
        if (modal) modal.hide();
    } catch (error) {
        console.error("Modal kapatma hatası:", error);
    }
    
    mesajGoster('Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz.', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

/**
 * Mesaj gösterme fonksiyonu
 * @param {string} mesaj Gösterilecek mesaj
 * @param {string} tip Mesaj tipi (success, danger, warning, info)
 */
function mesajGoster(mesaj, tip = 'success') {
    // Ana uygulamadaki mesaj sistemi
    if (window.mesajGoster) {
        window.mesajGoster(mesaj, tip);
        return;
    }
    
    // Toast container'ı bul veya oluştur
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 start-50 translate-middle-x p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // İkon belirleme
    let icon = 'bi-check-circle-fill';
    if (tip === 'danger') icon = 'bi-exclamation-circle-fill';
    if (tip === 'warning') icon = 'bi-exclamation-triangle-fill';
    if (tip === 'info') icon = 'bi-info-circle-fill';
    
    // Toast oluştur
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${tip} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi ${icon} me-2"></i> ${mesaj}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    try {
        // Toast'u göster
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        
        bsToast.show();
        
        // Kapandığında DOM'dan kaldır
        toast.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    } catch (error) {
        console.error("Toast gösterme hatası:", error);
        
        // Alternatif mesaj gösterimi
        alert(mesaj);
    }
}

// Global erişim için window'a ekle
window.updateAvatar = updateAvatar;
window.kullaniciBilgileriniYukle = kullaniciBilgileriniYukle;
window.hesabiSil = hesabiSil;