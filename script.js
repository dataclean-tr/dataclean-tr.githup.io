// script.js
// Twitter kullanıcı bilgilerini çekmek için temel JS kodu

// 1. Formu ve sonucu gösterecek alanı seçiyoruz
const form = document.getElementById('userForm');
const resultDiv = document.getElementById('result');

// 2. Form gönderildiğinde çalışacak fonksiyon
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  if (!username) return;
  resultDiv.innerHTML = 'Yükleniyor...';

  // Sadece kullanıcı bilgilerini getir
  let cleanUsername = username.replace(/^@/, '');
  const userInfoUrl = `https://twitter241.p.rapidapi.com/user?username=${cleanUsername}`;
  const userInfoOptions = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '44e5e6362dmsh30744b832a97a73p1db3b0jsn2a7dbdda0253',
      'x-rapidapi-host': 'twitter241.p.rapidapi.com'
    }
  };
  try {
    const userInfoRes = await fetch(userInfoUrl, userInfoOptions);
    let userInfo;
    try {
      userInfo = await userInfoRes.json();
    } catch (jsonErr) {
      resultDiv.innerHTML = `<span style="color:red;">API yanıtı JSON'a çevrilemedi.</span><pre>${await userInfoRes.text()}</pre>`;
      return;
    }
    // Sonucu düzenli ve görsel olarak ekrana yazdır
    // Yeni RapidAPI yanıt formatına göre kullanıcı bilgisi iç içe: result.data.user.result
    let u = userInfo?.result?.data?.user?.result;
    let legacy = u?.legacy;
    if (u && legacy && (u.core?.name || u.core?.screen_name)) {
      resultDiv.innerHTML = `
        <div style="border:1px solid #ddd;padding:16px;border-radius:8px;max-width:400px;margin:auto;text-align:center;">
          <img src="${u.avatar?.image_url || ''}" alt="Profil Fotoğrafı" style="border-radius:50%;width:96px;height:96px;"><br>
          <h2 style="margin:8px 0 4px 0;">${u.core?.name || ''}</h2>
          <div style="color:#555;">@${u.core?.screen_name || ''}</div>
          <p style="margin:8px 0;">${legacy.description || ''}</p>
          <div style="display:flex;justify-content:space-around;margin-top:12px;">
            <div><b>${legacy.followers_count ?? '-'}</b><br><span style="font-size:12px;">Takipçi</span></div>
            <div><b>${legacy.friends_count ?? '-'}</b><br><span style="font-size:12px;">Takip</span></div>
            <div><b>${legacy.statuses_count ?? '-'}</b><br><span style="font-size:12px;">Tweet</span></div>
          </div>
            <button id="showTweetsBtn" style="margin-top:16px;padding:8px 16px;cursor:pointer;">Tweetlerini Göster</button>
        </div>
      `;
        // Tweetleri göster butonuna tıklanınca tweetleri çek
        document.getElementById('showTweetsBtn').onclick = async function() {
          // Grid tabanlı paneli kullan
          const sidePanel = document.getElementById('tweetsSidePanel');
          const panelTitle = document.getElementById('tweetsPanelTitle');
          const panelContent = document.getElementById('tweetsPanelContent');
          if (!sidePanel || !panelTitle || !panelContent) return;
          sidePanel.classList.add('show');
          panelTitle.textContent = `@${u.core?.screen_name} Tweetleri`;
          panelContent.innerHTML = 'Tweetler yükleniyor...';
          // Kapatma butonu
          document.getElementById('closeTweetsSidePanel').onclick = () => {
            sidePanel.classList.remove('show');
            panelContent.innerHTML = '';
          };
          // Tweetleri çek
          const userId = u.rest_id;
          const tweetsUrl = `https://twitter241.p.rapidapi.com/user-tweets?user=${userId}&count=20`;
          const tweetsOptions = {
            method: 'GET',
            headers: {
              'x-rapidapi-key': '44e5e6362dmsh30744b832a97a73p1db3b0jsn2a7dbdda0253',
              'x-rapidapi-host': 'twitter241.p.rapidapi.com'
            }
          };
          try {
            const tweetsRes = await fetch(tweetsUrl, tweetsOptions);
            let tweetsData = await tweetsRes.json();
            let tweetList = [];
            const instructions = tweetsData?.result?.timeline?.instructions || [];
            instructions.forEach(inst => {
              if (inst.entries) {
                inst.entries.forEach(entry => {
                  const tweet = entry?.content?.itemContent?.tweet_results?.result?.legacy;
                  if (tweet && tweet.full_text) {
                    tweetList.push({
                      text: tweet.full_text,
                      date: tweet.created_at
                    });
                  }
                });
              }
            });
            if (tweetList.length > 0) {
              panelContent.innerHTML = '<div style="padding:0 0 16px 0;"><ul style="list-style:none;padding:0;margin:0;">' +
                tweetList.map(t => `
                  <li style="background:#f8f9fa;border-radius:8px;padding:14px 16px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                    <div style="font-size:13px;color:#888;margin-bottom:6px;">${t.date}</div>
                    <div style="font-size:16px;line-height:1.5;white-space:pre-line;">${t.text}</div>
                  </li>
                `).join('') +
                '</ul></div>';
            } else {
              panelContent.innerHTML = '<span style="color:red;">Tweet bulunamadı.</span>';
            }
          } catch (err) {
            panelContent.innerHTML = `<span style='color:red;'>Tweetler alınamadı: ${err.message}</span>`;
          }
        };
    } else {
      resultDiv.innerHTML = `<span style='color:red;'>Kullanıcı bilgisi bulunamadı veya API yanıtı beklenmedik formatta.</span><pre>${JSON.stringify(userInfo, null, 2)}</pre>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<span style=\"color:red;\">Hata: ${err.message}</span>`;
    return;
  }
});
// ...existing code...