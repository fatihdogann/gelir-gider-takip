/**
 * Gelir Gider Takip Uygulaması - Ana JavaScript Dosyası
 * Tüm sayfalarda kullanılan ortak fonksiyonları içerir
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sayfa yüklendi ve tüm fonksiyonlar çalıştırıldı.");
    testHesabiKur();       // Test hesabını oluştur (geliştirme aşamasında)
    navbarAktiflik();     // Aktif sayfayı vurgula
    oturumKontrolEt();    // Kullanıcı oturum kontrolü
    iletisimFormuDinle(); // İletişim formunu dinle
    cagriButonuKontrol(); // Anasayfadaki "Hemen Başlayın" çağrı butonunu kontrol et
});

// === Test Hesabı Kurulumu ===
// Geliştirme aşamasında test hesabı oluşturulmasını sağlar
function testHesabiKur() {
    console.log("Test hesabı oluşturuluyor...");
    
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

// === Navbar Aktiflik ===
// Hangi sayfanın aktif olduğunu vurgular
function navbarAktiflik() {
    const navLinks = document.querySelectorAll(".nav-link");
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach((link) => {
        const linkPage = link.getAttribute('href');
        if (linkPage && (currentPage === linkPage || (currentPage === '' && linkPage === 'index.html'))) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// === Oturum Kontrolü ===
// Kullanıcının oturum açıp açmadığını kontrol eder ve navbarı günceller
function oturumKontrolEt() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const sayfaAdi = window.location.pathname.split('/').pop() || 'index.html';

    // Navbar elemanlarını al
    const gelirGiderLink = document.getElementById('gelirGiderLink');
    const navUserArea = document.getElementById('navUserArea');
    const userNavArea = document.getElementById('userNavArea');
    
    // Kullanıcı giriş yapmış
    if (aktifKullanici) {
        // Gelir-Gider bağlantısını göster
        if (gelirGiderLink) gelirGiderLink.style.display = 'block';

        // Kullanıcı alanını güncelle (navUserArea veya userNavArea)
        const userAreaElement = navUserArea || userNavArea;
        if (userAreaElement) {
            userAreaElement.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle me-1"></i> ${aktifKullanici.adSoyad || aktifKullanici.kullaniciAdi}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="kullanici-panel.html"><i class="bi bi-person me-2"></i>Profilim</a></li>
                        <li><a class="dropdown-item" href="gelir-gider.html"><i class="bi bi-graph-up me-2"></i>Gelir-Gider</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="cikisYap()"><i class="bi bi-box-arrow-right me-2"></i>Çıkış Yap</a></li>
                    </ul>
                </li>
            `;
        }
        
        // Çağrı butonunu güncelle
        cagriButonuKontrol();
        
    } 
    // Kullanıcı giriş yapmamış
    else {
        // Gelir-Gider bağlantısını gizle
        if (gelirGiderLink) gelirGiderLink.style.display = 'none';

        // Kullanıcı alanını güncelle
        const userAreaElement = navUserArea || userNavArea;
        if (userAreaElement) {
            userAreaElement.innerHTML = `
                <li class="nav-item"><a class="nav-link ${sayfaAdi === 'giris.html' ? 'active' : ''}" href="giris.html"><i class="bi bi-box-arrow-in-right me-1"></i>Giriş Yap</a></li>
                <li class="nav-item"><a class="nav-link ${sayfaAdi === 'kayit.html' ? 'active' : ''}" href="kayit.html"><i class="bi bi-person-plus me-1"></i>Kayıt Ol</a></li>
            `;
        }
    }

    // Korumalı sayfaların kontrolü
    const korunakliSayfalar = ['gelir-gider.html', 'kullanici-panel.html'];
    
    if (!aktifKullanici && korunakliSayfalar.includes(sayfaAdi)) {
        mesajGoster('Bu sayfaya erişmek için giriş yapmanız gerekiyor.', 'warning');
        setTimeout(() => {
            window.location.href = 'giris.html';
        }, 2000);
    }
}

// === Çağrı Butonu Kontrolü ===
// Anasayfadaki "Hemen Başlayın" bölümünü kontrol eder
function cagriButonuKontrol() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    const sayfaAdi = window.location.pathname.split('/').pop() || 'index.html';
    const callToActionSection = document.querySelector('.call-to-action');
    
    // Anasayfada ise ve kullanıcı giriş yapmışsa
    if (sayfaAdi === 'index.html' || sayfaAdi === '' || sayfaAdi === '/') {
        if (callToActionSection && aktifKullanici) {
            // Call to action bölümünü kullanıcı için güncelle
            callToActionSection.innerHTML = `
                <div class="container">
                    <h2 class="mb-4">Merhaba, ${aktifKullanici.adSoyad || aktifKullanici.kullaniciAdi}!</h2>
                    <p class="lead mb-4">Finansal durumunuzu kontrol etmeye devam edin.</p>
                    <div class="d-flex justify-content-center gap-3">
                        <a href="gelir-gider.html" class="btn btn-light btn-lg px-4">
                            <i class="bi bi-graph-up me-2"></i>Gelir-Gider Sayfası
                        </a>
                        <a href="kullanici-panel.html" class="btn btn-outline-light btn-lg px-4">
                            <i class="bi bi-person me-2"></i>Profilim
                        </a>
                    </div>
                </div>
            `;
        }
    }
}

// === Çıkış Yap ===
// Kullanıcı oturumunu sonlandırır ve anasayfaya yönlendirir
function cikisYap() {
    localStorage.removeItem('aktifKullanici');
    mesajGoster('Başarıyla çıkış yaptınız.', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// === İletişim Formu Gönderimi ===
function iletisimFormuDinle() {
    const iletisimForm = document.getElementById('iletisimForm');
    if (iletisimForm) {
        iletisimForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Form verilerini al
            const formData = {
                adSoyad: document.getElementById('adSoyad').value,
                email: document.getElementById('email').value,
                konu: document.getElementById('konu').value,
                mesaj: document.getElementById('mesaj').value
            };
            
            console.log('Form verileri:', formData);
            mesajGoster('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
            iletisimForm.reset(); // Formu temizle
        });
    }
}

// === Dinamik Mesaj Göster ===
// Başarı veya hata mesajlarını ekranda gösterir
function mesajGoster(mesaj, tip = "success") {
    // Mevcut mesaj varsa kaldır
    const mevcutMesajlar = document.querySelectorAll('.toast, .alert.mesaj-kutusu');
    mevcutMesajlar.forEach(eski => {
        if (eski) {
            if (eski.classList.contains('toast')) {
                const bsToast = bootstrap.Toast.getInstance(eski);
                if (bsToast) bsToast.dispose();
            }
            eski.remove();
        }
    });
    
    // Toast gösterimi (Bootstrap 5 ile)
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Toast !== 'undefined') {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 start-50 translate-middle-x p-3';
        toastContainer.style.zIndex = '9999';
        
        const iconMap = {
            success: 'bi-check-circle-fill',
            danger: 'bi-exclamation-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        
        const toastHTML = `
            <div class="toast align-items-center text-white bg-${tip} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${iconMap[tip] || 'bi-info-circle-fill'} me-2"></i>
                        ${mesaj}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.innerHTML = toastHTML;
        document.body.appendChild(toastContainer);
        
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 4000
        });
        
        toast.show();
        
        // Toast kapatıldığında container'ı kaldır
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastContainer.remove();
        });
    } 
    // Basit alert gösterimi (Bootstrap olmadığında)
    else {
        const mesajKutusu = document.createElement("div");
        mesajKutusu.className = `alert alert-${tip} alert-dismissible fade show mesaj-kutusu`;
        mesajKutusu.style.position = 'fixed';
        mesajKutusu.style.top = '20px';
        mesajKutusu.style.left = '50%';
        mesajKutusu.style.transform = 'translateX(-50%)';
        mesajKutusu.style.zIndex = '9999';
        mesajKutusu.style.minWidth = '300px';
        mesajKutusu.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

        mesajKutusu.innerHTML = `
            ${mesaj}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Kapat"></button>
        `;

        document.body.appendChild(mesajKutusu);

        // 5 saniye sonra mesajı kaldır
        setTimeout(() => {
            if (document.body.contains(mesajKutusu)) {
                mesajKutusu.classList.remove('show');
                setTimeout(() => mesajKutusu.remove(), 300);
            }
        }, 5000);
    }
}

// Genel yardımcı fonksiyonlar
window.mesajGoster = mesajGoster; // Diğer JS dosyalarında kullanılabilmesi için global yap
window.cikisYap = cikisYap; // Global çıkış yap fonksiyonu