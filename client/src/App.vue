<script setup>
import { ref, onMounted, computed } from 'vue';

const programs = ref([]);
const searchQuery = ref('');

// === 導覽狀態管理 (這就是妳要的層層遞進功能) ===
const step = ref('region'); // 目前在哪一層：'region'(地區), 'country'(國家), 'school'(學校清單), 'detail'(學校詳細), 'search'(搜尋結果)
const selectedRegion = ref('');
const selectedCountry = ref('');
const selectedSchool = ref(null);

// 網頁載入時抓資料
onMounted(async () => {
  try {
    const response = await fetch('/api/programs');
    programs.value = await response.json();
  } catch (error) {
    console.error('抓取資料失敗:', error);
  }
});

// === 資料過濾邏輯 ===
// 1. 抓出所有不重複的「地區」
const uniqueRegions = computed(() => {
  return [...new Set(programs.value.map(p => p.region))];
});

// 2. 抓出該地區下，所有不重複的「國家」
const countriesInRegion = computed(() => {
  const filtered = programs.value.filter(p => p.region === selectedRegion.value);
  return [...new Set(filtered.map(p => p.country))];
});

// 3. 抓出該國家下的「所有學校」
const schoolsInCountry = computed(() => {
  return programs.value.filter(p => p.country === selectedCountry.value);
});

// 4. 搜尋結果過濾
const searchResults = computed(() => {
  if (!searchQuery.value) return [];
  return programs.value.filter(p => 
    p.university.includes(searchQuery.value) || 
    p.country.includes(searchQuery.value)
  );
});

// === 動作函式 ===
function handleSearch() {
  if (searchQuery.value.trim() !== '') {
    step.value = 'search';
  } else {
    goHome();
  }
}

function goToCountryLevel(region) {
  selectedRegion.value = region;
  step.value = 'country';
}

function goToSchoolLevel(country) {
  selectedCountry.value = country;
  step.value = 'school';
}

function goToDetailLevel(school) {
  selectedSchool.value = school;
  step.value = 'detail';
}

function goHome() {
  step.value = 'region';
  selectedRegion.value = '';
  selectedCountry.value = '';
  selectedSchool.value = null;
  searchQuery.value = '';
}

function goBack() {
  if (step.value === 'detail') step.value = 'school';
  else if (step.value === 'school') step.value = 'country';
  else if (step.value === 'country') step.value = 'region';
  else if (step.value === 'search') goHome();
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="logo" @click="goHome">✈️ FCU Exchange</div>
      <div class="search-mini">
        <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="快速搜尋學校或國家..." />
      </div>
    </nav>

    <main class="main-content">
      
      <div class="breadcrumb" v-if="step !== 'region' && step !== 'search'">
        <button class="back-btn" @click="goBack">← 返回上一層</button>
        <span class="path">
          <span @click="goHome" class="clickable">🌍 世界</span> 
          <span v-if="selectedRegion"> > <span @click="step='country'" class="clickable">{{ selectedRegion }}</span></span>
          <span v-if="selectedCountry && step !== 'country'"> > <span @click="step='school'" class="clickable">{{ selectedCountry }}</span></span>
        </span>
      </div>

      <div class="breadcrumb" v-if="step === 'search'">
        <button class="back-btn" @click="goHome">← 取消搜尋</button>
        <span class="path">🔍 搜尋結果：{{ searchQuery }}</span>
      </div>

      <div v-if="step === 'region'" class="level-container">
        <h1 class="page-title">探索你的下一趟旅程</h1>
        <p class="page-subtitle">請選擇你想前往的洲際地區</p>
        <div class="tile-grid">
          <div class="tile" v-for="region in uniqueRegions" :key="region" @click="goToCountryLevel(region)">
            <h2>{{ region }}</h2>
            <div class="tile-overlay"></div>
          </div>
        </div>
      </div>

      <div v-if="step === 'country'" class="level-container">
        <h1 class="page-title">選擇前往的國家</h1>
        <div class="tile-grid">
          <div class="tile country-tile" v-for="country in countriesInRegion" :key="country" @click="goToSchoolLevel(country)">
            <h2>📍 {{ country }}</h2>
          </div>
        </div>
      </div>

      <div v-if="step === 'school' || step === 'search'" class="level-container">
        <h1 class="page-title" v-if="step === 'school'">{{ selectedCountry }} 的合作學校</h1>
        <div class="cards-grid">
          <div class="card" v-for="item in (step === 'search' ? searchResults : schoolsInCountry)" :key="item.id" @click="goToDetailLevel(item)">
            <div class="card-image" :style="{ backgroundImage: `url(${item.image_url})` }">
              <span class="badge">{{ item.country }}</span>
            </div>
            <div class="card-body">
              <h3>{{ item.university }}</h3>
              <p class="desc-preview">{{ item.description }}</p>
              <span class="read-more">查看詳情 ➔</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="step === 'detail' && selectedSchool" class="detail-view">
        <div class="detail-hero" :style="{ backgroundImage: `url(${selectedSchool.image_url})` }">
          <div class="hero-overlay">
            <h1>{{ selectedSchool.university }}</h1>
            <p>{{ selectedSchool.country }} | {{ selectedSchool.region }}</p>
          </div>
        </div>
        
        <div class="detail-content">
          <div class="stats-box">
            <div class="stat-item">
              <span class="icon">👥</span>
              <div class="text">
                <span class="label">開放名額</span>
                <span class="value">{{ selectedSchool.quota }} 人</span>
              </div>
            </div>
            <div class="stat-item">
              <span class="icon">🗣️</span>
              <div class="text">
                <span class="label">語言門檻</span>
                <span class="value">{{ selectedSchool.language_req }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>🏫 學校簡介</h3>
            <p>{{ selectedSchool.description }}</p>
          </div>

          <div class="info-section alumni-section">
            <h3>🎓 學長姊真實心得</h3>
            <div class="quote-box">
              <p>"{{ selectedSchool.alumni_sharing }}"</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<style>
/* --- 酒紅與玫瑰金 Dark Coquette 主題 --- */
:root {
  --bg-dark: #121013;       
  --bg-card: #1c191e;       
  --text-main: #efe7eb;     
  --text-muted: #a3939b;    
  --accent: #b23a48;        
  --accent-hover: #8c2131;  
  --accent-gold: #e5b3bb;   
}

body {
  margin: 0;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
}

.app-container { min-height: 100vh; display: flex; flex-direction: column; }

/* 頂部列 */
.navbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 40px; background-color: rgba(18, 16, 19, 0.95);
  border-bottom: 1px solid #362f36; position: sticky; top: 0; z-index: 100;
}
.logo { font-size: 1.5rem; font-weight: 900; color: var(--accent-gold); cursor: pointer; }
.search-mini input {
  padding: 10px 15px; border-radius: 20px; border: 1px solid #362f36;
  background-color: var(--bg-card); color: var(--text-main); width: 250px; outline: none;
}

/* 主內容區 */
.main-content { padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }

/* 麵包屑導覽 */
.breadcrumb { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #362f36; }
.back-btn { background: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; }
.back-btn:hover { background: var(--accent-gold); color: var(--bg-dark); }
.path { color: var(--text-muted); font-size: 1.1rem; }
.clickable { color: var(--text-main); cursor: pointer; transition: color 0.2s; }
.clickable:hover { color: var(--accent-gold); text-decoration: underline; }

/* 標題 */
.page-title { font-size: 2.5rem; text-align: center; margin-bottom: 10px; color: var(--text-main); }
.page-subtitle { text-align: center; color: var(--text-muted); margin-bottom: 40px; font-size: 1.1rem; }

/* 大方塊 (地區與國家) */
.tile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.tile {
  background: linear-gradient(135deg, #2b171d 0%, #1c191e 100%);
  border: 1px solid #362f36; height: 150px; border-radius: 16px;
  display: flex; justify-content: center; align-items: center; cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
}
.tile:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.5); border-color: var(--accent-gold); }
.tile h2 { color: var(--accent-gold); font-size: 1.8rem; margin: 0; }
.country-tile h2 { color: var(--text-main); font-size: 1.5rem; }

/* 卡片清單 (學校) */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }
.card { background-color: var(--bg-card); border-radius: 12px; overflow: hidden; border: 1px solid #362f36; cursor: pointer; transition: 0.3s; }
.card:hover { transform: translateY(-5px); border-color: var(--accent-gold); }
.card-image { height: 180px; background-size: cover; background-position: center; position: relative; }
.badge { position: absolute; top: 15px; right: 15px; background: rgba(18,16,19,0.8); color: var(--accent-gold); padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; border: 1px solid var(--accent-gold); }
.card-body { padding: 20px; }
.card-body h3 { margin: 0 0 10px 0; font-size: 1.3rem; }
.desc-preview { color: var(--text-muted); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.read-more { color: var(--accent); font-size: 0.9rem; font-weight: bold; margin-top: 15px; display: inline-block; }

/* 詳細資訊頁 (第4層) */
.detail-view { background: var(--bg-card); border-radius: 16px; overflow: hidden; border: 1px solid #362f36; }
.detail-hero { height: 350px; background-size: cover; background-position: center; position: relative; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-card) 0%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; }
.hero-overlay h1 { margin: 0; font-size: 3rem; color: #fff; }
.hero-overlay p { margin: 5px 0 0 0; font-size: 1.2rem; color: var(--accent-gold); }
.detail-content { padding: 40px; }
.stats-box { display: flex; gap: 30px; margin-bottom: 40px; background: rgba(18,16,19,0.5); padding: 20px; border-radius: 12px; border: 1px solid #362f36; }
.stat-item { display: flex; align-items: center; gap: 15px; }
.stat-item .icon { font-size: 2rem; }
.stat-item .text { display: flex; flex-direction: column; }
.stat-item .label { color: var(--text-muted); font-size: 0.9rem; }
.stat-item .value { color: var(--text-main); font-size: 1.2rem; font-weight: bold; }
.info-section { margin-bottom: 35px; }
.info-section h3 { color: var(--accent-gold); font-size: 1.4rem; border-bottom: 1px solid #362f36; padding-bottom: 10px; margin-bottom: 15px; }
.info-section p { color: #d1c8cc; line-height: 1.7; font-size: 1.05rem; }
.quote-box { background: rgba(178, 58, 72, 0.1); border-left: 4px solid var(--accent); padding: 20px; border-radius: 0 8px 8px 0; }
.quote-box p { margin: 0; color: #e8d7de; font-style: italic; font-size: 1.1rem; }
</style>