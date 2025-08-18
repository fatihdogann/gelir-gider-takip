/**
 * Gelir-Gider Grafikleri Modülü
 * Bu dosya Chart.js kullanarak finansal verilerin görselleştirilmesi için grafikleri oluşturur
 */

// Ana grafik oluşturma fonksiyonu - diğer sayfalarda çağrılır
function grafiklerOlustur() {
    console.log("Grafikler oluşturuluyor...");
    
    // İşlemleri ve aktif kullanıcıyı al
    const islemler = JSON.parse(localStorage.getItem('islemler')) || [];
    const aktifKullanici = JSON.parse(localStorage.getItem('aktifKullanici'));
    
    if (!aktifKullanici) {
        console.error("Aktif kullanıcı bulunamadı");
        return;
    }
    
    // Sadece kullanıcının işlemlerini filtrele
    const kullaniciIslemleri = islemler.filter(islem => islem.kullanici === aktifKullanici.kullaniciAdi);
    
    // Aktif filtreler varsa, filtrele
    const filtreler = window.getAktifFiltreler ? window.getAktifFiltreler() : {};
    let filtrelenmisIslemler = [...kullaniciIslemleri];
    
    if (filtreler.tur) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => islem.tur === filtreler.tur);
    }
    
    if (filtreler.kategori) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => islem.kategori === filtreler.kategori);
    }
    
    if (filtreler.baslangicTarihi) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => islem.tarih >= filtreler.baslangicTarihi);
    }
    
    if (filtreler.bitisTarihi) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => islem.tarih <= filtreler.bitisTarihi);
    }
    
    if (filtreler.minMiktar !== null) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => parseFloat(islem.miktar) >= filtreler.minMiktar);
    }
    
    if (filtreler.maxMiktar !== null) {
        filtrelenmisIslemler = filtrelenmisIslemler.filter(islem => parseFloat(islem.miktar) <= filtreler.maxMiktar);
    }
    
    // Grafikleri oluştur
    createPieChart(filtrelenmisIslemler);
    createCategoryChart(filtrelenmisIslemler);
    createMonthlyTrendChart(filtrelenmisIslemler);
}

// Gelir-Gider Dağılımı (Pasta Grafiği)
function createPieChart(islemler) {
    const canvas = document.getElementById('gelirGiderGrafik');
    if (!canvas) return;
    
    // Canvas bağlamını al
    const ctx = canvas.getContext('2d');
    
    // Mevcut grafiği temizle
    if (window.gelirGiderChart) {
        window.gelirGiderChart.destroy();
    }
    
    // Gelir ve giderleri topla
    const gelirler = islemler.filter(islem => islem.tur === 'Gelir');
    const giderler = islemler.filter(islem => islem.tur === 'Gider');
    
    const gelirToplam = gelirler.reduce((toplam, islem) => toplam + parseFloat(islem.miktar), 0);
    const giderToplam = giderler.reduce((toplam, islem) => toplam + parseFloat(islem.miktar), 0);
    
    // Grafik verilerini oluştur
    const data = {
        labels: ['Gelir', 'Gider'],
        datasets: [{
            data: [gelirToplam, giderToplam],
            backgroundColor: ['#38b000', '#ff5a5f'],
            hoverBackgroundColor: ['#32a000', '#ef4e53'],
            borderWidth: 0,
            borderColor: '#fff',
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
        }]
    };
    
    // Grafik ayarları
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value.toLocaleString('tr-TR')} ₺`;
                    }
                }
            }
        },
        cutout: '50%',
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };
    
    // Grafiği oluştur
    window.gelirGiderChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });
    
    console.log("Gelir-Gider dağılımı grafiği oluşturuldu");
}

// Kategori Dağılımı (Çubuk Grafiği)
function createCategoryChart(islemler) {
    const canvas = document.getElementById('kategoriDagilimGrafik');
    if (!canvas) return;
    
    // Canvas bağlamını al
    const ctx = canvas.getContext('2d');
    
    // Mevcut grafiği temizle
    if (window.kategoriChart) {
        window.kategoriChart.destroy();
    }
    
    // Kategorilere göre giderleri grupla
    const giderler = islemler.filter(islem => islem.tur === 'Gider');
    const kategoriGruplari = {};
    
    giderler.forEach(islem => {
        if (!kategoriGruplari[islem.kategori]) {
            kategoriGruplari[islem.kategori] = 0;
        }
        kategoriGruplari[islem.kategori] += parseFloat(islem.miktar);
    });
    
    // Grafik verilerini oluştur
    const labels = Object.keys(kategoriGruplari);
    const values = Object.values(kategoriGruplari);
    
    // Rastgele renkler oluştur
    const backgroundColors = generateGradientColors(labels.length);
    
    const data = {
        labels: labels,
        datasets: [{
            label: 'Gider Miktarı (₺)',
            data: values,
            backgroundColor: backgroundColors,
            borderWidth: 0,
            borderRadius: 5,
            hoverBorderColor: '#fff',
            hoverBorderWidth: 2
        }]
    };
    
    // Grafik ayarları
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString('tr-TR') + ' ₺';
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value.toLocaleString('tr-TR')} ₺`;
                    }
                }
            }
        },
        animation: {
            animateScale: true
        }
    };
    
    // Grafiği oluştur
    window.kategoriChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: options
    });
    
    console.log("Kategori dağılımı grafiği oluşturuldu");
}

// Aylık Trend Grafiği (Çizgi Grafiği)
function createMonthlyTrendChart(islemler) {
    const canvas = document.getElementById('aylikTrendGrafik');
    if (!canvas) return;
    
    // Canvas bağlamını al
    const ctx = canvas.getContext('2d');
    
    // Mevcut grafiği temizle
    if (window.trendChart) {
        window.trendChart.destroy();
    }
    
    // Aylara göre gelir ve giderleri grupla
    const aylikVeriler = {};
    
    // Son 6 ay için veri oluştur
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const ayKey = date.toISOString().substr(0, 7); // YYYY-MM formatı
        const ayIsim = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
        
        aylikVeriler[ayKey] = {
            ayIsim,
            gelir: 0,
            gider: 0
        };
    }
    
    // İşlemleri aylara göre ekle
    islemler.forEach(islem => {
        const ayKey = islem.tarih.substr(0, 7); // YYYY-MM formatı
        
        if (aylikVeriler[ayKey]) {
            if (islem.tur === 'Gelir') {
                aylikVeriler[ayKey].gelir += parseFloat(islem.miktar);
            } else {
                aylikVeriler[ayKey].gider += parseFloat(islem.miktar);
            }
        }
    });
    
    // Grafik verilerini oluştur
    const labels = Object.values(aylikVeriler).map(veri => veri.ayIsim);
    const gelirData = Object.values(aylikVeriler).map(veri => veri.gelir);
    const giderData = Object.values(aylikVeriler).map(veri => veri.gider);
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Gelir',
                data: gelirData,
                borderColor: '#38b000',
                backgroundColor: 'rgba(56, 176, 0, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#38b000',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.2,
                fill: true
            },
            {
                label: 'Gider',
                data: giderData,
                borderColor: '#ff5a5f',
                backgroundColor: 'rgba(255, 90, 95, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#ff5a5f',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.2,
                fill: true
            }
        ]
    };
    
    // Grafik ayarları
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString('tr-TR') + ' ₺';
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value.toLocaleString('tr-TR')} ₺`;
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        animation: {
            duration: 1000
        }
    };
    
    // Grafiği oluştur
    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
    
    console.log("Aylık trend grafiği oluşturuldu");
}

// Yardımcı fonksiyon - Gradyan renkler oluştur
function generateGradientColors(count) {
    const baseColors = [
        '#3a86ff', // Mavi
        '#ff5a5f', // Kırmızı
        '#38b000', // Yeşil
        '#ff9e00', // Turuncu
        '#9d4edd', // Mor
        '#0077b6', // Koyu Mavi
        '#fb5607', // Turuncu-Kırmızı
        '#3f8efc', // Açık Mavi
        '#ff4d6d', // Pembe
        '#2b9348'  // Koyu Yeşil
    ];
    
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        const colorIndex = i % baseColors.length;
        colors.push(baseColors[colorIndex]);
    }
    
    return colors;
}

// Sayfa yüklenince window nesnesi üzerinden erişilebilir fonksiyonlar
window.grafiklerOlustur = grafiklerOlustur;