import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Archive, ArrowLeft, ArrowRight, BarChart3, BookOpen, Check,
  ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clapperboard, CloudUpload,
  Command, Download, FileImage, Film, FolderOpen, Gauge, Grid2X2, Image as ImageIcon,
  Layers3, Menu, MoreHorizontal, Pause, Play, Plus, Search, Settings2, SlidersHorizontal,
  Sparkles, Upload, X, ZoomIn
} from 'lucide-react';
import './styles.css';

const initialAssets = [
  { id: 1, name: 'scene_014.png', group: '环境样本', type: 'image', tag: '已标注', size: '2.4 MB', date: '2026-10-14', color: 'violet', src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85', note: '夜空与低照度环境样本' },
  { id: 2, name: 'character_A.webp', group: '角色参考', type: 'image', tag: '待复核', size: '1.8 MB', date: '2026-10-14', color: 'blue', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85', note: '蓝紫色光照参考图' },
  { id: 3, name: 'motion_test_03', group: '动作测试', type: 'video', tag: '已标注', size: '18.2 MB', date: '2026-10-13', color: 'cyan', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85', note: '动态场景关键帧集合' },
  { id: 4, name: 'background_07.jpg', group: '环境样本', type: 'image', tag: '已归档', size: '3.1 MB', date: '2026-10-12', color: 'pink', src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85', note: '星云背景与色彩分布' },
  { id: 5, name: 'fx_particles.png', group: '特效素材', type: 'image', tag: '待复核', size: '920 KB', date: '2026-10-11', color: 'orange', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85', note: '粒子与体积光参考样本' },
  { id: 6, name: 'sequence_021', group: '动作测试', type: 'video', tag: '已标注', size: '24.7 MB', date: '2026-10-10', color: 'green', src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85', note: '流动纹理序列观察' },
];
const story = [
  { id: 'S-001', title: '序章 · 信号初现', chapter: '第一章 / 初始观测', text: '监测站捕获到一段周期性信号。研究团队开始比对背景图像、时间戳与设备日志，试图确认信号是否来自同一事件。', tags: ['环境线索', '待验证'], time: '00:00–02:18' },
  { id: 'S-002', title: '异常帧与环境变化', chapter: '第二章 / 交叉验证', text: '图像序列中出现亮度突变。将相邻帧与环境样本对照后，发现变化可能与镜头曝光和场景光源同时相关，尚需更多证据。', tags: ['图像对比', '进行中'], time: '02:19–05:42' },
  { id: 'S-003', title: '复核与阶段结论', chapter: '第三章 / 归档', text: '团队将可复现的观察记录与推断分开保存。当前结论只覆盖已验证的帧区间，其余部分保留为待检验假设。', tags: ['证据链', '已整理'], time: '05:43–08:10' },
];
const frames = [
  { n: 1, t: '00:00:00.000', label: '起始帧', src: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85' },
  { n: 2, t: '00:00:00.040', label: '亮度变化', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85' },
  { n: 3, t: '00:00:00.080', label: '运动迹象', src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=85' },
  { n: 4, t: '00:00:00.120', label: '局部高光', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85' },
  { n: 5, t: '00:00:00.160', label: '过渡帧', src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=85' },
  { n: 6, t: '00:00:00.200', label: '结束帧', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85' },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('全部素材');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedStory, setSelectedStory] = useState(story[0]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const fileRef = useRef(null);

  const filteredAssets = useMemo(() => assets.filter(a => {
    const matchesQuery = `${a.name} ${a.group} ${a.note}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === '全部素材' || (filter === '图片' && a.type === 'image') || (filter === '动画 / 视频' && a.type === 'video') || (filter === '待复核' && a.tag === '待复核');
    return matchesQuery && matchesFilter;
  }), [assets, query, filter]);

  function importFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const added = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).map((file, i) => ({
      id: Date.now() + i, name: file.name, group: '导入素材', type: file.type.startsWith('video/') ? 'video' : 'image',
      tag: '新导入', size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      date: new Date().toISOString().slice(0, 10), color: 'cyan', src: URL.createObjectURL(file), note: '本地导入的待分析素材'
    }));
    setAssets(prev => [...added, ...prev]);
    setUploadMessage(`已导入 ${added.length} 个文件`);
    setTimeout(() => setUploadMessage(''), 3000);
  }

  function moveFrame(direction) {
    setFrameIndex(i => (i + direction + frames.length) % frames.length);
  }

  const navItems = [
    { id: 'overview', label: '工作台', icon: Grid2X2 },
    { id: 'gallery', label: '图片画廊', icon: ImageIcon, count: assets.length },
    { id: 'story', label: '剧情浏览', icon: BookOpen },
    { id: 'frames', label: '逐帧分析', icon: Clapperboard },
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={20}/></div>
        <div><div className="brand-name">NEBULA<span>LAB</span></div><div className="brand-sub">RESEARCH WORKSPACE</div></div>
        <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="关闭导航"><X size={18}/></button>
      </div>
      <div className="workspace-switch">
        <div className="workspace-icon"><Layers3 size={18}/></div>
        <div className="workspace-copy"><b>项目观测台</b><span>Research project  /  01</span></div>
        <ChevronDown size={15} className="muted"/>
      </div>
      <div className="nav-label">工作区</div>
      <nav className="side-nav">
        {navItems.map(item => <button key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => { setActiveTab(item.id); setMobileNav(false); }}>
          <item.icon size={18}/><span>{item.label}</span>{item.count != null && <span className="nav-count">{item.count}</span>}
        </button>)}
      </nav>
      <div className="nav-label second-label">数据管理</div>
      <nav className="side-nav">
        <button className="nav-item" onClick={() => fileRef.current?.click()}><FolderOpen size={18}/><span>导入素材</span><Plus size={15} className="nav-trailing"/></button>
        <button className="nav-item" onClick={() => setUploadMessage('演示项目：数据集已就绪')}><Archive size={18}/><span>数据集归档</span></button>
        <button className="nav-item" onClick={() => setUploadMessage('分析设置面板将在后续版本开放')}><Settings2 size={18}/><span>分析设置</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="storage-card">
          <div className="storage-top"><span>本地素材索引</span><span className="storage-percent">68%</span></div>
          <div className="storage-bar"><span/></div>
          <p>示例数据空间 · 6 项素材</p>
        </div>
        <div className="profile-row"><div className="avatar">RL</div><div className="profile-info"><b>Research Lab</b><span>本地工作区</span></div><MoreHorizontal size={18} className="muted"/></div>
      </div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)} aria-label="打开导航"><Menu size={19}/></button>
          <div className="breadcrumb">项目 <ChevronRight size={14}/> <span>{navItems.find(n => n.id === activeTab)?.label || '工作台'}</span></div>
        </div>
        <div className="topbar-actions">
          <div className="status-pill"><span className="status-dot"/> 系统正常</div>
          <button className="icon-btn help-btn" title="帮助" onClick={() => setUploadMessage('提示：可在图片画廊导入本地图片或视频。')}><CircleHelp size={18}/></button>
          <div className="top-avatar">RL</div>
        </div>
      </header>
      <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={e => importFiles(e.target.files)}/>
      {uploadMessage && <div className="toast"><Check size={16}/>{uploadMessage}<button onClick={() => setUploadMessage('')}><X size={14}/></button></div>}
      {activeTab === 'overview' && <Overview assets={assets} setActiveTab={setActiveTab} setSelectedAsset={setSelectedAsset} />}
      {activeTab === 'gallery' && <Gallery assets={filteredAssets} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onImport={() => fileRef.current?.click()} onSelect={setSelectedAsset}/>}
      {activeTab === 'story' && <StoryBrowser selectedStory={selectedStory} setSelectedStory={setSelectedStory}/>}
      {activeTab === 'frames' && <FrameViewer frameIndex={frameIndex} setFrameIndex={setFrameIndex} playing={playing} setPlaying={setPlaying} moveFrame={moveFrame}/>}
      <footer className="app-footer"><span>NEBULA LAB <span className="footer-sep">/</span> MEDIA ANALYSIS WORKSPACE</span><span>DEMO DATASET · V1.0.0</span></footer>
    </main>
    {selectedAsset && <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
      <div className="asset-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><div><span className="eyebrow">素材预览 / ASSET PREVIEW</span><h2>{selectedAsset.name}</h2></div><button className="icon-btn" onClick={() => setSelectedAsset(null)}><X size={19}/></button></div>
        <img src={selectedAsset.src} alt={selectedAsset.name} className="modal-image"/>
        <div className="modal-meta"><span><FileImage size={15}/>{selectedAsset.group}</span><span>{selectedAsset.size}</span><span>{selectedAsset.date}</span></div>
        <p className="modal-note">{selectedAsset.note}</p>
        <div className="modal-actions"><button className="secondary-btn" onClick={() => setSelectedAsset(null)}>关闭预览</button><button className="primary-btn" onClick={() => { setSelectedAsset(null); setActiveTab('frames'); }}><Clapperboard size={16}/>打开逐帧分析</button></div>
      </div>
    </div>}
  </div>;
}

function PageHeading({ eyebrow, title, subtitle, actions }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>;
}

function Overview({ assets, setActiveTab, setSelectedAsset }) {
  return <div className="content">
    <PageHeading eyebrow="MONITORING OVERVIEW / 01" title="研究工作台" subtitle="整理素材、浏览叙事线索，并对关键动画帧进行逐项检查。" actions={<button className="primary-btn" onClick={() => setActiveTab('gallery')}><Plus size={16}/>管理素材</button>}/>
    <div className="welcome-banner"><div className="welcome-copy"><div className="banner-tag"><Sparkles size={13}/> RESEARCH SESSION  /  ACTIVE</div><h2>让每一帧，都有迹可循。</h2><p>统一管理图像样本、剧情记录与动画序列。将直接观察与研究推断分开记录，保持分析过程可追溯。</p><button className="banner-button" onClick={() => setActiveTab('frames')}>进入逐帧工作台 <ArrowRight size={16}/></button></div><div className="banner-graphic"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orb-core"><Activity size={30}/></div><div className="graphic-node node-a"/><div className="graphic-node node-b"/><div className="graphic-node node-c"/><div className="graphic-label label-a">FRAME 024</div><div className="graphic-label label-b">SIGNAL / OK</div></div></div>
    <div className="section-heading"><div><h2>项目概览</h2><p>当前演示工作区的索引状态</p></div><span className="subtle-link">实时索引 <span className="tiny-dot"/></span></div>
    <div className="metric-grid">
      <Metric icon={ImageIcon} label="媒体素材" value={String(assets.length).padStart(2,'0')} change="已建立索引" tone="purple"/>
      <Metric icon={BookOpen} label="剧情条目" value="03" change="3 个章节" tone="blue"/>
      <Metric icon={Film} label="关键帧样本" value="06" change="逐帧预览可用" tone="cyan"/>
      <Metric icon={Gauge} label="待复核项目" value={String(assets.filter(a => a.tag === '待复核').length).padStart(2,'0')} change="建议优先检查" tone="orange"/>
    </div>
    <div className="overview-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><h3>最近的素材</h3><p>RECENT ASSETS</p></div><button className="text-btn" onClick={() => setActiveTab('gallery')}>查看全部 <ArrowRight size={14}/></button></div><div className="recent-list">{assets.slice(0,4).map(asset => <button className="recent-item" key={asset.id} onClick={() => setSelectedAsset(asset)}><img src={asset.src} alt="" /><div className="recent-name"><b>{asset.name}</b><span>{asset.group} · {asset.size}</span></div><span className={`status-tag ${asset.tag === '待复核' ? 'review' : ''}`}>{asset.tag}</span><ChevronRight size={15} className="recent-chevron"/></button>)}</div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h3>研究活动</h3><p>SESSION ACTIVITY</p></div><Activity size={17} className="muted"/></div><div className="timeline"><div className="timeline-item"><span className="timeline-icon violet"><Upload size={15}/></span><div><b>素材索引已初始化</b><p>示例数据集加载完成</p><time>刚刚</time></div></div><div className="timeline-item"><span className="timeline-icon blue"><BookOpen size={15}/></span><div><b>剧情目录已建立</b><p>3 条叙事记录待浏览</p><time>12 分钟前</time></div></div><div className="timeline-item"><span className="timeline-icon cyan"><Clapperboard size={15}/></span><div><b>关键帧工作台就绪</b><p>可检查帧序与时间戳</p><time>今天</time></div></div></div><button className="activity-link" onClick={() => setActiveTab('story')}>浏览剧情记录 <ArrowRight size={15}/></button></section>
    </div>
    <div className="note-strip"><div className="note-icon"><CircleHelp size={17}/></div><div><b>关于演示数据</b><p>当前工作区内置的是示例素材与虚构研究记录。导入的文件仅在当前浏览器会话中预览，不会自动上传到服务器。</p></div></div>
  </div>;
}

function Metric({ icon: Icon, label, value, change, tone }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={18}/></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-change"><span className="tiny-dot"/>{change}</div><div className={`metric-spark ${tone}`}><span/><span/><span/><span/><span/><span/><span/></div></div>;
}

function Gallery({ assets, query, setQuery, filter, setFilter, onImport, onSelect }) {
  const filters = ['全部素材','图片','动画 / 视频','待复核'];
  return <div className="content">
    <PageHeading eyebrow="ASSET LIBRARY / 02" title="图片画廊" subtitle="集中浏览、搜索与筛选媒体样本。点击任意素材可查看详情。" actions={<button className="primary-btn" onClick={onImport}><CloudUpload size={16}/>导入素材</button>}/>
    <div className="gallery-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索文件名、类别或备注…"/>{query && <button onClick={() => setQuery('')}><X size={14}/></button>}<kbd>⌘ K</kbd></div><div className="filter-buttons">{filters.map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><button className="square-btn" title="筛选设置" onClick={() => setFilter('全部素材')}><SlidersHorizontal size={17}/></button></div>
    <div className="results-line"><span>显示 <b>{assets.length}</b> 项素材</span><span><span className="tiny-dot"/> 本地索引已同步</span></div>
    {assets.length ? <div className="asset-grid">{assets.map(asset => <button className="asset-card" key={asset.id} onClick={() => onSelect(asset)}><div className="asset-thumb"><img src={asset.src} alt={asset.name}/><span className="asset-type">{asset.type === 'video' ? <Film size={13}/> : <ImageIcon size={13}/>} {asset.type === 'video' ? 'VIDEO' : 'IMAGE'}</span><span className="asset-zoom"><ZoomIn size={16}/></span><span className={`asset-index ${asset.color}`}>#{String(asset.id).padStart(3,'0')}</span></div><div className="asset-card-body"><div className="asset-card-title"><b>{asset.name}</b><MoreHorizontal size={17}/></div><div className="asset-card-meta"><span>{asset.group}</span><span>{asset.size}</span></div><div className="asset-card-foot"><span className={`status-tag ${asset.tag === '待复核' ? 'review' : ''}`}>{asset.tag}</span><span>{asset.date}</span></div></div></button>)}</div> : <div className="empty-state"><Search size={28}/><h3>没有找到匹配素材</h3><p>尝试更换关键词或筛选条件。</p><button className="secondary-btn" onClick={() => {setQuery('');setFilter('全部素材');}}>清除筛选</button></div>}
    <div className="import-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => {e.preventDefault(); const input = document.querySelector('input[type=file]'); if(input){const dt = new DataTransfer(); Array.from(e.dataTransfer.files).forEach(f=>dt.items.add(f)); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'files').set.call(input,dt.files); input.dispatchEvent(new Event('change',{bubbles:true}));}}}><div className="drop-icon"><CloudUpload size={20}/></div><div><b>添加更多研究素材</b><p>支持图片与视频文件，可点击“导入素材”或将文件拖放到这里。</p></div><button className="secondary-btn" onClick={onImport}>选择文件 <ArrowRight size={14}/></button></div>
  </div>;
}

function StoryBrowser({ selectedStory, setSelectedStory }) {
  return <div className="content">
    <PageHeading eyebrow="NARRATIVE INDEX / 03" title="剧情浏览" subtitle="以章节为单位组织事件、时间范围与证据备注，方便回溯分析上下文。"/>
    <div className="story-layout"><aside className="panel story-index"><div className="panel-heading"><div><h3>叙事目录</h3><p>CHAPTER INDEX</p></div><span className="count-badge">03</span></div>{story.map((s,i)=><button key={s.id} className={`story-index-item ${selectedStory.id===s.id?'active':''}`} onClick={()=>setSelectedStory(s)}><span className="story-number">0{i+1}</span><span className="story-index-copy"><b>{s.title}</b><small>{s.chapter}</small></span><ChevronRight size={15}/></button>)}<div className="story-index-foot"><BookOpen size={15}/> 已建立 3 条剧情记录</div></aside>
      <article className="panel story-detail"><div className="story-detail-top"><span className="eyebrow">{selectedStory.id} / NARRATIVE RECORD</span><span className="story-time"><Activity size={14}/>{selectedStory.time}</span></div><div className="story-chapter">{selectedStory.chapter}</div><h2>{selectedStory.title}</h2><div className="story-hero"><div className="story-hero-grid"/><div className="story-hero-center"><div className="story-hero-icon"><BookOpen size={25}/></div><span>RESEARCH LOG</span><b>{selectedStory.id}</b></div><span className="story-hero-coord">SEQ / 0{story.findIndex(s=>s.id===selectedStory.id)+1}</span></div><div className="story-section"><h3><span/>记录摘要</h3><p>{selectedStory.text}</p></div><div className="story-tags">{selectedStory.tags.map(t=><span key={t}>{t}</span>)}</div><div className="evidence-card"><div className="evidence-icon"><CircleHelp size={17}/></div><div><b>证据状态说明</b><p>将可直接观察的事实与尚未验证的解释分开记录。该条目为演示文本，不代表真实事件结论。</p></div></div><div className="story-pagination"><button className="secondary-btn" disabled={selectedStory.id==='S-001'} onClick={()=>setSelectedStory(story[Math.max(0,story.findIndex(s=>s.id===selectedStory.id)-1)])}><ArrowLeft size={15}/>上一条</button><span>{String(story.findIndex(s=>s.id===selectedStory.id)+1).padStart(2,'0')} <i>/</i> 03</span><button className="secondary-btn" disabled={selectedStory.id==='S-003'} onClick={()=>setSelectedStory(story[Math.min(2,story.findIndex(s=>s.id===selectedStory.id)+1)])}>下一条<ArrowRight size={15}/></button></div></article></div>
  </div>;
}

function FrameViewer({ frameIndex, setFrameIndex, playing, setPlaying, moveFrame }) {
  const frame = frames[frameIndex];
  return <div className="content">
    <PageHeading eyebrow="FRAME INSPECTOR / 04" title="动画逐帧分析" subtitle="检查关键帧、时间戳与相邻画面。当前使用演示帧序列，可切换帧位进行比对。" actions={<button className="secondary-btn" onClick={() => setPlaying(p => !p)}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'暂停播放':'播放序列'}</button>}/>
    <div className="frame-workspace"><div className="frame-main panel"><div className="frame-toolbar"><div className="frame-file"><Film size={16}/><b>sequence_demo_001</b><span className="frame-format">IMAGE SEQUENCE</span></div><button className="icon-btn" title="分析选项"><Settings2 size={17}/></button></div><div className="frame-stage"><img src={frame.src} alt={`第 ${frame.n} 帧`}/><div className="stage-overlay stage-top-left"><span className="rec-dot"/> FRAME INSPECTOR</div><div className="stage-overlay stage-top-right">1920 × 1080 <span>·</span> RGB</div><div className="stage-overlay stage-bottom-left">FRAME {String(frame.n).padStart(04,'0')}</div><div className="stage-overlay stage-bottom-right">{frame.t}</div><div className="crosshair crosshair-h"/><div className="crosshair crosshair-v"/></div><div className="frame-control"><button className="square-btn" onClick={()=>moveFrame(-1)} aria-label="上一帧"><ChevronLeft size={18}/></button><button className="play-button" onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={17}/>:<Play size={17}/>}</button><button className="square-btn" onClick={()=>moveFrame(1)} aria-label="下一帧"><ChevronRight size={18}/></button><div className="frame-slider-wrap"><div className="frame-slider-label"><span>帧位置</span><b>{frameIndex+1} <i>/</i> {frames.length}</b></div><input type="range" min="0" max={frames.length-1} value={frameIndex} onChange={e=>setFrameIndex(Number(e.target.value))}/></div><span className="fps-pill">25 FPS</span></div><div className="filmstrip-head"><b>关键帧序列</b><span>点击缩略图切换帧位</span></div><div className="filmstrip">{frames.map((f,i)=><button key={f.n} className={`film-frame ${i===frameIndex?'active':''}`} onClick={()=>setFrameIndex(i)}><img src={f.src} alt=""/><span>{String(f.n).padStart(02,'0')}</span></button>)}</div></div>
      <aside className="frame-sidebar"><section className="panel frame-info"><div className="panel-heading"><div><h3>帧信息</h3><p>FRAME METADATA</p></div><MoreHorizontal size={17} className="muted"/></div><div className="frame-preview"><img src={frame.src} alt="当前帧缩略图"/><div><b>{frame.label}</b><span>当前选中帧</span></div></div><div className="metadata-list"><Meta label="帧编号" value={`F-${String(frame.n).padStart(4,'0')}`}/><Meta label="时间戳" value={frame.t}/><Meta label="分辨率" value="1920 × 1080"/><Meta label="颜色空间" value="sRGB / 8-bit"/><Meta label="采样状态" value="演示数据"/></div><div className="frame-note"><span className="tiny-dot"/><span>相邻帧差异尚未自动计算</span></div></section><section className="panel frame-analysis"><div className="panel-heading"><div><h3>观察记录</h3><p>OBSERVATION NOTES</p></div><SlidersHorizontal size={16} className="muted"/></div><label htmlFor="frame-note">当前帧备注</label><textarea id="frame-note" placeholder="记录可观察到的画面变化、边界或疑点…" defaultValue={frameIndex===0?'基准帧：作为相邻帧对比的参考。':''}/><button className="secondary-btn full-width" onClick={e=>{e.currentTarget.innerHTML='✓ 备注已在当前界面标记';}}>保存观察备注 <Check size={15}/></button></section></aside></div>
    <div className="frame-disclaimer"><CircleHelp size={16}/><span>当前逐帧查看器使用内置演示图片模拟序列导航。导入真实视频后，素材会出现在画廊；完整视频解码、自动提帧与差分分析可在后续版本接入。</span></div>
  </div>;
}

function Meta({label,value}) { return <div className="metadata-row"><span>{label}</span><b>{value}</b></div>; }

createRoot(document.getElementById('root')).render(<App/>);
