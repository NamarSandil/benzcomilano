/* BENZCOMILANO — product catalogue (demo data) */
const BC_COLORS = {
  black:'#0e0e0d', white:'#ffffff', beige:'#ded4c3', charcoal:'#4b463f', camel:'#b08d5e', ivory:'#f3efe6', navy:'#232a35', burgundy:'#5c2530'
};

const BC_PRODUCTS = [
  { id:'p01', name:'Wool Tailored Blazer', category:'women', type:'Outerwear', price:690, sale:null, tone:1, ratio:'portrait', colors:['black','beige'], sizes:['XS','S','M','L'], tags:['new'], desc:'A precisely tailored blazer cut from Italian virgin wool, defined by clean lapels and a sculpted silhouette.' },
  { id:'p02', name:'Silk Slip Dress', category:'women', type:'Dresses', price:520, sale:null, tone:2, ratio:'portrait', colors:['ivory','black'], sizes:['XS','S','M','L'], tags:['bestseller'], desc:'Fluid silk dress cut on the bias for a fluid drape and understated shine.' },
  { id:'p03', name:'Cashmere Crewneck', category:'women', type:'Knitwear', price:380, sale:410, tone:3, ratio:'portrait', colors:['beige','charcoal'], sizes:['XS','S','M','L','XL'], tags:['sale'], desc:'Pure cashmere knit with a relaxed fit, ideal for effortless layering.' },
  { id:'p04', name:'Leather Trench Coat', category:'women', type:'Outerwear', price:1290, sale:null, tone:4, ratio:'portrait', colors:['black'], sizes:['S','M','L'], tags:['new'], desc:'Full-grain leather trench with a belted waist and fluid movement.' },
  { id:'p05', name:'Pleated Midi Skirt', category:'women', type:'Skirts', price:340, sale:null, tone:5, ratio:'portrait', colors:['beige','black'], sizes:['XS','S','M','L'], tags:[], desc:'Precisely pleated midi skirt in a fluid Italian crepe.' },
  { id:'p06', name:'Tailored Wide Trousers', category:'women', type:'Trousers', price:410, sale:null, tone:6, ratio:'portrait', colors:['charcoal','ivory'], sizes:['XS','S','M','L'], tags:['bestseller'], desc:'High-waisted wide-leg trousers with a fluid Italian wool drape.' },
  { id:'p07', name:'Structured Wool Coat', category:'men', type:'Outerwear', price:990, sale:null, tone:1, ratio:'portrait', colors:['charcoal','black'], sizes:['S','M','L','XL'], tags:['new'], desc:'Structured double-face wool coat with a clean, architectural line.' },
  { id:'p08', name:'Cotton Poplin Shirt', category:'men', type:'Shirts', price:190, sale:null, tone:2, ratio:'portrait', colors:['white','beige'], sizes:['S','M','L','XL'], tags:['bestseller'], desc:'Crisp cotton poplin shirt with a modern slim collar.' },
  { id:'p09', name:'Merino Wool Sweater', category:'men', type:'Knitwear', price:290, sale:250, tone:3, ratio:'portrait', colors:['navy','charcoal'], sizes:['S','M','L','XL'], tags:['sale'], desc:'Fine-gauge merino sweater with a ribbed hem and cuffs.' },
  { id:'p10', name:'Tailored Wool Trousers', category:'men', type:'Trousers', price:330, sale:null, tone:4, ratio:'portrait', colors:['black','charcoal'], sizes:['S','M','L','XL'], tags:[], desc:'Slim tailored trousers in fluid Italian wool.' },
  { id:'p11', name:'Suede Chelsea Boots', category:'men', type:'Shoes', price:450, sale:null, tone:5, ratio:'square', colors:['camel','black'], sizes:['40','41','42','43','44'], tags:['new'], desc:'Hand-finished suede Chelsea boots on a sleek leather sole.' },
  { id:'p12', name:'Leather Biker Jacket', category:'men', type:'Outerwear', price:1190, sale:null, tone:6, ratio:'portrait', colors:['black'], sizes:['S','M','L','XL'], tags:['bestseller'], desc:'Classic biker jacket in supple lamb leather with asymmetric zip.' },
  { id:'p13', name:'Leather Tote Bag', category:'accessories', type:'Bags', price:790, sale:null, tone:1, ratio:'square', colors:['black','camel'], sizes:['One Size'], tags:['new'], desc:'Structured tote in smooth calf leather with an interior zip pocket.' },
  { id:'p14', name:'Silk Twill Scarf', category:'accessories', type:'Scarves', price:150, sale:null, tone:2, ratio:'square', colors:['beige','burgundy'], sizes:['One Size'], tags:[], desc:'Hand-rolled silk twill scarf, printed in Como, Italy.' },
  { id:'p15', name:'Leather Ankle Boots', category:'women', type:'Shoes', price:520, sale:null, tone:3, ratio:'square', colors:['black'], sizes:['36','37','38','39','40'], tags:['bestseller'], desc:'Sculpted ankle boots in nappa leather with a stacked heel.' },
  { id:'p16', name:'Cashmere Scarf', category:'accessories', type:'Scarves', price:220, sale:190, tone:4, ratio:'square', colors:['ivory','charcoal'], sizes:['One Size'], tags:['sale'], desc:'Oversized cashmere scarf, soft to the touch, woven in Biella.' },
  { id:'p17', name:'Silk Blouse', category:'women', type:'Shirts', price:310, sale:null, tone:5, ratio:'portrait', colors:['ivory','black'], sizes:['XS','S','M','L'], tags:['new'], desc:'Fluid silk blouse with a relaxed fit and mother-of-pearl buttons.' },
  { id:'p18', name:'Linen Blend Blazer', category:'men', type:'Outerwear', price:590, sale:null, tone:6, ratio:'portrait', colors:['beige','navy'], sizes:['S','M','L','XL'], tags:[], desc:'Unstructured linen-blend blazer, breathable and softly tailored.' },
  { id:'p19', name:'Leather Belt', category:'accessories', type:'Belts', price:160, sale:null, tone:1, ratio:'square', colors:['black','camel'], sizes:['S','M','L'], tags:[], desc:'Full-grain leather belt with a brushed metal buckle.' },
  { id:'p20', name:'Wool Midi Dress', category:'women', type:'Dresses', price:460, sale:null, tone:2, ratio:'portrait', colors:['charcoal','burgundy'], sizes:['XS','S','M','L'], tags:['new'], desc:'Fitted wool-crepe midi dress with a fluid, body-conscious cut.' },
  { id:'p21', name:'Cotton Chino Trousers', category:'men', type:'Trousers', price:210, sale:180, tone:3, ratio:'portrait', colors:['beige','navy'], sizes:['S','M','L','XL'], tags:['sale'], desc:'Slim cotton chinos with a soft, brushed hand-feel.' },
  { id:'p22', name:'Leather Loafers', category:'men', type:'Shoes', price:390, sale:null, tone:4, ratio:'square', colors:['black','camel'], sizes:['40','41','42','43','44'], tags:['bestseller'], desc:'Hand-stitched penny loafers in polished calf leather.' },
  { id:'p23', name:'Sunglasses', category:'accessories', type:'Eyewear', price:240, sale:null, tone:5, ratio:'square', colors:['black'], sizes:['One Size'], tags:['new'], desc:'Acetate sunglasses with a subtle Italian keyhole bridge.' },
  { id:'p24', name:'Cropped Wool Jacket', category:'women', type:'Outerwear', price:610, sale:null, tone:6, ratio:'portrait', colors:['black','beige'], sizes:['XS','S','M','L'], tags:['bestseller'], desc:'Cropped bouclé wool jacket with hand-finished edges.' }
];

function bcGetProduct(id){ return BC_PRODUCTS.find(p=>p.id===id); }
function bcFormatPrice(n){ return '€' + n.toLocaleString('en-US'); }
