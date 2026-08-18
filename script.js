(() => {
  const cfg = window.CASH_DUCK_CONFIG || {};
  const storageKey = 'cashduck_tasks_v1';
  const tasks = { follow: false, like: false, quote: false, ...readJSON(storageKey) };

  const translations = {
    en: {
      tagline: '10,000 CASH DUCKS ON ROBINHOOD CHAIN', subline: 'GTD IS OPEN · COMPLETE THE TASKS · CLAIM YOUR SPOT',
      mintPrice: 'MINT PRICE', supply: 'SUPPLY', mintDate: 'MINT DATE', mintStarts: 'MINT STARTS IN',
      days: 'DAYS', hours: 'HRS', minutes: 'MIN', seconds: 'SEC', dateTba: 'DATE & TIME TBA',
      tasks: 'TASKS', followHelp: 'Follow us on X', follow: 'FOLLOW', likeTitle: 'LIKE + REPOST THE POST',
      likeHelp: 'Like and repost our GTD post', like: 'LIKE + REPOST', quoteTitle: 'LEAVE A COMMENT', quoteHelp: 'Leave a comment under our GTD post',
      quote: 'COMMENT', register: 'REGISTER', xHandle: 'YOUR X HANDLE', wallet: 'YOUR WALLET ADDRESS',
      formNote: 'We use these to register your GTD spot. Wrong address = no GTD.', completeTasks: 'COMPLETE ALL TASKS TO UNLOCK',
      claim: 'CLAIM GTD', completeFirst: 'COMPLETE THE TASKS FIRST', sending: 'SENDING...', success: 'GTD CLAIMED SUCCESSFULLY!',
      invalidX: 'ENTER A VALID X HANDLE.', invalidWallet: 'ENTER A VALID 0x WALLET ADDRESS.', already: 'THIS WALLET HAS ALREADY BEEN SUBMITTED.',
      localSaved: 'TEST MODE: SAVED ON THIS DEVICE. ADD GOOGLE SCRIPT URL TO SEND TO SHEETS.', failed: 'SUBMISSION FAILED. PLEASE TRY AGAIN.',
      shareTitle: 'GTD CLAIM SUBMITTED!', shareIntro: 'Your spot has been registered. Share Cash Duck with your community.',
      shareImage: 'SHARE WITH IMAGE', shareX: 'POST ON X', downloadImage: 'DOWNLOAD IMAGE',
      shareNote: 'On desktop: download the image, open X, and attach it to the prepared post.'
    },
    zh: {
      tagline: 'ROBINHOOD CHAIN 上的 10,000 CASH DUCKS', subline: 'GTD 已开放 · 完成任务 · 领取名额',
      mintPrice: '铸造价格', supply: '总量', mintDate: '铸造日期', mintStarts: '距离铸造开始',
      days: '天', hours: '时', minutes: '分', seconds: '秒', dateTba: '日期与时间待定',
      tasks: '任务', followHelp: '在 X 上关注我们', follow: '关注', likeTitle: '点赞 + 转发帖子',
      likeHelp: '点赞并转发我们的 GTD 帖子', like: '点赞 + 转发', quoteTitle: '留下评论', quoteHelp: '在我们的 GTD 帖子下留言',
      quote: '评论', register: '登记', xHandle: '你的 X 用户名', wallet: '你的钱包地址',
      formNote: '这些信息用于登记 GTD。地址错误将无法获得 GTD。', completeTasks: '完成所有任务后解锁',
      claim: '领取 GTD', completeFirst: '请先完成任务', sending: '发送中...', success: 'GTD 领取成功！',
      invalidX: '请输入有效的 X 用户名。', invalidWallet: '请输入有效的 0x 钱包地址。', already: '此钱包已经提交。',
      localSaved: '测试模式：已保存在本设备。添加 Google Script URL 后会发送到表格。', failed: '提交失败，请重试。',
      shareTitle: 'GTD 申请已提交！', shareIntro: '你的名额已登记。将 Cash Duck 分享给你的社区。',
      shareImage: '带图片分享', shareX: '发布到 X', downloadImage: '下载图片',
      shareNote: '桌面端：下载图片，打开 X，然后将图片添加到已准备好的帖子。'
    }
  };

  let lang = localStorage.getItem('cashduck_lang') || 'en';
  applyConfig();
  setupLanding();
  renderTasks();
  setLanguage(lang);
  setupTaskButtons();
  setupLanguageButtons();
  setupForm();
  setupCountdown();
  setupSharing();

  function setupLanding() {
    const openButton = document.getElementById('openGtdButton');
    const landing = document.getElementById('landingScreen');
    const content = document.getElementById('siteContent');
    if (!openButton || !landing || !content) return;

    openButton.addEventListener('click', () => {
      document.body.classList.add('gtd-open');
      content.classList.remove('is-hidden');
      content.classList.add('is-visible');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  function applyConfig() {
    document.getElementById('mintPrice').textContent = cfg.mintPrice || 'TBA';
    document.getElementById('supply').textContent = cfg.supply || '10,000';
    document.getElementById('mintDate').textContent = cfg.mintDate || 'TBA';
  }

  function setupTaskButtons() {
    document.querySelectorAll('.task-button').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const url = action === 'follow' ? cfg.xProfileUrl : action === 'like' ? cfg.likePostUrl : (cfg.commentPostUrl || cfg.quotePostUrl);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        tasks[action] = true;
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        renderTasks();
      });
    });
  }

  function renderTasks() {
    Object.entries(tasks).forEach(([name, done]) => {
      const item = document.querySelector(`[data-task="${name}"]`);
      if (!item) return;
      item.classList.toggle('done', Boolean(done));
      item.querySelector('.task-state').textContent = done ? '✓' : '?';
    });

    const unlocked = Object.values(tasks).every(Boolean);
    const section = document.getElementById('registerSection');
    const inputs = section.querySelectorAll('input');
    const claim = document.getElementById('claimButton');
    section.classList.toggle('unlocked', unlocked);
    section.classList.toggle('locked', !unlocked);
    inputs.forEach(input => input.disabled = !unlocked);
    claim.disabled = !unlocked;
    claim.textContent = unlocked ? translations[lang].claim : translations[lang].completeFirst;
  }

  function setupForm() {
    const form = document.getElementById('registerForm');
    const status = document.getElementById('formStatus');
    const claim = document.getElementById('claimButton');

    form.addEventListener('submit', async event => {
      event.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      const xHandle = form.xHandle.value.trim().replace(/^@/, '');
      const wallet = form.wallet.value.trim();
      if (!/^[A-Za-z0-9_]{1,15}$/.test(xHandle)) return showError(translations[lang].invalidX);
      if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) return showError(translations[lang].invalidWallet);

      const localWallets = readJSON('cashduck_submitted_wallets') || [];
      if (localWallets.map(w => w.toLowerCase()).includes(wallet.toLowerCase())) return showError(translations[lang].already);

      claim.disabled = true;
      claim.textContent = translations[lang].sending;

      // Keep the exact field names expected by the existing NodePunks Apps Script.
      const payload = {
        xHandle: '@' + xHandle,
        walletAddress: wallet,
        repostLink: '',
        project: cfg.projectName || 'Cash Duck',
        timestamp: new Date().toISOString()
      };

      try {
        if (cfg.googleScriptUrl) {
          // The existing NodePunks endpoint parses JSON from e.postData.contents.
          // text/plain avoids a CORS preflight and matches the working NodePunks site.
          await fetch(cfg.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          status.textContent = translations[lang].success;
        } else {
          localStorage.setItem('cashduck_demo_submission', JSON.stringify(payload));
          status.textContent = translations[lang].localSaved;
        }
        localWallets.push(wallet);
        localStorage.setItem('cashduck_submitted_wallets', JSON.stringify(localWallets));
        status.className = 'form-status success';
        form.reset();
        openShareModal();
      } catch (error) {
        showError(translations[lang].failed);
      } finally {
        claim.disabled = false;
        claim.textContent = translations[lang].claim;
      }

      function showError(message) {
        status.textContent = message;
        status.className = 'form-status error';
      }
    });
  }

  function setupSharing() {
    const shareX = document.getElementById('shareXButton');
    const nativeButton = document.getElementById('shareNativeButton');
    const preview = document.getElementById('sharePreview');
    const download = document.getElementById('downloadShareImage');
    const imageUrl = cfg.shareImageUrl || 'assets/landing-hero.jpeg';
    const text = cfg.shareText || 'I just claimed my GTD spot for @CashDuck!';
    const url = cfg.shareUrl || cfg.xProfileUrl || '';

    preview.src = imageUrl;
    download.href = imageUrl;
    shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    document.querySelectorAll('[data-close-share]').forEach(el => el.addEventListener('click', closeShareModal));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeShareModal(); });

    nativeButton.addEventListener('click', async () => {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const extension = blob.type.includes('png') ? 'png' : 'jpeg';
        const file = new File([blob], `Cash Duck-GTD.${extension}`, { type: blob.type || 'image/jpeg' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'Cash Duck GTD', text, url, files: [file] });
          return;
        }
      } catch (error) {
        // Fall through to the X compose window.
      }
      download.click();
      window.open(shareX.href, '_blank', 'noopener,noreferrer');
    });
  }

  function openShareModal() {
    const modal = document.getElementById('shareModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('share-open');
  }

  function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('share-open');
  }

  function setupCountdown() {
    const wrap = document.getElementById('countdown');
    const tba = document.getElementById('tbaCountdown');
    if (!cfg.mintTimestamp) {
      wrap.style.display = 'none';
      tba.style.display = 'block';
      return;
    }
    const target = new Date(cfg.mintTimestamp).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      document.getElementById('days').textContent = pad(d);
      document.getElementById('hours').textContent = pad(h);
      document.getElementById('minutes').textContent = pad(m);
      document.getElementById('seconds').textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  function setupLanguageButtons() {
    document.querySelectorAll('.lang').forEach(button => {
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });
  }

  function setLanguage(next) {
    lang = translations[next] ? next : 'en';
    localStorage.setItem('cashduck_lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    renderTasks();
  }

  function pad(value) { return String(value).padStart(2, '0'); }
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }
})();
