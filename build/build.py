# -*- coding: utf-8 -*-
"""Static site assembler for BENZCOMILANO. Run: python build.py
Reads build/pages/*.html (body fragments) and writes final *.html files
into the project root, wrapped with the shared header/footer/drawers shell.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages")
ASSET_V = "9"  # bump on every css/js change during development to bust browser cache

NAV = [
    ("nav_new_in", "NEW IN", "new-in.html", ""),
    ("nav_men", "MEN", "men.html", ""),
    ("nav_women", "WOMEN", "women.html", ""),
    ("nav_collections", "COLLECTIONS", "collections.html", ""),
    ("nav_best_sellers", "BEST SELLERS", "shop.html?collection=best-sellers", ""),
    ("nav_sale", "SALE", "shop.html?collection=sale", "sale"),
]

ICONS = {
    "search": '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    "account": '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    "heart": '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4.5c2 0 3.4 1 4.9 2.7 1.5-1.7 2.9-2.7 4.9-2.7C19 4.5 20.6 8 20 11.7 17.5 16.4 12 21 12 21z"/></svg>',
    "bag": '<svg viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>',
    "menu": '<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    "close": '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    "tiktok": '<svg viewBox="0 0 24 24"><path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.7v2.7c-1.3 0-2.5-.4-3.5-1.1v6.6c0 3-2.4 5.1-5.1 5.1-1.4 0-2.7-.6-3.6-1.6-1.6-1.7-1.7-4.5.1-6.3 1.3-1.3 3.1-1.7 4.7-1.2v2.8c-.4-.2-.9-.3-1.4-.2-1 .2-1.8 1.1-1.8 2.2 0 1.3 1.1 2.3 2.4 2.2 1-.1 1.8-1 1.8-2.1V3h3z"/></svg>',
}

LANGS = [("en", "EN"), ("ar", "عربي"), ("sv", "SV")]

def lang_switch_html(extra_class=""):
    btns = "\n".join(
        f'<button type="button" data-lang="{code}" class="{"active" if code=="en" else ""}">{label}</button>'
        for code, label in LANGS
    )
    return f'<div class="lang-switch {extra_class}" data-lang-switch>{btns}</div>'


def build_shell(title, description, active, body, canonical, body_class=""):
    nav_items = ""
    for key, label, href, extra in NAV:
        classes = []
        if extra:
            classes.append(extra)
        if href.split("?")[0] == active:
            classes.append("active")
        cls_attr = f' class="{" ".join(classes)}"' if classes else ""
        nav_items += f'<li><a href="{href}"{cls_attr} data-i18n="{key}">{label}</a></li>\n'

    mobile_nav_items = ""
    for key, label, href, extra in NAV:
        cls = extra if extra else ""
        cls_attr = f' class="{cls}"' if cls else ""
        mobile_nav_items += f'<li><a href="{href}"{cls_attr} data-i18n="{key}">{label}</a></li>\n'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — BENZCOMILANO</title>
<meta name="description" content="{description}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 font-family=%22Georgia,serif%22>B</text></svg>">
<link rel="stylesheet" href="css/style.css?v={ASSET_V}">
<script>(function(){{try{{var l=localStorage.getItem('bc_lang');if(l){{l=JSON.parse(l);document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';if(l!=='en'){{document.documentElement.classList.add('i18n-pending');}}}}}}catch(e){{}}}})();</script>
</head>
<body class="{body_class}">

<div class="page-watermark" aria-hidden="true"></div>

<div class="announce">
  <span data-i18n="announce_shipping">FREE SHIPPING ON ORDERS OVER &euro;100</span>
  <button aria-label="Dismiss announcement">{ICONS['close']}</button>
</div>

<header class="site-header">
  <div class="container header-bar">
    <div class="header-side left">
      <button class="btn-icon hamburger" data-open="menu" data-i18n-aria="aria_open_menu" aria-label="Open menu">{ICONS['menu']}</button>
      <nav class="main-nav">
        <ul>
        {nav_items}
        </ul>
      </nav>
    </div>
    <a href="index.html" class="logo"><img src="assets/BENZCOMILANO.png" alt="BENZCOMILANO"></a>
    <div class="header-side right">
      {lang_switch_html("lang-switch-desktop")}
      <button class="btn-icon" data-open="search" data-i18n-aria="aria_search" aria-label="Search">{ICONS['search']}</button>
      <a href="account.html" class="btn-icon acct-link" data-i18n-aria="aria_account" aria-label="Account">{ICONS['account']}</a>
      <a href="wishlist.html" class="btn-icon icon-badge wish-link" data-i18n-aria="aria_wishlist" aria-label="Wishlist">{ICONS['heart']}<span class="count" data-wish-count hidden>0</span></a>
      <button class="btn-icon icon-badge" data-open="cart" data-i18n-aria="aria_bag" aria-label="Shopping bag">{ICONS['bag']}<span class="count" data-cart-count hidden>0</span></button>
    </div>
  </div>
</header>

<div class="overlay" data-for="menu"></div>
<nav class="mobile-menu" aria-label="Mobile navigation">
  <div class="close-row"><button class="btn-icon" data-close="menu" data-i18n-aria="aria_close_menu" aria-label="Close menu">{ICONS['close']}</button></div>
  <ul>
  {mobile_nav_items}
  <li><a href="account.html" data-i18n="nav_account">My Account</a></li>
  <li><a href="wishlist.html" data-i18n="nav_wishlist">Wishlist</a></li>
  </ul>
  {lang_switch_html("lang-switch-mobile")}
</nav>

<div class="overlay" data-for="search"></div>
<div class="search-panel">
  <div class="container">
    <form>
      {ICONS['search']}
      <input type="search" placeholder="Search products..." data-i18n-placeholder="search_placeholder" data-i18n-aria="aria_search" aria-label="Search products">
      <button type="button" class="btn-icon" data-close="search" data-i18n-aria="aria_close_search" aria-label="Close search">{ICONS['close']}</button>
    </form>
    <div class="search-suggest">
      <a href="shop.html?category=women" data-i18n="search_suggest_women">Women</a>
      <a href="shop.html?category=men" data-i18n="search_suggest_men">Men</a>
      <a href="shop.html?category=accessories" data-i18n="search_suggest_accessories">Accessories</a>
      <a href="new-in.html" data-i18n="search_suggest_new">New In</a>
      <a href="shop.html?collection=sale" data-i18n="search_suggest_sale">Sale</a>
    </div>
  </div>
</div>

<div class="overlay" data-for="cart"></div>
<aside class="cart-drawer" aria-label="Shopping bag">
  <div class="drawer-head">
    <h3 data-i18n="bag_title">Your Bag</h3>
    <button class="btn-icon" data-close="cart" data-i18n-aria="aria_close_bag" aria-label="Close bag">{ICONS['close']}</button>
  </div>
  <div class="drawer-body"></div>
  <div class="drawer-foot"></div>
</aside>

<main>
{body}
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo"><img src="assets/BENZCOMILANO.png" alt="BENZCOMILANO"></a>
        <p data-i18n="footer_tagline">Italian luxury fashion. Modern minimal silhouettes, crafted with uncompromising attention to detail.</p>
        {lang_switch_html("lang-switch-footer")}
      </div>
      <div class="footer-col">
        <h4 data-i18n="footer_shop">Shop</h4>
        <a href="new-in.html" data-i18n="footer_new_in">New In</a>
        <a href="men.html" data-i18n="footer_men">Men</a>
        <a href="women.html" data-i18n="footer_women">Women</a>
        <a href="collections.html" data-i18n="footer_collections">Collections</a>
        <a href="shop.html?collection=sale" data-i18n="footer_sale">Sale</a>
      </div>
      <div class="footer-col">
        <h4 data-i18n="footer_care">Customer Care</h4>
        <a href="contact.html" data-i18n="footer_contact">Contact Us</a>
        <a href="shipping-returns.html" data-i18n="footer_shipping">Shipping &amp; Returns</a>
        <a href="size-guide.html" data-i18n="footer_size_guide">Size Guide</a>
        <a href="account.html" data-i18n="footer_my_account">My Account</a>
      </div>
      <div class="footer-col">
        <h4 data-i18n="footer_company">Company</h4>
        <a href="about.html" data-i18n="footer_about">About BENZCOMILANO</a>
        <a href="contact.html" data-i18n="footer_contact2">Contact</a>
      </div>
      <div class="footer-col">
        <h4 data-i18n="footer_legal">Legal</h4>
        <a href="privacy.html" data-i18n="footer_privacy">Privacy Policy</a>
        <a href="terms.html" data-i18n="footer_terms">Terms &amp; Conditions</a>
      </div>
    </div>
    <div class="footer-bottom">
      <small data-i18n="footer_copyright">&copy; 2026 BENZCOMILANO. All rights reserved.</small>
      <div class="social-row">
        <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>
        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 9h3V6h-3c-2 0-3 1-3 3v2H9v3h2v6h3v-6h3l1-3h-4V9c0-.5.3-1 1-1z"/></svg></a>
        <a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 17l2-9c-1 0-2 1-2 2.5S10 13 11 13c2 0 3.5-1.8 3.5-4 0-1.8-1.5-3-3.3-3-2.3 0-3.9 1.7-3.9 3.6 0 .8.3 1.4.7 1.9"/></svg></a>
        <a href="https://www.tiktok.com/@benzcostock" target="_blank" rel="noopener" aria-label="TikTok">{ICONS['tiktok']}</a>
      </div>
    </div>
  </div>
</footer>

<div class="modal sizeguide-modal" aria-label="Size guide">
  <button class="btn-icon modal-close" data-close-modal aria-label="Close">{ICONS['close']}</button>
  <h3 data-i18n="sizeguide_title">Size Guide</h3>
  <div class="table-wrap">
    <table class="size-table">
      <thead><tr><th data-i18n="sizeguide_size">Size</th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th></tr></thead>
      <tbody>
        <tr><td data-i18n="sizeguide_chest">Chest (cm)</td><td>82</td><td>86</td><td>92</td><td>98</td><td>104</td></tr>
        <tr><td data-i18n="sizeguide_waist">Waist (cm)</td><td>62</td><td>66</td><td>72</td><td>78</td><td>84</td></tr>
        <tr><td data-i18n="sizeguide_hips">Hips (cm)</td><td>88</td><td>92</td><td>98</td><td>104</td><td>110</td></tr>
      </tbody>
    </table>
  </div>
  <p style="font-size:var(--fs-sm);color:var(--c-gray-700);" data-i18n="sizeguide_note">All measurements are body measurements taken in centimeters. If you are between sizes, we recommend sizing up for a relaxed fit.</p>
</div>

<div class="zoom-lens">
  <button class="btn-icon close" data-close aria-label="Close zoom">{ICONS['close']}</button>
  <div class="zoom-body"></div>
</div>

<script src="js/products.js?v={ASSET_V}"></script>
<script src="js/i18n.js?v={ASSET_V}"></script>
<script src="js/main.js?v={ASSET_V}"></script>
</body>
</html>
"""


PAGES = [
    ("index", "Home", "index.html", "BENZCOMILANO — Italian Luxury Fashion. Modern minimal ready-to-wear for men and women."),
    ("shop", "Shop", "shop.html", "Shop the full BENZCOMILANO collection of men's and women's ready-to-wear and accessories."),
    ("men", "Men", "men.html", "BENZCOMILANO Men — tailored outerwear, knitwear and accessories."),
    ("women", "Women", "women.html", "BENZCOMILANO Women — tailored ready-to-wear, dresses and accessories."),
    ("new-in", "New In", "new-in.html", "The latest arrivals from BENZCOMILANO."),
    ("collections", "Collections", "collections.html", "Explore the BENZCOMILANO seasonal collections and lookbooks."),
    ("product", "Product", "product.html", "Discover the craftsmanship behind every BENZCOMILANO piece."),
    ("cart", "Shopping Bag", "cart.html", "Review the items in your BENZCOMILANO shopping bag."),
    ("checkout", "Checkout", "checkout.html", "Secure checkout at BENZCOMILANO."),
    ("wishlist", "Wishlist", "wishlist.html", "Your saved BENZCOMILANO favorites."),
    ("search", "Search", "search.html", "Search the BENZCOMILANO collection."),
    ("account", "Account", "account.html", "Manage your BENZCOMILANO account and orders."),
    ("about", "About Us", "about.html", "The story of BENZCOMILANO — Italian craftsmanship, modern attitude."),
    ("contact", "Contact", "contact.html", "Get in touch with the BENZCOMILANO client care team."),
    ("shipping-returns", "Shipping & Returns", "shipping-returns.html", "BENZCOMILANO shipping, delivery and returns policy."),
    ("size-guide", "Size Guide", "size-guide.html", "Find your perfect fit with the BENZCOMILANO size guide."),
    ("privacy", "Privacy Policy", "privacy.html", "BENZCOMILANO privacy policy."),
    ("terms", "Terms & Conditions", "terms.html", "BENZCOMILANO terms and conditions."),
]

BODY_CLASS = {
    "index": "page-home",
    "product": "page-product",
}

if __name__ == "__main__":
    for key, title, filename, desc in PAGES:
        frag_path = os.path.join(PAGES_DIR, key + ".html")
        with open(frag_path, "r", encoding="utf-8") as f:
            body = f.read()
        active = filename
        html = build_shell(title, desc, active, body, filename, BODY_CLASS.get(key, ""))
        out_path = os.path.join(ROOT, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("built", filename)
    print("Done.")
