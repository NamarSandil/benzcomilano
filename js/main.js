/* BENZCOMILANO — site interactivity */
(function(){
  'use strict';

  /* ---------------- storage helpers ---------------- */
  const store = {
    get(key, fallback){ try{ const v = JSON.parse(localStorage.getItem(key)); return v==null?fallback:v; }catch(e){ return fallback; } },
    set(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
  };
  const getCart = ()=> store.get('bc_cart', []);
  const setCart = (c)=>{ store.set('bc_cart', c); renderHeaderCounts(); };
  const getWishlist = ()=> store.get('bc_wishlist', []);
  const setWishlist = (w)=>{ store.set('bc_wishlist', w); renderHeaderCounts(); };

  /* ---------------- i18n ---------------- */
  function currentLang(){ return store.get('bc_lang', 'en'); }
  function t(key){
    const lang = currentLang();
    const dict = (typeof BC_I18N !== 'undefined') ? BC_I18N : null;
    if(!dict) return key;
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  }
  window.bcT = t;

  function translateStaticDom(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-lang-switch] button').forEach(b=>{ b.classList.toggle('active', b.dataset.lang===currentLang()); });
  }

  function refreshDynamicContent(){
    renderRail('[data-rail="new"]', BC_PRODUCTS.filter(p=>p.tags.includes('new')), 8);
    renderRail('[data-rail="bestsellers"]', BC_PRODUCTS.filter(p=>p.tags.includes('bestseller')), 4);
    renderCartDrawer();
    renderCartPage();
    renderCheckoutSummary();
    renderWishlistPage();
    if(window.__bcListingRender) window.__bcListingRender();
    if(window.__bcSearchRun) window.__bcSearchRun();
    if(window.__bcProductRerender) window.__bcProductRerender();
  }

  function applyLanguage(lang, animate){
    const doSwap = ()=>{
      store.set('bc_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      translateStaticDom();
      refreshDynamicContent();
    };
    if(animate===false){ doSwap(); return; }
    document.body.classList.add('lang-fade');
    setTimeout(()=>{
      doSwap();
      requestAnimationFrame(()=> document.body.classList.remove('lang-fade'));
    }, 180);
  }
  window.bcApplyLanguage = applyLanguage;

  function initLangSwitch(){
    document.querySelectorAll('[data-lang-switch] button').forEach(btn=>{
      btn.addEventListener('click', ()=> applyLanguage(btn.dataset.lang));
    });
  }

  /* ---------------- toast ---------------- */
  function bcToast(msg){
    let wrap = document.querySelector('.toast-wrap');
    if(!wrap){ wrap = document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
    const t = document.createElement('div'); t.className='toast'; t.textContent = msg;
    wrap.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('show'));
    setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(), 350); }, 2600);
  }
  window.bcToast = bcToast;

  /* ---------------- header counts ---------------- */
  function renderHeaderCounts(){
    const cartCount = getCart().reduce((s,l)=> s+l.qty, 0);
    const wishCount = getWishlist().length;
    document.querySelectorAll('[data-cart-count]').forEach(el=>{
      el.textContent = cartCount; el.hidden = cartCount===0;
    });
    document.querySelectorAll('[data-wish-count]').forEach(el=>{
      el.textContent = wishCount; el.hidden = wishCount===0;
    });
  }

  /* ---------------- announcement bar ---------------- */
  function initAnnounce(){
    const bar = document.querySelector('.announce');
    if(!bar) return;
    if(store.get('bc_announce_closed', false)){ bar.hidden = true; return; }
    const closeBtn = bar.querySelector('button');
    if(closeBtn) closeBtn.addEventListener('click', ()=>{ bar.hidden = true; store.set('bc_announce_closed', true); });
  }

  /* ---------------- mobile menu ---------------- */
  function initMobileMenu(){
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.overlay[data-for="menu"]');
    const openBtns = document.querySelectorAll('[data-open="menu"]');
    const closeBtns = menu ? menu.querySelectorAll('[data-close="menu"]') : [];
    function open(){ menu.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('no-scroll'); }
    function close(){ menu.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('no-scroll'); }
    if(!menu) return;
    openBtns.forEach(b=> b.addEventListener('click', open));
    closeBtns.forEach(b=> b.addEventListener('click', close));
    overlay.addEventListener('click', close);
  }

  /* ---------------- search overlay ---------------- */
  function initSearchOverlay(){
    const panel = document.querySelector('.search-panel');
    const overlay = document.querySelector('.overlay[data-for="search"]');
    const openBtns = document.querySelectorAll('[data-open="search"]');
    if(!panel) return;
    function open(){ panel.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('no-scroll'); const inp = panel.querySelector('input'); if(inp) setTimeout(()=>inp.focus(),300); }
    function close(){ panel.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('no-scroll'); }
    openBtns.forEach(b=> b.addEventListener('click', open));
    panel.querySelectorAll('[data-close="search"]').forEach(b=> b.addEventListener('click', close));
    overlay.addEventListener('click', close);
    const form = panel.querySelector('form');
    if(form) form.addEventListener('submit', e=>{
      e.preventDefault();
      const q = form.querySelector('input').value.trim();
      window.location.href = 'search.html' + (q? '?q='+encodeURIComponent(q) : '');
    });
  }

  /* ---------------- garment line-art icons ---------------- */
  const BC_TYPE_ICONS = {
    Outerwear: '<path d="M35,15 L20,30 L25,95 L45,95 L50,42 L55,95 L75,95 L80,30 L65,15 L50,26 Z"/>',
    Dresses: '<path d="M40,15 L34,36 L20,95 L80,95 L66,36 L60,15 L50,26 Z"/>',
    Knitwear: '<path d="M30,20 L14,34 L22,46 L30,39 L30,95 L70,95 L70,39 L78,46 L86,34 L70,20 L59,26 Q50,33 41,26 Z"/>',
    Skirts: '<path d="M30,20 L70,20 L86,90 L14,90 Z"/>',
    Trousers: '<path d="M24,10 L76,10 L79,95 L58,95 L50,44 L42,95 L21,95 Z"/>',
    Shirts: '<path d="M35,15 L24,26 L30,37 L38,29 L38,95 L62,95 L62,29 L70,37 L76,26 L65,15 L55,22 L50,17 L45,22 Z"/>',
    Shoes: '<path d="M8,80 Q8,64 24,59 L54,53 Q66,47 77,54 L90,65 Q95,73 90,80 Z"/><path d="M8,80 L90,80"/>',
    Bags: '<path d="M24,40 L76,40 L81,92 L19,92 Z"/><path d="M35,40 Q35,18 50,18 Q65,18 65,40"/>',
    Scarves: '<path d="M12,32 Q38,10 48,30 Q58,52 88,40" /><path d="M18,48 Q42,26 54,46 Q64,66 90,56"/>',
    Belts: '<path d="M6,45 L94,45 L94,57 L6,57 Z"/><rect x="41" y="36" width="18" height="30" rx="2"/>',
    Eyewear: '<rect x="12" y="38" width="32" height="24" rx="9"/><rect x="56" y="38" width="32" height="24" rx="9"/><path d="M44,48 L56,48 M12,46 L3,40 M88,46 L97,40"/>'
  };
  function typeIconSVG(type){
    const inner = BC_TYPE_ICONS[type] || BC_TYPE_ICONS.Outerwear;
    return `<svg class="ph-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }

  /* ---------------- cart drawer ---------------- */
  function phMarkup(p, extraClass){
    return `<div class="ph ph-tone-${p.tone||1}" data-ratio="${p.ratio||'portrait'}"${extraClass?` `+extraClass:''}>
      ${typeIconSVG(p.type)}<span class="ph-label">${p.name}</span></div>`;
  }

  function renderCartDrawer(){
    const body = document.querySelector('.cart-drawer .drawer-body');
    const foot = document.querySelector('.cart-drawer .drawer-foot');
    if(!body) return;
    const cart = getCart();
    if(cart.length===0){
      body.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        <h3>${t('bag_empty_title')}</h3><p>${t('bag_empty_text')}</p>
        <a class="btn btn-outline" href="shop.html" data-close="cart">${t('start_shopping')}</a></div>`;
      if(foot) foot.style.display='none';
      return;
    }
    if(foot) foot.style.display='';
    body.innerHTML = cart.map((l,i)=>{
      const p = bcGetProduct(l.id); if(!p) return '';
      return `<div class="cart-line">
        ${phMarkup(p)}
        <div class="meta">
          <div class="name">${p.name}</div>
          <div class="opt">${l.color} / ${l.size}</div>
          <div class="opt">${bcFormatPrice(p.sale||p.price)}</div>
          <div class="qty-row">
            <div class="qty-stepper">
              <button data-qty="dec" data-i="${i}" aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button data-qty="inc" data-i="${i}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-link" data-remove="${i}">${t('remove')}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    const subtotal = cart.reduce((s,l)=>{ const p=bcGetProduct(l.id); return s+(p?(p.sale||p.price)*l.qty:0); },0);
    if(foot) foot.innerHTML = `
      <p class="ship-note">${t('free_shipping_note')}</p>
      <div class="subtotal-row"><span>${t('subtotal')}</span><span>${bcFormatPrice(subtotal)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block">${t('checkout_btn')}</a>
      <a href="cart.html" class="btn btn-ghost btn-block" style="margin-top:.6em;text-align:center;justify-content:center;">${t('view_bag')}</a>`;
    body.querySelectorAll('[data-qty]').forEach(btn=> btn.addEventListener('click', ()=>{
      const i = +btn.dataset.i; const c = getCart();
      c[i].qty += (btn.dataset.qty==='inc'?1:-1);
      if(c[i].qty<=0) c.splice(i,1);
      setCart(c); renderCartDrawer(); renderCartPage(); renderCheckoutSummary();
    }));
    body.querySelectorAll('[data-remove]').forEach(btn=> btn.addEventListener('click', ()=>{
      const c = getCart(); c.splice(+btn.dataset.remove,1); setCart(c); renderCartDrawer(); renderCartPage(); renderCheckoutSummary();
      bcToast(t('toast_removed_bag'));
    }));
  }

  function initCartDrawer(){
    const drawer = document.querySelector('.cart-drawer');
    const overlay = document.querySelector('.overlay[data-for="cart"]');
    if(!drawer) return;
    function open(){ renderCartDrawer(); drawer.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('no-scroll'); }
    function close(){ drawer.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('no-scroll'); }
    document.querySelectorAll('[data-open="cart"]').forEach(b=> b.addEventListener('click', e=>{ e.preventDefault(); open(); }));
    drawer.querySelectorAll('[data-close="cart"]').forEach(b=> b.addEventListener('click', close));
    overlay.addEventListener('click', close);
    window.bcOpenCart = open;
  }

  function addToCart(id, color, size, qty){
    qty = qty||1;
    const cart = getCart();
    const existing = cart.find(l=> l.id===id && l.color===color && l.size===size);
    if(existing) existing.qty += qty; else cart.push({id,color,size,qty});
    setCart(cart);
    bcToast(t('toast_added_bag'));
    if(window.bcOpenCart) window.bcOpenCart();
  }
  window.bcAddToCart = addToCart;

  /* ---------------- wishlist ---------------- */
  function isWished(id){ return getWishlist().includes(id); }
  function toggleWishlist(id, btn){
    let w = getWishlist();
    if(w.includes(id)){ w = w.filter(x=>x!==id); bcToast(t('toast_removed_wishlist')); }
    else { w.push(id); bcToast(t('toast_added_wishlist')); }
    setWishlist(w);
    if(btn) btn.classList.toggle('active', w.includes(id));
    renderWishlistPage();
  }
  window.bcToggleWishlist = toggleWishlist;

  /* ---------------- product card ---------------- */
  function productCardHTML(p){
    const wished = isWished(p.id) ? 'active' : '';
    const tagHtml = p.tags.map(tag=> `<span class="tag${tag==='sale'?' sale':''}">${tag==='new'?t('tag_new'):tag==='bestseller'?t('tag_bestseller'):t('tag_sale')}</span>`).join('');
    const priceHtml = p.sale ? `<span class="was">${bcFormatPrice(p.price)}</span><span class="now">${bcFormatPrice(p.sale)}</span>` : `<span>${bcFormatPrice(p.price)}</span>`;
    const swatches = p.colors.map(c=> `<span class="swatch" style="background:${BC_COLORS[c]}"></span>`).join('');
    return `<article class="product-card reveal">
      <a href="product.html?id=${p.id}" class="card-media">
        <div class="tags">${tagHtml}</div>
        <button class="fav ${wished}" data-wish="${p.id}" aria-label="Toggle wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4.5c2 0 3.4 1 4.9 2.7 1.5-1.7 2.9-2.7 4.9-2.7C19 4.5 20.6 8 20 11.7 17.5 16.4 12 21 12 21z"/></svg>
        </button>
        ${phMarkup(p)}
      </a>
      <div class="info">
        <a href="product.html?id=${p.id}"><h3 class="name">${p.name}</h3></a>
        <div class="price">${priceHtml}</div>
        <div class="swatches">${swatches}</div>
        <button class="btn btn-outline btn-block quick-add" data-quickadd="${p.id}">${t('quick_add')}</button>
      </div>
    </article>`;
  }
  window.bcProductCardHTML = productCardHTML;

  function bindProductCards(root){
    (root||document).querySelectorAll('[data-wish]').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.preventDefault(); toggleWishlist(btn.dataset.wish, btn); });
    });
    (root||document).querySelectorAll('[data-quickadd]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        e.preventDefault();
        const p = bcGetProduct(btn.dataset.quickadd);
        if(p) openQuickView(p);
      });
    });
  }
  window.bcBindProductCards = bindProductCards;

  /* ---------------- quick view modal ---------------- */
  function openQuickView(p){
    let modal = document.querySelector('.quickview-modal');
    if(!modal){
      modal = document.createElement('div');
      modal.className = 'modal quickview-modal';
      modal.innerHTML = `<button class="btn-icon modal-close" data-close-modal><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="qv-body"></div>`;
      document.body.appendChild(modal);
      modal.querySelector('[data-close-modal]').addEventListener('click', ()=> closeModal(modal));
    }
    const overlay = getSharedOverlay();
    modal.querySelector('.qv-body').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:1rem;">
        <div style="max-width:220px">${phMarkup(p)}</div>
        <div>
          <h3 style="margin-bottom:.3em;">${p.name}</h3>
          <p style="color:var(--c-gray-700);margin-bottom:.8em;">${p.sale?bcFormatPrice(p.sale):bcFormatPrice(p.price)}</p>
          <p style="font-size:var(--fs-sm);color:var(--c-gray-700);margin-bottom:1em;">${p.desc}</p>
          <div class="size-grid" style="margin-bottom:1em;max-width:260px;">
            ${p.sizes.map((s,i)=>`<button class="size-btn qv-size ${i===0?'selected':''}" data-size="${s}">${s}</button>`).join('')}
          </div>
          <button class="btn btn-primary btn-block" data-qv-add="${p.id}">${t('add_to_bag')}</button>
          <a href="product.html?id=${p.id}" class="btn btn-ghost" style="margin-top:.6em;display:inline-block;">${t('view_full_details')}</a>
        </div>
      </div>`;
    modal.querySelectorAll('.qv-size').forEach(b=> b.addEventListener('click', ()=>{
      modal.querySelectorAll('.qv-size').forEach(x=>x.classList.remove('selected')); b.classList.add('selected');
    }));
    modal.querySelector('[data-qv-add]').addEventListener('click', ()=>{
      const size = modal.querySelector('.qv-size.selected').dataset.size;
      addToCart(p.id, p.colors[0], size, 1);
      closeModal(modal);
    });
    openModal(modal, overlay);
  }

  function getSharedOverlay(){
    let overlay = document.querySelector('.overlay[data-for="modal"]');
    if(!overlay){ overlay = document.createElement('div'); overlay.className='overlay'; overlay.dataset.for='modal'; document.body.appendChild(overlay); }
    return overlay;
  }
  function openModal(modal, overlay){
    overlay = overlay || getSharedOverlay();
    modal.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('no-scroll');
    overlay.onclick = ()=> closeModal(modal);
  }
  function closeModal(modal){
    modal.classList.remove('open');
    const overlay = document.querySelector('.overlay[data-for="modal"]');
    if(overlay) overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }
  window.bcCloseModal = closeModal;
  window.bcOpenModal = openModal;

  /* ---------------- size guide modal (static, present in DOM) ---------------- */
  function initSizeGuide(){
    const modal = document.querySelector('.sizeguide-modal');
    document.querySelectorAll('[data-open-sizeguide]').forEach(btn=>{
      btn.addEventListener('click', e=>{ e.preventDefault(); if(modal) openModal(modal); });
    });
    if(modal){
      modal.querySelectorAll('[data-close-modal]').forEach(b=> b.addEventListener('click', ()=> closeModal(modal)));
    }
  }

  /* ---------------- generic modal close buttons ---------------- */
  function initGenericModals(){
    document.querySelectorAll('.modal').forEach(modal=>{
      modal.querySelectorAll('[data-close-modal]').forEach(b=> b.addEventListener('click', ()=> closeModal(modal)));
    });
  }

  /* ---------------- newsletter ---------------- */
  function initNewsletter(){
    document.querySelectorAll('.newsletter-form, .footer-newsletter').forEach(form=>{
      form.addEventListener('submit', e=>{
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if(input && input.value.trim()){ bcToast(t('toast_subscribed')); form.reset(); }
      });
    });
  }

  /* ---------------- generic forms (contact/account/checkout) ---------------- */
  function initDemoForms(){
    document.querySelectorAll('[data-demo-form]').forEach(form=>{
      form.addEventListener('submit', e=>{
        e.preventDefault();
        bcToast(form.dataset.demoForm ? t(form.dataset.demoForm) : 'Submitted successfully');
        if(form.hasAttribute('data-clear-cart')){ setCart([]); renderCartPage(); renderCheckoutSummary(); }
      });
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  function initReveal(){
    const els = document.querySelectorAll('.reveal');
    if(!('IntersectionObserver' in window)){ els.forEach(el=> el.classList.add('in')); return; }
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold:0.12 });
    els.forEach(el=> io.observe(el));
  }
  window.bcInitReveal = initReveal;

  /* ================= PAGE: home / listing product rails ================= */
  function renderRail(selector, list, limit){
    const el = document.querySelector(selector);
    if(!el) return;
    el.innerHTML = list.slice(0, limit||list.length).map(productCardHTML).join('');
    bindProductCards(el);
  }
  window.bcRenderRail = renderRail;

  /* ================= PAGE: shop / men / women / new-in ================= */
  function initListingPage(){
    const grid = document.querySelector('[data-listing-grid]');
    if(!grid) return;
    const fixedCategory = grid.dataset.category || null;
    const fixedCollection = grid.dataset.collection || null;
    const params = new URLSearchParams(location.search);
    const state = {
      category: fixedCategory || params.get('category') || 'all',
      sizes: new Set(), colors: new Set(),
      sort: 'newest',
      max: 1400,
      collection: fixedCollection || params.get('collection') || null
    };

    const sortSel = document.querySelector('[data-sort]');
    const countEl = document.querySelector('[data-result-count]');
    const filterForm = document.querySelector('[data-filter-form]');

    function matches(p){
      if(state.category !== 'all' && p.category !== state.category) return false;
      if(state.collection === 'best-sellers' && !p.tags.includes('bestseller')) return false;
      if(state.collection === 'sale' && !p.tags.includes('sale')) return false;
      if(state.collection === 'new' && !p.tags.includes('new')) return false;
      if(state.sizes.size && !p.sizes.some(s=> state.sizes.has(s))) return false;
      if(state.colors.size && !p.colors.some(c=> state.colors.has(c))) return false;
      if((p.sale||p.price) > state.max) return false;
      return true;
    }
    function sortList(list){
      const arr = list.slice();
      if(state.sort==='price-asc') arr.sort((a,b)=> (a.sale||a.price)-(b.sale||b.price));
      else if(state.sort==='price-desc') arr.sort((a,b)=> (b.sale||b.price)-(a.sale||a.price));
      else if(state.sort==='popular') arr.sort((a,b)=> (b.tags.includes('bestseller')?1:0)-(a.tags.includes('bestseller')?1:0));
      else arr.sort((a,b)=> (b.tags.includes('new')?1:0)-(a.tags.includes('new')?1:0));
      return arr;
    }
    function render(){
      const list = sortList(BC_PRODUCTS.filter(matches));
      countEl && (countEl.textContent = list.length + ' ' + (list.length===1?t('product_label'):t('products_label')));
      if(list.length===0){
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <h3>${t('no_products_title')}</h3><p>${t('no_products_text')}</p>
          <button class="btn btn-outline" data-reset-filters>${t('reset_filters')}</button></div>`;
        const rb = grid.querySelector('[data-reset-filters]');
        if(rb) rb.addEventListener('click', ()=>{ state.sizes.clear(); state.colors.clear(); state.max=1400; state.collection=null;
          filterForm && filterForm.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=false); render(); });
        return;
      }
      grid.innerHTML = list.map(productCardHTML).join('');
      bindProductCards(grid);
      initReveal();
    }
    if(sortSel) sortSel.addEventListener('change', ()=>{ state.sort = sortSel.value; render(); });
    if(filterForm){
      filterForm.querySelectorAll('input[name="cat"]').forEach(r=> r.addEventListener('change', ()=>{
        state.category = r.dataset.filterCat || 'all'; render();
      }));
      if(!fixedCategory && state.category !== 'all'){
        const match = filterForm.querySelector(`input[name="cat"][data-filter-cat="${state.category}"]`);
        if(match) match.checked = true;
      }
      filterForm.querySelectorAll('[data-filter-size]').forEach(cb=> cb.addEventListener('change', ()=>{
        cb.checked ? state.sizes.add(cb.value) : state.sizes.delete(cb.value); render();
      }));
      filterForm.querySelectorAll('[data-filter-color]').forEach(sw=> sw.addEventListener('click', ()=>{
        sw.classList.toggle('selected');
        sw.classList.contains('selected') ? state.colors.add(sw.dataset.filterColor) : state.colors.delete(sw.dataset.filterColor);
        render();
      }));
      const priceRange = filterForm.querySelector('[data-filter-price]');
      if(priceRange){
        const out = filterForm.querySelector('[data-price-output]');
        priceRange.addEventListener('input', ()=>{ state.max = +priceRange.value; if(out) out.textContent = bcFormatPrice(state.max); render(); });
      }
    }
    // filter drawer (mobile)
    const fDrawer = document.querySelector('.filter-drawer');
    const fOverlay = document.querySelector('.overlay[data-for="filters"]');
    if(fDrawer){
      document.querySelectorAll('[data-open="filters"]').forEach(b=> b.addEventListener('click', ()=>{ fDrawer.classList.add('open'); fOverlay.classList.add('show'); document.body.classList.add('no-scroll'); }));
      fDrawer.querySelectorAll('[data-close="filters"]').forEach(b=> b.addEventListener('click', ()=>{ fDrawer.classList.remove('open'); fOverlay.classList.remove('show'); document.body.classList.remove('no-scroll'); }));
      fOverlay.addEventListener('click', ()=>{ fDrawer.classList.remove('open'); fOverlay.classList.remove('show'); document.body.classList.remove('no-scroll'); });
    }
    render();
    window.__bcListingRender = render;
  }

  /* ================= PAGE: product detail ================= */
  function initProductPage(){
    const view = document.querySelector('[data-product-view]');
    if(!view) return;
    const params = new URLSearchParams(location.search);
    const p = bcGetProduct(params.get('id')) || BC_PRODUCTS[0];
    document.title = p.name + ' — BENZCOMILANO';

    view.querySelectorAll('[data-p-name]').forEach(el=> el.textContent = p.name);
    const priceEl = view.querySelector('[data-p-price]');
    priceEl.innerHTML = p.sale ? `<span class="was" style="text-decoration:line-through;color:var(--c-gray-500);margin-right:.6em;">${bcFormatPrice(p.price)}</span><span class="now">${bcFormatPrice(p.sale)}</span>` : bcFormatPrice(p.price);
    view.querySelector('[data-p-desc]').textContent = p.desc;

    const mainImg = view.querySelector('[data-p-main-image]');
    mainImg.className = `ph ph-tone-${p.tone}`; mainImg.dataset.ratio = p.ratio;
    mainImg.innerHTML = `${typeIconSVG(p.type)}<span class="ph-label">${p.name}</span>`;

    const thumbWrap = view.querySelector('[data-p-thumbs]');
    thumbWrap.innerHTML = [1,2,3,4].map((n,i)=> `<div class="ph ph-tone-${((p.tone-1+n)%6)+1} ${i===0?'active':''}" data-ratio="portrait" data-thumb="${i}">${typeIconSVG(p.type)}<span class="ph-label">${p.name}</span></div>`).join('');
    thumbWrap.querySelectorAll('[data-thumb]').forEach(t=> t.addEventListener('click', ()=>{
      thumbWrap.querySelectorAll('.ph').forEach(x=>x.classList.remove('active')); t.classList.add('active');
      mainImg.className = t.className.replace('active','').trim();
    }));

    const zoom = document.querySelector('.zoom-lens');
    if(zoom){
      mainImg.addEventListener('click', ()=>{
        zoom.querySelector('.zoom-body').innerHTML = mainImg.outerHTML;
        zoom.classList.add('open');
      });
      zoom.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=> zoom.classList.remove('open')));
    }

    const colorWrap = view.querySelector('[data-p-colors]');
    colorWrap.innerHTML = p.colors.map((c,i)=> `<button class="swatch-btn ${i===0?'selected':''}" style="background:${BC_COLORS[c]}" data-color="${c}" title="${c}"></button>`).join('');
    let selectedColor = p.colors[0];
    colorWrap.querySelectorAll('.swatch-btn').forEach(b=> b.addEventListener('click', ()=>{
      colorWrap.querySelectorAll('.swatch-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selectedColor = b.dataset.color;
    }));

    const sizeWrap = view.querySelector('[data-p-sizes]');
    sizeWrap.innerHTML = p.sizes.map((s,i)=> `<button class="size-btn ${i===0?'selected':''}" data-size="${s}">${s}</button>`).join('');
    let selectedSize = p.sizes[0];
    sizeWrap.querySelectorAll('.size-btn').forEach(b=> b.addEventListener('click', ()=>{
      sizeWrap.querySelectorAll('.size-btn').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selectedSize = b.dataset.size;
    }));

    let qty = 1;
    const qtyEl = view.querySelector('[data-p-qty]');
    view.querySelectorAll('[data-qty-p]').forEach(b=> b.addEventListener('click', ()=>{
      qty = Math.max(1, qty + (b.dataset.qtyP==='inc'?1:-1)); if(qtyEl) qtyEl.textContent = qty;
    }));

    function doAdd(){ addToCart(p.id, selectedColor, selectedSize, qty); }
    view.querySelectorAll('[data-p-add]').forEach(b=> b.addEventListener('click', doAdd));

    const favBtn = view.querySelector('[data-p-wish]');
    if(favBtn){
      favBtn.classList.toggle('active', isWished(p.id));
      favBtn.addEventListener('click', ()=> toggleWishlist(p.id, favBtn));
    }

    // sticky add bar
    const sticky = document.querySelector('.sticky-add');
    if(sticky){
      sticky.querySelector('[data-sticky-price]').textContent = bcFormatPrice(p.sale||p.price);
      sticky.querySelector('[data-p-add]')?.addEventListener('click', doAdd);
    }

    // related products
    renderRail('[data-related-grid]', BC_PRODUCTS.filter(x=> x.category===p.category && x.id!==p.id), 4);
    renderRail('[data-complete-grid]', BC_PRODUCTS.filter(x=> x.category!==p.category), 4);

    window.__bcProductRerender = ()=>{
      renderRail('[data-related-grid]', BC_PRODUCTS.filter(x=> x.category===p.category && x.id!==p.id), 4);
      renderRail('[data-complete-grid]', BC_PRODUCTS.filter(x=> x.category!==p.category), 4);
    };
  }

  /* ================= PAGE: cart ================= */
  function renderCartPage(){
    const wrap = document.querySelector('[data-cart-page]');
    if(!wrap) return;
    const cart = getCart();
    if(cart.length===0){
      wrap.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        <h3>${t('bag_empty_title')}</h3><p>${t('bag_empty_text_page')}</p>
        <a class="btn btn-primary" href="shop.html">${t('continue_shopping')}</a></div>`;
      const summary = document.querySelector('[data-cart-summary]');
      if(summary) summary.style.display='none';
      return;
    }
    const summary = document.querySelector('[data-cart-summary]');
    if(summary) summary.style.display='';
    wrap.innerHTML = cart.map((l,i)=>{
      const p = bcGetProduct(l.id); if(!p) return '';
      return `<div class="cart-line">
        ${phMarkup(p)}
        <div class="meta">
          <div class="name">${p.name}</div>
          <div class="opt">${l.color} / ${l.size}</div>
          <div class="opt">${bcFormatPrice(p.sale||p.price)}</div>
          <div class="qty-row">
            <div class="qty-stepper">
              <button data-qty="dec" data-i="${i}">−</button><span>${l.qty}</span><button data-qty="inc" data-i="${i}">+</button>
            </div>
            <button class="remove-link" data-remove="${i}">${t('remove')}</button>
          </div>
        </div>
      </div>`;
    }).join('');
    wrap.querySelectorAll('[data-qty]').forEach(btn=> btn.addEventListener('click', ()=>{
      const i = +btn.dataset.i; const c = getCart();
      c[i].qty += (btn.dataset.qty==='inc'?1:-1);
      if(c[i].qty<=0) c.splice(i,1);
      setCart(c); renderCartPage(); renderCheckoutSummary();
    }));
    wrap.querySelectorAll('[data-remove]').forEach(btn=> btn.addEventListener('click', ()=>{
      const c = getCart(); c.splice(+btn.dataset.remove,1); setCart(c); renderCartPage(); bcToast(t('toast_removed_bag'));
    }));
    updateCartTotals();
  }
  function updateCartTotals(){
    const cart = getCart();
    const subtotal = cart.reduce((s,l)=>{ const p=bcGetProduct(l.id); return s+(p?(p.sale||p.price)*l.qty:0); },0);
    const shipping = subtotal>100 || subtotal===0 ? 0 : 12;
    document.querySelectorAll('[data-subtotal]').forEach(el=> el.textContent = bcFormatPrice(subtotal));
    document.querySelectorAll('[data-shipping]').forEach(el=> el.textContent = shipping===0? t('free') : bcFormatPrice(shipping));
    document.querySelectorAll('[data-total]').forEach(el=> el.textContent = bcFormatPrice(subtotal+shipping));
  }
  window.renderCartPage = renderCartPage;

  function renderCheckoutSummary(){
    const wrap = document.querySelector('[data-checkout-summary]');
    if(!wrap) return;
    const cart = getCart();
    wrap.innerHTML = cart.map(l=>{
      const p = bcGetProduct(l.id); if(!p) return '';
      return `<div class="cart-line" style="padding-block:.8em;">
        <div class="ph ph-tone-${p.tone}" data-ratio="portrait" style="width:64px;"><span class="ph-label" style="font-size:.7rem;padding:.4em;">${p.name}</span></div>
        <div class="meta"><div class="name" style="font-size:var(--fs-xs);">${p.name} × ${l.qty}</div><div class="opt">${l.color} / ${l.size}</div></div>
        <div style="font-size:var(--fs-sm);">${bcFormatPrice((p.sale||p.price)*l.qty)}</div>
      </div>`;
    }).join('') || `<p style="color:var(--c-gray-500);font-size:var(--fs-sm);">${t('bag_empty_title')}</p>`;
    updateCartTotals();
  }
  window.renderCheckoutSummary = renderCheckoutSummary;

  /* ================= PAGE: wishlist ================= */
  function renderWishlistPage(){
    const grid = document.querySelector('[data-wishlist-grid]');
    if(!grid) return;
    const ids = getWishlist();
    const list = BC_PRODUCTS.filter(p=> ids.includes(p.id));
    if(list.length===0){
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4.5c2 0 3.4 1 4.9 2.7 1.5-1.7 2.9-2.7 4.9-2.7C19 4.5 20.6 8 20 11.7 17.5 16.4 12 21 12 21z"/></svg>
        <h3>${t('wishlist_empty_title')}</h3><p>${t('wishlist_empty_text')}</p>
        <a class="btn btn-primary" href="shop.html">${t('explore_collection')}</a></div>`;
      return;
    }
    grid.innerHTML = list.map(productCardHTML).join('');
    bindProductCards(grid);
  }
  window.renderWishlistPage = renderWishlistPage;

  /* ================= PAGE: search ================= */
  function initSearchPage(){
    const grid = document.querySelector('[data-search-grid]');
    if(!grid) return;
    const input = document.querySelector('[data-search-input]');
    const countEl = document.querySelector('[data-search-count]');
    const params = new URLSearchParams(location.search);
    const q0 = params.get('q') || '';
    if(input) input.value = q0;
    function run(q){
      q = (q||'').trim().toLowerCase();
      if(!q){
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3>${t('search_start_title')}</h3><p>${t('search_start_text')}</p></div>`;
        countEl && (countEl.textContent = '');
        return;
      }
      const list = BC_PRODUCTS.filter(p=> (p.name+' '+p.type+' '+p.category).toLowerCase().includes(q));
      countEl && (countEl.textContent = list.length + ' ' + t('search_results_for') + ' “' + q + '”');
      if(list.length===0){
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <h3>${t('search_no_results_title')}</h3><p>${t('search_no_results_text')}</p></div>`;
        return;
      }
      grid.innerHTML = list.map(productCardHTML).join('');
      bindProductCards(grid);
    }
    if(input){
      input.addEventListener('input', ()=> run(input.value));
      const form = input.closest('form');
      if(form) form.addEventListener('submit', e=> e.preventDefault());
    }
    run(q0);
    window.__bcSearchRun = ()=> run(input ? input.value : q0);
  }

  /* ================= PAGE: account tabs ================= */
  function initAccountTabs(){
    const tabs = document.querySelectorAll('.tabs button');
    if(!tabs.length) return;
    tabs.forEach(btn=> btn.addEventListener('click', ()=>{
      tabs.forEach(b=> b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=> p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(btn.dataset.tabTarget).classList.add('active');
    }));
  }

  /* ---------------- init on DOM ready ---------------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    initAnnounce();
    initMobileMenu();
    initSearchOverlay();
    initCartDrawer();
    initSizeGuide();
    initGenericModals();
    initNewsletter();
    initDemoForms();
    initAccountTabs();
    renderHeaderCounts();

    // home page rails
    renderRail('[data-rail="new"]', BC_PRODUCTS.filter(p=>p.tags.includes('new')), 8);
    renderRail('[data-rail="bestsellers"]', BC_PRODUCTS.filter(p=>p.tags.includes('bestseller')), 4);

    initListingPage();
    initProductPage();
    renderCartPage();
    renderCheckoutSummary();
    renderWishlistPage();
    initSearchPage();

    initLangSwitch();
    translateStaticDom();
    refreshDynamicContent();
    document.documentElement.classList.remove('i18n-pending');

    initReveal();
  });
})();
