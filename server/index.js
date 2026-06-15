const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 讓後端負責提供前端打包好的靜態檔案
app.use(express.static(path.join(__dirname, '../client/dist')));

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('資料庫連接失敗:', err.message);
    } else {
        console.log('成功連接 SQLite 資料庫');
    }
});

db.serialize(() => {
    // 強制把舊的表格刪除
    db.run(`DROP TABLE IF EXISTS programs`);

    // 建立全新的表格
    db.run(`CREATE TABLE programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region TEXT,
        country TEXT,
        university TEXT,
        quota INTEGER,
        language_req TEXT,
        description TEXT,
        image_url TEXT,
        alumni_sharing TEXT
    )`);

    const stmt = db.prepare(`INSERT INTO programs 
        (region, country, university, quota, language_req, description, image_url, alumni_sharing) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
    // 1. 日本 - 關西大學
    stmt.run(
        "亞洲", "日本", "關西大學", 2, "JLPT N2", 
        "位於大阪的著名私立大學，文化氣息濃厚，提供完善的留學生輔導機制。",
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=85",
        "「國際處的老師非常照顧留學生，還有安排學伴制度。課餘時間可以去京都、奈良走走，生活機能滿分，日語口說進步超多！」"
    );
    // 2. 德國 - 慕尼黑工業大學
    stmt.run(
        "歐洲", "德國", "慕尼黑工業大學", 3, "IELTS 6.5 / 德檢B2", 
        "歐洲頂尖理工學府，理工科系學生的夢幻殿堂，課業挑戰度高。",
        "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=85",
        "「歐洲的理工科神殿！這裡非常看重實作與邏輯推演。建議德文要有一點基礎，這對未來想在歐洲科技業發展是非常好的跳板。」"
    );
    // 3. 韓國 - 成均館大學
    stmt.run(
        "亞洲", "韓國", "成均館大學", 2, "TOPIK 4 或 IELTS 6.0", 
        "擁有六百年歷史的傳統名校，商科與資訊領域實力強勁，校園融合古典與現代。",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=85",
        "「學校就在首爾市區，交通超方便！選課系統對交換生很友善，而且學校的校慶活動辦得跟演唱會一樣精彩，大推！」"
    );
    // 4. 美國 - 聖荷西州立大學
    stmt.run(
        "美洲", "美國", "聖荷西州立大學", 2, "TOEFL 80 / IELTS 6.5", 
        "位處加州矽谷心臟地帶，是全美就業率極高的公立大學，科技與創新氛圍濃厚。",
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=85",
        "「課業很重但超級充實，因為在矽谷旁邊，有很多參加科技聚會的機會！周圍有很多科技公司的總部，是可以大開眼界的地方。」"
    );
    // 5. 英國 - 諾丁漢特倫特大學
    stmt.run(
        "歐洲", "英國", "諾丁漢特倫特大學", 3, "IELTS 6.0", 
        "以設計、商科及實務教學聞名的英國現代大學，曾獲選年度最佳大學。",
        "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=85",
        "「學校的硬體設備非常新穎，老師很鼓勵學生在課堂上發表意見。諾丁漢是個很適合學生的城市，物價在英國算親民的。」"
    );
    // 6. 澳洲 - 新南威爾斯大學
    stmt.run(
        "大洋洲", "澳洲", "新南威爾斯大學", 2, "IELTS 6.5", 
        "澳洲八大名校之一，理工與商學皆為世界頂尖，緊鄰雪梨市中心。",
        "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=85",
        "「校園離海邊很近，下課後去衝浪不是夢！學習風氣很自由但要求嚴格，能跟來自世界各地的神人一起做報告，收穫極大。」"
    );
    // 7. 法國 - 雷恩商學院
    stmt.run(
        "歐洲", "法國", "雷恩商學院", 4, "IELTS 6.0 / TOEIC 750", 
        "高度國際化的法國精英商學院，全英語授課環境，適合商管學院學生。",
        "https://images.unsplash.com/photo-1502602898657-3e9076013054?auto=format&fit=crop&w=800&q=85",
        "「超過一半的學生是國際生，不用擔心法文不好！課程有很多小組個案討論，放假時搭火車去巴黎或歐洲其他國家旅遊非常方便。」"
    );
    // 8. 美國 - 天普大學
    stmt.run(
        "美洲", "美國", "天普大學", 2, "TOEFL 79 / IELTS 6.0", 
        "位於賓州費城的大型綜合性研究型大學，提供豐富的跨領域課程。",
        "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=85",
        "「費城是個很有歷史感的城市！學校圖書館資源極度豐富，治安要注意一下，但整體來說是體驗純正美式大學生活的好選擇。」"
    );

    stmt.finalize();
});

// API 路由：吐出資料庫的資料
app.get('/api/programs', (req, res) => {
    db.all("SELECT * FROM programs", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


// 萬用路由：確保前端 SPA 畫面不會因為找不到網址而出現 Cannot GET
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 啟動伺服器 (整個檔案只需要這一個！)
app.listen(port, () => {
    console.log(`後端伺服器已升級並啟動：http://localhost:${port}`);
});