/**
 * Şifre Sıfırlama Modülü
 * 
 * Bu dosya, kullanıcı şifre sıfırlama işlemlerini yönetir.
 * LocalStorage ile çalışan bir simülasyondur.
 */

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Şifre sıfırlama formunu dinle
    const sifreSifirlaForm = document.getElementById('sifreSifirlaForm');
    if (sifreSifirlaForm) {
        sifreSifirlaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sifreSifirlamaIstek();
        });
    }

    // Aktif kullanıcıyı kontrol et - eğer zaten giriş yapmışsa anasayfaya yönlendir
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (aktifKullanici) {
        mesajGoster('Zaten giriş yapmış durumdasınız. Anasayfaya yönlendiriliyorsunuz.', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
});

/**
 * Şifre sıfırlama isteği gönderir (simülasyon)
 */
function sifreSifirlamaIstek() {
    const email = document.getElementById('email').value.trim();
    const yuklemeSpinner = document.getElementById('yuklemeSpinner');
    const mesajKutusu = document.getElementById('mesajKutusu');
    
    if (!email) {
        mesajGoster('Lütfen e-posta adresinizi girin.', 'danger');
        return;
    }
    
    // E-posta geçerliliği
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mesajGoster('Lütfen geçerli bir e-posta adresi girin.', 'danger');
        return;
    }
    
    // Kullanıcıları kontrol et
    const kullanicilar = JSON.parse(localStorage.getItem('kullanicilar')) || [];
    const kullanici = kullanicilar.find(k => k.email === email);
    
    // Yükleme göstergesini göster
    if (yuklemeSpinner) {
        yuklemeSpinner.classList.remove('d-none');
    }
    
    // Sayfa kaydırma
    window.scrollTo({top: 0, behavior: 'smooth'});
    
    // Sıfırlama işlemi simülasyonu - 1.5 saniye beklet
    setTimeout(() => {
        // Yükleme göstergesini gizle
        if (yuklemeSpinner) {
            yuklemeSpinner.classList.add('d-none');
        }
        
        // Kullanıcı kontrolü - kullanıcı bulunamasa bile başarı mesajı göster (güvenlik için)
        // E-posta gerçekten varsa ve iletişime geçmek isteniyorsa bu değiştirilebilir
        if (mesajKutusu) {
            mesajKutusu.classList.remove('d-none');
            mesajKutusu.className = 'alert alert-success';
            mesajKutusu.innerHTML = `
                <i class="bi bi-check-circle-fill me-2"></i>
                Şifre sıfırlama bağlantısı <strong>${email}</strong> adresine gönderildi. 
                Lütfen e-posta kutunuzu kontrol edin.
            `;
        } else {
            mesajGoster(`Şifre sıfırlama bağlantısı ${email} adresine gönderildi. Lütfen e-posta kutunuzu kontrol edin.`, 'success');
        }
        
        // Formu temizle
        document.getElementById('sifreSifirlaForm').reset();
        
        // Otomatik olarak 5 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
            mesajGoster('Giriş sayfasına yönlendiriliyorsunuz...', 'info');
            setTimeout(() => {
                window.location.href = 'giris.html';
            }, 1500);
        }, 3000);
        
    }, 1500);
}

/**
 * Mesaj gösterme fonksiyonu (toast kullanarak)
 * @param {string} mesaj - Gösterilecek mesaj
 * @param {string} tip - Mesaj tipi (success, danger, warning, info)
 */
function mesajGoster(mesaj, tip = 'success') {
    // Önce mesaj kutusunu kontrol et
    const mesajKutusu = document.getElementById('mesajKutusu');
    if (mesajKutusu) {
        mesajKutusu.classList.remove('d-none');
        mesajKutusu.className = `alert alert-${tip}`;
        mesajKutusu.innerHTML = `<i class="bi bi-${tip === 'success' ? 'check-circle' : tip === 'danger' ? 'exclamation-circle' : 'info-circle'}-fill me-2"></i>${mesaj}`;
        return;
    }

    // Mesaj kutusu yoksa main.js'teki global mesajGoster fonksiyonunu kullan
    if (window.mesajGoster) {
        window.mesajGoster(mesaj, tip);
        return;
    }

    // Son çare olarak kendi toast container'ımızı oluştur
    let toastContainer = document.querySelector('.toast-container');
    
    // Container yoksa oluştur
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
    
    // Toast'u göster
    try {
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
        alert(mesaj);
    }
}