/**
 * Gelir-Gider Takip Sistemi JavaScript Dosyası
 * Finansal işlemlerin kaydedilmesi, görüntülenmesi ve analiz edilmesinden sorumlu
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Gelir-Gider sayfası yüklendi");
    
    // Oturum kontrolü
    const aktifKullanici = aktifKullaniciKontrolEt();
    if (!aktifKullanici) return; // Kontrol fonksiyonu gerekli yönlendirmeyi yapacak
    
    // Tarihi bugün olarak ayarla
    const tarihInput = document.getElementById('tarih');
    if (tarihInput) {
        tarihInput.valueAsDate = new Date();
    }

    // Varsayılan kategori yüklemesi
    kategorileriYukle('Gelir');

    // Gelir-Gider formunu dinle
    const gelirGiderForm = document.getElementById('gelirGiderForm');
    if (gelirGiderForm) {
        gelirGiderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            if (gelirGiderForm.dataset.mode === 'edit') {
                guncelleIslem(parseInt(gelirGiderForm.dataset.index));
            } else {
                yeniIslemEkle();
            }
            
            // Sayfa kayma sorununu çöz - Form submit sonrası sayfayı üste kaydır
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 300);
        });
    }

    // Tür değiştiğinde kategori güncelle
    const turSelect = document.getElementById('tur');
    if (turSelect) {
        turSelect.addEventListener('change', function () {
            kategorileriYukle(this.value);
        });
    }

    // İşlemleri ve grafikleri yükle
    islemleriGoster();
    ozetsayaclariniGuncelle();
    sonIslemleriGoster();
    
    // Grafikleri oluştur - biraz bekletelim DOM tamamen yüklensin
    setTimeout(() => {
        try {
            grafiklerOlustur(); // Bu fonksiyon gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler yüklenemedi:", error);
        }
    }, 500);
    
    // Sayfa kayma sorununu düzelt
    duzelSayfaKaydirmaSorunu();
});

// === Oturum Kontrolü ===
function aktifKullaniciKontrolEt() {
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) {
        mesajGoster('Lütfen giriş yapınız.', 'warning');
        setTimeout(() => {
            window.location.href = 'giris.html';
        }, 2000);
        return null;
    }
    
    return aktifKullanici;
}

// === Sayfa Kaydırma Sorunu Düzeltme ===
function duzelSayfaKaydirmaSorunu() {
    // İşlem eklendikten sonra sayfayı üste kaydırma sorununu düzelten ek fonksiyon
    const gelirGiderForm = document.getElementById('gelirGiderForm');
    
    if (gelirGiderForm) {
        // Mevcut bir submit olay dinleyicisi varsa koru
        const originalSubmit = gelirGiderForm.onsubmit;
        
        gelirGiderForm.onsubmit = function(e) {
            // Form submit işlemini çalıştır
            if (originalSubmit) {
                originalSubmit.call(this, e);
            }
            
            // Sayfa üstüne kaydır (form submit sonrası)
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 300);
        };
    }
}

// === Özet Sayaçları ===
function ozetsayaclariniGuncelle() {
    console.log("Özet sayaçları güncelleniyor...");
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) {
        console.log("Aktif kullanıcı bulunamadı, sayaçlar güncellenemedi");
        return;
    }
    
    // Sadece aktif kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    console.log("Kullanıcının işlemleri:", kullaniciIslemleri);
    
    // Gelir ve giderleri ayır
    const gelirler = kullaniciIslemleri.filter(islem => islem.tur === 'Gelir');
    const giderler = kullaniciIslemleri.filter(islem => islem.tur === 'Gider');
    
    console.log("Gelirler:", gelirler);
    console.log("Giderler:", giderler);
    
    // Toplamları hesapla
    const toplamGelir = gelirler.reduce((toplam, islem) => toplam + parseFloat(islem.miktar), 0);
    const toplamGider = giderler.reduce((toplam, islem) => toplam + parseFloat(islem.miktar), 0);
    const bakiye = toplamGelir - toplamGider;
    
    console.log("Toplam Gelir:", toplamGelir);
    console.log("Toplam Gider:", toplamGider);
    console.log("Bakiye:", bakiye);
    
    // DOM'u güncelle
    const toplamGelirElement = document.getElementById('toplamGelir');
    const toplamGiderElement = document.getElementById('toplamGider');
    const mevcutBakiyeElement = document.getElementById('mevcutBakiye');
    const bakiyeDurumuElement = document.getElementById('bakiyeDurumu');
    
    if (toplamGelirElement) {
        toplamGelirElement.textContent = toplamGelir.toLocaleString('tr-TR') + ' ₺';
        console.log("Toplam gelir güncellendi:", toplamGelirElement.textContent);
    }
    
    if (toplamGiderElement) {
        toplamGiderElement.textContent = toplamGider.toLocaleString('tr-TR') + ' ₺';
        console.log("Toplam gider güncellendi:", toplamGiderElement.textContent);
    }
    
    if (mevcutBakiyeElement) {
        mevcutBakiyeElement.textContent = bakiye.toLocaleString('tr-TR') + ' ₺';
        console.log("Mevcut bakiye güncellendi:", mevcutBakiyeElement.textContent);
        
        // Bakiye durum bilgisi ve rengi
        if (bakiyeDurumuElement) {
            if (bakiye > 0) {
                bakiyeDurumuElement.textContent = 'Pozitif';
                bakiyeDurumuElement.className = 'badge bg-success';
            } else if (bakiye < 0) {
                bakiyeDurumuElement.textContent = 'Negatif';
                bakiyeDurumuElement.className = 'badge bg-danger';
            } else {
                bakiyeDurumuElement.textContent = 'Nötr';
                bakiyeDurumuElement.className = 'badge bg-secondary';
            }
            console.log("Bakiye durumu güncellendi:", bakiyeDurumuElement.textContent);
        }
    }
    
    // Progress barları güncelle
    updateProgressBars(toplamGelir, toplamGider);
}

// Progress barları güncelle
function updateProgressBars(toplamGelir, toplamGider) {
    const gelirProgressBar = document.querySelector('.income-card .progress-bar');
    const giderProgressBar = document.querySelector('.expense-card .progress-bar');
    
    if (gelirProgressBar && giderProgressBar) {
        const toplam = toplamGelir + toplamGider;
        
        if (toplam > 0) {
            const gelirYuzde = (toplamGelir / toplam) * 100;
            const giderYuzde = (toplamGider / toplam) * 100;
            
            gelirProgressBar.style.width = gelirYuzde + '%';
            giderProgressBar.style.width = giderYuzde + '%';
        } else {
            gelirProgressBar.style.width = '0%';
            giderProgressBar.style.width = '0%';
        }
    }
}

// === Kategorileri Yükle ===
function kategorileriYukle(tur) {
    console.log("Kategoriler yükleniyor: ", tur);
    const kategoriSelect = document.getElementById('kategori');
    const filtreKategoriSelect = document.getElementById('filtreKategori');
    
    if (kategoriSelect) {
        kategoriSelect.innerHTML = ''; // Var olan seçenekleri temizle
        
        const secenekler = tur === 'Gelir'
            ? ['Maaş', 'Yatırım', 'Ek Gelir', 'Hediye', 'Diğer Gelirler']
            : ['Gıda', 'Fatura', 'Ulaşım', 'Eğlence', 'Kira', 'Sağlık', 'Eğitim', 'Alışveriş', 'Diğer Giderler'];
        
        secenekler.forEach(sec => {
            const option = document.createElement('option');
            option.value = sec;
            option.textContent = sec;
            kategoriSelect.appendChild(option);
        });
    }
    
    // Filtre kategorilerini de doldur (eğer modal açıksa)
    if (filtreKategoriSelect) {
        // Mevcut seçili değeri koru
        const secilenDeger = filtreKategoriSelect.value;
        
        // Kategori seçeneklerini temizle, "Tümü" seçeneğini tut
        while (filtreKategoriSelect.options.length > 1) {
            filtreKategoriSelect.remove(1);
        }
        
        // Tüm kategorileri ekle
        const tumKategoriler = [
            'Maaş', 'Yatırım', 'Ek Gelir', 'Hediye', 'Diğer Gelirler',
            'Gıda', 'Fatura', 'Ulaşım', 'Eğlence', 'Kira', 'Sağlık', 'Eğitim', 'Alışveriş', 'Diğer Giderler'
        ];
        
        tumKategoriler.forEach(kategori => {
            const option = document.createElement('option');
            option.value = kategori;
            option.textContent = kategori;
            filtreKategoriSelect.appendChild(option);
        });
        
        // Eğer önceden bir değer seçiliyse ve hala listede varsa, onu tekrar seç
        if (secilenDeger && [...filtreKategoriSelect.options].some(opt => opt.value === secilenDeger)) {
            filtreKategoriSelect.value = secilenDeger;
        }
    }
}

// === Yeni İşlem Ekle ===
function yeniIslemEkle() {
    const tarih = document.getElementById('tarih').value;
    const kategori = document.getElementById('kategori').value;
    const miktar = parseFloat(document.getElementById('miktar').value);
    const tur = document.getElementById('tur').value;
    const aciklama = document.getElementById('aciklama') ? document.getElementById('aciklama').value : '';

    if (!tarih || !kategori || isNaN(miktar) || miktar <= 0) {
        mesajGoster('Lütfen tüm alanları doldurun ve geçerli bir miktar girin.', 'danger');
        return;
    }

    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    if (!aktifKullanici) {
        mesajGoster('Oturum açık değil. Lütfen giriş yapın.', 'danger');
        return;
    }

    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const yeniIslem = {
        id: Date.now(), // Benzersiz ID
        tarih,
        kategori,
        miktar,
        tur,
        aciklama,
        kullanici: aktifKullanici.kullaniciAdi,
        eklemeTarihi: new Date().toISOString()
    };

    islemler.push(yeniIslem);
    localStorage.setItem('islemler', JSON.stringify(islemler));
    
    console.log("Yeni işlem eklendi:", yeniIslem);
    console.log("Tüm işlemler:", islemler);

    mesajGoster('İşlem başarıyla eklendi.', 'success');
    
    // Formu sıfırla
    document.getElementById('gelirGiderForm').reset();
    document.getElementById('gelirGiderForm').dataset.mode = 'add';
    document.getElementById('formBaslik').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Gelir/Gider Ekle';
    document.querySelector('#gelirGiderForm button').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Ekle';
    
    // Tarihi bugün olarak ayarla
    document.getElementById('tarih').valueAsDate = new Date();
    
    // Kategoriyi tekrar yükle
    kategorileriYukle(document.getElementById('tur').value);
    
    // Tabloyu, grafikleri ve özet bilgileri güncelle
    islemleriGoster();
    ozetsayaclariniGuncelle();
    sonIslemleriGoster();
    
    // Grafikleri güncelle
    setTimeout(() => {
        try {
            grafiklerOlustur(); // Bu fonksiyon gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler güncellenemedi:", error);
        }
    }, 300);
    
    // Sayfa üstüne kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === Son İşlemleri Göster ===
function sonIslemleriGoster() {
    const sonIslemlerListesi = document.getElementById('sonIslemlerListesi');
    if (!sonIslemlerListesi) return;
    
    sonIslemlerListesi.innerHTML = '';
    
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) return;
    
    // Sadece aktif kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    // Tarihe göre sırala (en yeni en üstte)
    kullaniciIslemleri.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    
    // Son 5 işlemi al
    const sonIslemler = kullaniciIslemleri.slice(0, 5);
    
    if (sonIslemler.length === 0) {
        const liElement = document.createElement('li');
        liElement.className = 'list-group-item text-center p-3 text-muted';
        liElement.innerHTML = '<i class="bi bi-info-circle me-1"></i> Henüz işlem bulunmamaktadır.';
        sonIslemlerListesi.appendChild(liElement);
        return;
    }
    
    sonIslemler.forEach(islem => {
        const liElement = document.createElement('li');
        liElement.className = 'list-group-item';
        
        // İşlem tarihini formatlı göster
        const islemTarihi = new Date(islem.tarih);
        const formatliTarih = islemTarihi.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Tür için renk sınıfı
        const turRenk = islem.tur === 'Gelir' ? 'text-success' : 'text-danger';
        const turIcon = islem.tur === 'Gelir' ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill';
        
        liElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${islem.kategori}</div>
                    <small class="text-muted">${formatliTarih}</small>
                </div>
                <div class="d-flex align-items-center">
                    <span class="me-2 ${turRenk}">
                        <i class="bi ${turIcon} me-1"></i>
                        ${parseFloat(islem.miktar).toLocaleString('tr-TR')} ₺
                    </span>
                </div>
            </div>
        `;
        
        sonIslemlerListesi.appendChild(liElement);
    });
}

// === İşlemleri Göster (TABLO) ===
function islemleriGoster() {
    const gelirGiderTablosu = document.getElementById('gelirGiderTablosu');
    if (!gelirGiderTablosu) return;
    
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) return;
    
    // Aktif filtreler
    const filtreler = getAktifFiltreler();
    
    // Sadece aktif kullanıcının işlemlerini filtrele
    let kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    // Filtreleri uygula
    if (filtreler.tur) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => islem.tur === filtreler.tur);
    }
    
    if (filtreler.kategori) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => islem.kategori === filtreler.kategori);
    }
    
    if (filtreler.baslangicTarihi) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => islem.tarih >= filtreler.baslangicTarihi);
    }
    
    if (filtreler.bitisTarihi) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => islem.tarih <= filtreler.bitisTarihi);
    }
    
    if (filtreler.minMiktar !== null) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => parseFloat(islem.miktar) >= filtreler.minMiktar);
    }
    
    if (filtreler.maxMiktar !== null) {
        kullaniciIslemleri = kullaniciIslemleri.filter(islem => parseFloat(islem.miktar) <= filtreler.maxMiktar);
    }
    
    // Sıralama
    const siralama = getSiralama();
    if (siralama.alan === 'tarih') {
        kullaniciIslemleri.sort((a, b) => {
            const tarihA = new Date(a.tarih);
            const tarihB = new Date(b.tarih);
            return siralama.yon === 'artan' ? tarihA - tarihB : tarihB - tarihA;
        });
    } else if (siralama.alan === 'miktar') {
        kullaniciIslemleri.sort((a, b) => {
            return siralama.yon === 'artan' 
                ? parseFloat(a.miktar) - parseFloat(b.miktar) 
                : parseFloat(b.miktar) - parseFloat(a.miktar);
        });
    }
    
    // Tabloyu temizle
    gelirGiderTablosu.innerHTML = '';
    
    // İşlem yoksa bilgi mesajı göster
    if (kullaniciIslemleri.length === 0) {
        gelirGiderTablosu.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-3 text-muted">
                    <i class="bi bi-info-circle me-1"></i> Gösterilecek işlem bulunamadı.
                </td>
            </tr>
        `;
        return;
    }
    
    // İşlemleri tabloya ekle
    kullaniciIslemleri.forEach((islem, index) => {
        const row = document.createElement('tr');
        
        // İşlem tarihini formatlı göster
        const islemTarihi = new Date(islem.tarih);
        const formatliTarih = islemTarihi.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Tür için renk sınıfı ve simge
        const turRenk = islem.tur === 'Gelir' ? 'success' : 'danger';
        const turIcon = islem.tur === 'Gelir' ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill';
        
        row.innerHTML = `
            <td>${formatliTarih}</td>
            <td>${islem.kategori}</td>
            <td class="text-${turRenk}">
                <i class="bi ${turIcon} me-1"></i>
                ${parseFloat(islem.miktar).toLocaleString('tr-TR')} ₺
            </td>
            <td>
                <span class="badge bg-${turRenk}">${islem.tur}</span>
            </td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="duzenleIslem(${index})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="silIslem(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        gelirGiderTablosu.appendChild(row);
    });
}

// === İşlem Düzenleme ===
function duzenleIslem(index) {
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) return;
    
    // Kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    if (!kullaniciIslemleri[index]) {
        mesajGoster('İşlem bulunamadı.', 'danger');
        return;
    }
    
    const islem = kullaniciIslemleri[index];
    
    // Form elemanlarını al
    const tarihInput = document.getElementById('tarih');
    const turSelect = document.getElementById('tur');
    const miktarInput = document.getElementById('miktar');
    const aciklamaInput = document.getElementById('aciklama');
    const form = document.getElementById('gelirGiderForm');
    const formBaslik = document.getElementById('formBaslik');
    const formButton = form.querySelector('button[type="submit"]');
    
    // Form elemanlarını doldur
    tarihInput.value = islem.tarih;
    turSelect.value = islem.tur;
    
    // Kategori seçeneklerini güncelle ve sonra kategoriyi seç
    kategorileriYukle(islem.tur);
    setTimeout(() => {
        document.getElementById('kategori').value = islem.kategori;
    }, 100);
    
    miktarInput.value = islem.miktar;
    if (aciklamaInput) aciklamaInput.value = islem.aciklama || '';
    
    form.dataset.mode = 'edit';
    form.dataset.index = index;
    formBaslik.innerHTML = '<i class="bi bi-pencil-square me-2"></i>İşlem Düzenle';
    formButton.innerHTML = '<i class="bi bi-check-circle me-1"></i> Güncelle';
    
}

// === İşlem Silme ===
function silIslem(index) {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
        return;
    }
    
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) return;
    
    // Kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    if (!kullaniciIslemleri[index]) {
        mesajGoster('İşlem bulunamadı.', 'danger');
        return;
    }
    
    // Silinecek işlemin ID'sini bul
    const silinecekID = kullaniciIslemleri[index].id;
    
    // İşlemi tüm işlemler listesinden kaldır
    const yeniIslemler = islemler.filter(islem => islem.id !== silinecekID);
    
    // Güncellenmiş listeyi kaydet
    localStorage.setItem('islemler', JSON.stringify(yeniIslemler));
    
    mesajGoster('İşlem başarıyla silindi.', 'success');
    
    // Tabloyu ve grafikleri güncelle
    islemleriGoster();
    ozetsayaclariniGuncelle();
    sonIslemleriGoster();
    
    // Grafikleri güncelle
    setTimeout(() => {
        try {
            grafiklerOlustur(); // gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler güncellenemedi:", error);
        }
    }, 300);
}

// === İşlem Güncelleme ===
function guncelleIslem(index) {
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) return;
    
    // Form verilerini al
    const tarih = document.getElementById('tarih').value;
    const kategori = document.getElementById('kategori').value;
    const miktar = parseFloat(document.getElementById('miktar').value);
    const tur = document.getElementById('tur').value;
    const aciklama = document.getElementById('aciklama') ? document.getElementById('aciklama').value : '';
    
    // Form doğrulama
    if (!tarih || !kategori || isNaN(miktar) || miktar <= 0) {
        mesajGoster('Lütfen tüm alanları doldurun ve geçerli bir miktar girin.', 'danger');
        return;
    }
    
    // Kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    if (!kullaniciIslemleri[index]) {
        mesajGoster('İşlem bulunamadı.', 'danger');
        return;
    }
    
    // Güncellenecek işlemin ID'sini bul
    const islemID = kullaniciIslemleri[index].id;
    
    // İşlem indeksini bul
    const tumIslemlerIndeksi = islemler.findIndex(islem => islem.id === islemID);
    
    if (tumIslemlerIndeksi === -1) {
        mesajGoster('İşlem bulunamadı.', 'danger');
        return;
    }
    
    // İşlemi güncelle
    islemler[tumIslemlerIndeksi] = {
        ...islemler[tumIslemlerIndeksi],
        tarih,
        kategori,
        miktar,
        tur,
        aciklama,
        guncellenmeTarihi: new Date().toISOString()
    };
    
    // Güncellenmiş listeyi kaydet
    localStorage.setItem('islemler', JSON.stringify(islemler));
    
    mesajGoster('İşlem başarıyla güncellendi.', 'success');
    
    // Formu sıfırla
    const form = document.getElementById('gelirGiderForm');
    form.reset();
    form.dataset.mode = 'add';
    
    // Başlık ve butonu güncelle
    document.getElementById('formBaslik').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Gelir/Gider Ekle';
    form.querySelector('button[type="submit"]').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Ekle';
    
    // Tarihi bugün olarak ayarla
    document.getElementById('tarih').valueAsDate = new Date();
    
    // Tabloyu ve grafikleri güncelle
    islemleriGoster();
    ozetsayaclariniGuncelle();
    sonIslemleriGoster();
    
    // Grafikleri güncelle
    setTimeout(() => {
        try {
            grafiklerOlustur(); // gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler güncellenemedi:", error);
        }
    }, 300);
}

// === Filtre ve Sıralama Fonksiyonları ===
function getAktifFiltreler() {
    // Kullanıcı arayüzündeki filtreleri al
    return {
        tur: document.getElementById('filtreTur') ? document.getElementById('filtreTur').value : null,
        kategori: document.getElementById('filtreKategori') ? document.getElementById('filtreKategori').value : null,
        baslangicTarihi: document.getElementById('tarihBaslangic') ? document.getElementById('tarihBaslangic').value : null,
        bitisTarihi: document.getElementById('tarihBitis') ? document.getElementById('tarihBitis').value : null,
        minMiktar: document.getElementById('minMiktar') && document.getElementById('minMiktar').value ? parseFloat(document.getElementById('minMiktar').value) : null,
        maxMiktar: document.getElementById('maxMiktar') && document.getElementById('maxMiktar').value ? parseFloat(document.getElementById('maxMiktar').value) : null
    };
}

function getSiralama() {
    // Varsayılan sıralama (tarih, azalan)
    return {
        alan: 'tarih',
        yon: 'azalan'
    };
}

// === İşlemleri Filtrele ===
function islemleriFiltrele() {
    console.log("İşlemler filtreleniyor");
    islemleriGoster();
    // Modal'ı kapat
    const filtreleModal = document.getElementById('filtreleModal');
    if (filtreleModal) {
        const bootstrapModal = bootstrap.Modal.getInstance(filtreleModal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    }
    
    // Grafikleri güncelle
    setTimeout(() => {
        try {
            grafiklerOlustur(); // gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler güncellenemedi:", error);
        }
    }, 300);
    
    mesajGoster('Filtreleme işlemi uygulandı.', 'success');
}

// === Filtreleri Sıfırla ===
function filtreleriSifirla() {
    console.log("Filtreler sıfırlanıyor");
    // Tarih filtrelerini sıfırla
    if (document.getElementById('tarihBaslangic')) document.getElementById('tarihBaslangic').value = '';
    if (document.getElementById('tarihBitis')) document.getElementById('tarihBitis').value = '';
    
    // Tür ve kategori filtrelerini sıfırla
    if (document.getElementById('filtreTur')) document.getElementById('filtreTur').value = '';
    if (document.getElementById('filtreKategori')) document.getElementById('filtreKategori').value = '';
    
    // Miktar filtrelerini sıfırla
    if (document.getElementById('minMiktar')) document.getElementById('minMiktar').value = '';
    if (document.getElementById('maxMiktar')) document.getElementById('maxMiktar').value = '';
    
    // Tabloyu yeniden yükle
    islemleriGoster();
    
    // Grafikleri güncelle
    setTimeout(() => {
        try {
            grafiklerOlustur(); // gelir-gider-grafik.js dosyasında
        } catch (error) {
            console.error("Grafikler güncellenemedi:", error);
        }
    }, 300);
    
    mesajGoster('Filtreler sıfırlandı.', 'info');
}

// === PDF ve Excel Dışa Aktarma ===
function islemleriPDFOlarakDisa() {
    mesajGoster('PDF dışa aktarma özelliği hazırlanıyor...', 'info');
    
    // PDF indirme simülasyonu
    setTimeout(() => {
        const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
        if (!aktifKullanici) {
            mesajGoster('Oturum açık değil. Lütfen giriş yapın.', 'danger');
            return;
        }
        
        const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        const dosyaAdi = `gelir-gider-raporu-${tarih}.pdf`;
        
        mesajGoster(`"${dosyaAdi}" dosyası indiriliyor... (Bu bir simülasyondur, gerçekte dosya indirilmeyecek)`, 'success');
    }, 1500);
}

function islemleriExcelOlarakDisa() {
    mesajGoster('Excel dışa aktarma özelliği hazırlanıyor...', 'info');
    
    // Excel indirme simülasyonu
    setTimeout(() => {
        const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
        if (!aktifKullanici) {
            mesajGoster('Oturum açık değil. Lütfen giriş yapın.', 'danger');
            return;
        }
        
        const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        const dosyaAdi = `gelir-gider-raporu-${tarih}.xlsx`;
        
        mesajGoster(`"${dosyaAdi}" dosyası indiriliyor... (Bu bir simülasyondur, gerçekte dosya indirilmeyecek)`, 'success');
    }, 1500);
}