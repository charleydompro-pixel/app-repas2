import React, { useState, useMemo, useEffect } from "react";
import {
  Home, CalendarDays, ShoppingCart, ChefHat, Users,
  Plus, Minus, Check, X, ChevronRight, ChevronLeft, ArrowLeft,
  Sparkles, Recycle, Moon, Sun, Trash2, Wallet, ShieldCheck,
  MessageCircle, ArrowBigUp, Radio, Bell, Flag, Camera, Lock,
  Heart, BarChart3, Crown, AlertCircle, RefreshCw, Inbox, Clock,
} from "lucide-react";

/* ==================================================================
   1. Design tokens
   ================================================================== */

const T = (dark) =>
  dark
    ? { paper:"#12201A", card:"#1B2E25", cardAlt:"#16271F", ink:"#EAF1EA",
        inkSoft:"#9FB4A6", line:"#2A4335", leaf:"#7FD1A2", leafSoft:"#1E3A2C",
        citron:"#C9E265", apricot:"#F0A86A", alert:"#E87F6B", onLeaf:"#0E1F16" }
    : { paper:"#EDF1E8", card:"#FFFFFF", cardAlt:"#F5F8F1", ink:"#14261C",
        inkSoft:"#5F7468", line:"#DDE4D6", leaf:"#2E6B4B", leafSoft:"#DCEBE0",
        citron:"#8FAA2E", apricot:"#B4661F", alert:"#B8412A", onLeaf:"#FFFFFF" };

const NUM = { fontFamily:"Georgia, 'Iowan Old Style', serif", fontVariantNumeric:"tabular-nums" };
const UI  = { fontFamily:"system-ui, -apple-system, 'Segoe UI', sans-serif" };

/* ==================================================================
   2. Catalogue
   ================================================================== */

const ING = {
  tomate:{n:"Tomates",c:"Fruits & légumes",u:"",p:0.45}, courgette:{n:"Courgettes",c:"Fruits & légumes",u:"",p:0.80},
  carotte:{n:"Carottes",c:"Fruits & légumes",u:"",p:0.25}, oignon:{n:"Oignons",c:"Fruits & légumes",u:"",p:0.30},
  ail:{n:"Ail",c:"Fruits & légumes",u:"gousses",p:0.10}, salade:{n:"Salade",c:"Fruits & légumes",u:"",p:1.20},
  banane:{n:"Bananes",c:"Fruits & légumes",u:"",p:0.35}, citron:{n:"Citron",c:"Fruits & légumes",u:"",p:0.50},
  epinard:{n:"Épinards",c:"Fruits & légumes",u:"g",p:0.006}, pdt:{n:"Pommes de terre",c:"Fruits & légumes",u:"g",p:0.0018},
  poulet:{n:"Poulet",c:"Viandes & poissons",u:"g",p:0.0095}, thon:{n:"Thon en boîte",c:"Viandes & poissons",u:"boîte",p:1.60},
  oeuf:{n:"Œufs",c:"Produits frais",u:"",p:0.38}, yaourt:{n:"Yaourts",c:"Produits frais",u:"",p:0.45},
  lait:{n:"Lait",c:"Produits frais",u:"cl",p:0.012}, fromage:{n:"Fromage râpé",c:"Produits frais",u:"g",p:0.011},
  feta:{n:"Feta",c:"Produits frais",u:"g",p:0.014},
  riz:{n:"Riz",c:"Épicerie",u:"g",p:0.0019}, pates:{n:"Pâtes",c:"Épicerie",u:"g",p:0.0026},
  pois:{n:"Pois chiches",c:"Épicerie",u:"boîte",p:0.95}, lentille:{n:"Lentilles",c:"Épicerie",u:"g",p:0.0035},
  concasse:{n:"Tomates concassées",c:"Épicerie",u:"boîte",p:0.85}, coco:{n:"Lait de coco",c:"Épicerie",u:"boîte",p:1.40},
  soja:{n:"Sauce soja",c:"Épicerie",u:"cl",p:0.08}, curry:{n:"Curry",c:"Épicerie",u:"c. à c.",p:0.10},
  huile:{n:"Huile d'olive",c:"Épicerie",u:"cl",p:0.09}, farine:{n:"Farine",c:"Épicerie",u:"g",p:0.0012},
  tortilla:{n:"Tortillas",c:"Épicerie",u:"",p:0.35}, avoine:{n:"Flocons d'avoine",c:"Épicerie",u:"g",p:0.0032},
  semoule:{n:"Semoule",c:"Épicerie",u:"g",p:0.0022},
};

const CAT_ORDER = ["Fruits & légumes","Viandes & poissons","Produits frais","Épicerie"];
const CAT_EMOJI = {"Fruits & légumes":"🥬","Viandes & poissons":"🥩","Produits frais":"🥛","Épicerie":"🥫"};

/** Contrainte dure : un allergène déclaré exclut tout ingrédient de sa liste. */
const ALLERGEN_ING = {
  "Gluten":["pates","farine","semoule","tortilla","avoine"],
  "Lait":["lait","fromage","feta","yaourt"],
  "Œufs":["oeuf"], "Poisson":["thon"], "Soja":["soja"],
  "Arachides":[], "Fruits à coque":[], "Crustacés":[],
};

/* m = créneaux possibles */
const RECIPES = [
  { id:"oats", n:"Overnight oats banane", e:"🥣", t:5, d:"Facile", veg:true, vegan:false, m:["matin"],
    ing:{avoine:60,lait:15,yaourt:1,banane:1},
    steps:["Mélange flocons, lait et yaourt dans un bocal.","Ajoute la banane en rondelles.","Laisse au frais une nuit."] },
  { id:"tartine", n:"Tartines à l'œuf", e:"🍞", t:8, d:"Facile", veg:true, vegan:false, m:["matin"],
    ing:{oeuf:2,farine:60,tomate:0.5,huile:1},
    steps:["Fais griller le pain.","Cuis les œufs au plat.","Dépose sur les tartines avec la tomate."] },
  { id:"pates", n:"Pâtes crémeuses aux légumes", e:"🍝", t:20, d:"Facile", veg:true, vegan:false, m:["midi","soir"],
    ing:{pates:110,courgette:0.7,tomate:2,ail:1,fromage:25,huile:1},
    steps:["Fais cuire les pâtes.","Poêle courgettes et tomates avec l'ail.","Mélange, ajoute le fromage hors du feu."] },
  { id:"wrap", n:"Wraps végétariens", e:"🌯", t:15, d:"Facile", veg:true, vegan:false, m:["midi","soir"],
    ing:{tortilla:2,pois:0.4,salade:0.25,tomate:1,feta:30,citron:0.2},
    steps:["Écrase les pois chiches avec le citron.","Garnis les tortillas.","Roule serré et coupe en deux."] },
  { id:"poulet", n:"Poulet, riz et légumes", e:"🍗", t:30, d:"Facile", veg:false, vegan:false, m:["midi","soir"],
    ing:{poulet:130,riz:80,carotte:1.5,oignon:0.5,huile:1.5},
    steps:["Fais cuire le riz.","Saisis le poulet avec l'oignon.","Ajoute les carottes, mijote 10 min."] },
  { id:"omelette", n:"Omelette et salade", e:"🍳", t:10, d:"Facile", veg:true, vegan:false, m:["midi","soir"],
    ing:{oeuf:2.5,fromage:20,salade:0.3,tomate:1,huile:1},
    steps:["Bats les œufs avec le fromage.","Cuis à feu doux 4 min.","Sers avec la salade assaisonnée."] },
  { id:"bowl", n:"Bowl de pois chiches rôtis", e:"🥗", t:25, d:"Facile", veg:true, vegan:true, m:["midi","soir"],
    ing:{pois:0.6,riz:70,carotte:1,epinard:50,citron:0.3,huile:1.5},
    steps:["Rôtis les pois chiches 20 min.","Prépare le riz.","Assemble avec les crudités et le citron."] },
  { id:"curry", n:"Curry de légumes au coco", e:"🍛", t:30, d:"Moyen", veg:true, vegan:true, m:["midi","soir"],
    ing:{coco:0.5,courgette:1,carotte:1,oignon:0.5,riz:80,curry:2,ail:1},
    steps:["Fais revenir oignon, ail et curry.","Ajoute les légumes puis le coco.","Mijote 20 min, sers avec le riz."] },
  { id:"tomate", n:"Pâtes sauce tomate maison", e:"🍅", t:20, d:"Facile", veg:true, vegan:true, m:["midi","soir"],
    ing:{pates:110,concasse:0.5,oignon:0.5,ail:1,huile:1.5},
    steps:["Fais revenir l'oignon et l'ail.","Ajoute les tomates, mijote 15 min.","Mélange aux pâtes."] },
  { id:"saute", n:"Riz sauté aux œufs", e:"🍚", t:15, d:"Facile", veg:true, vegan:false, m:["midi","soir"],
    ing:{riz:80,oeuf:2,carotte:1,oignon:0.5,soja:2,huile:1},
    steps:["Fais sauter les légumes à feu vif.","Ajoute le riz et la sauce soja.","Casse les œufs dessus, mélange 2 min."] },
  { id:"pizza", n:"Pizza maison", e:"🍕", t:45, d:"Moyen", veg:true, vegan:false, m:["soir"],
    ing:{farine:120,concasse:0.4,fromage:40,tomate:1,huile:1},
    steps:["Pétris la pâte, laisse lever 30 min.","Étale sauce et fromage.","Four très chaud, 10 min."] },
  { id:"lentille", n:"Salade de lentilles et feta", e:"🥣", t:25, d:"Facile", veg:true, vegan:false, m:["midi"],
    ing:{lentille:80,feta:30,tomate:1.5,oignon:0.3,citron:0.3,huile:1.5},
    steps:["Cuis les lentilles 20 min.","Coupe tomates et oignon.","Mélange tiède avec la feta."] },
  { id:"wrapP", n:"Wrap au poulet", e:"🌮", t:15, d:"Facile", veg:false, vegan:false, m:["midi","soir"],
    ing:{tortilla:2,poulet:100,salade:0.25,tomate:1,fromage:20},
    steps:["Émince et saisis le poulet.","Garnis les tortillas.","Roule et fais dorer 1 min."] },
  { id:"taboule", n:"Taboulé express", e:"🥙", t:12, d:"Facile", veg:true, vegan:true, m:["midi"],
    ing:{semoule:80,tomate:1.5,citron:0.4,oignon:0.3,huile:1.5},
    steps:["Verse l'eau bouillante sur la semoule.","Laisse gonfler 5 min.","Ajoute les légumes et le citron."] },
  { id:"gratin", n:"Gratin de pommes de terre", e:"🥔", t:45, d:"Facile", veg:true, vegan:false, m:["soir"],
    ing:{pdt:200,lait:15,fromage:35,ail:1},
    steps:["Coupe les pommes de terre en fines lamelles.","Alterne avec lait et fromage.","Four 180°C, 40 min."] },
  { id:"thon", n:"Salade de pâtes au thon", e:"🐟", t:15, d:"Facile", veg:false, vegan:false, m:["midi"],
    ing:{pates:100,thon:0.5,tomate:1.5,oignon:0.3,huile:1.5,citron:0.3},
    steps:["Cuis les pâtes, refroidis-les.","Émiette le thon.","Mélange avec les légumes et l'huile."] },
  { id:"soupe", n:"Soupe de lentilles corail", e:"🍲", t:25, d:"Facile", veg:true, vegan:true, m:["soir"],
    ing:{lentille:70,carotte:1.5,oignon:0.5,curry:1,coco:0.3,ail:1},
    steps:["Fais revenir oignon, ail et curry.","Ajoute lentilles, carottes et eau.","Mijote 20 min, mixe."] },
  { id:"riz-pois", n:"Riz aux pois chiches et épinards", e:"🍚", t:20, d:"Facile", veg:true, vegan:true, m:["midi","soir"],
    ing:{riz:85,pois:0.5,epinard:60,ail:1,citron:0.3,huile:1.5},
    steps:["Cuis le riz.","Fais tomber les épinards avec l'ail.","Ajoute les pois chiches et le citron."] },
];

const R = (id) => RECIPES.find((r) => r.id === id);
const DAY_NAMES = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const SLOT_LABEL = { matin:"Petit-déjeuner", midi:"Déjeuner", soir:"Dîner" };

/* ==================================================================
   3. Logique métier
   ================================================================== */

const euro = (v) => v.toFixed(2).replace(".", ",") + " €";
const UNCERTAINTY = 0.12;   // fourchette affichée
const SAFETY = 0.88;        // marge du générateur

const cost = (r) => Object.entries(r.ing).reduce((s,[k,q]) => s + q*ING[k].p, 0);

function blockedIngredients(allergies) {
  return new Set(allergies.flatMap((a) => ALLERGEN_ING[a] || []));
}

/** Contraintes dures : jamais pondérées, jamais assouplies. */
function eligibleRecipes({ diet, allergies, maxTime }) {
  const blocked = blockedIngredients(allergies);
  return RECIPES.filter((r) => {
    if (r.t > maxTime) return false;
    if (Object.keys(r.ing).some((k) => blocked.has(k))) return false;
    if (diet === "Végan") return r.vegan;
    if (diet === "Végétarien") return r.veg;
    return true;
  });
}

/**
 * Générateur glouton sous contrainte de budget.
 * Le budget est une contrainte d'entrée : si le catalogue ne permet pas de
 * tenir, on refuse de générer et on dit pourquoi. Jamais de planning hors budget.
 */
function generatePlan(opts) {
  const { days, slots, budget, household, pantry = [], seed = 0 } = opts;
  const pool = eligibleRecipes(opts);

  if (pool.length < 3) {
    return { error:{ code:"NOT_ENOUGH_RECIPES",
      message:"Tes restrictions laissent trop peu de recettes disponibles. Assouplis une contrainte pour continuer." } };
  }

  const cooked = days * slots.length - Math.floor(days / 3);
  const floor = Math.min(...pool.map(cost)) * household * cooked;
  if (floor > budget) {
    return { error:{ code:"BUDGET_TOO_LOW", min:Math.ceil(floor),
      message:`Avec ${cooked} repas pour ${household} personne${household>1?"s":""}, il faut compter au moins ${euro(floor)}. Réduis la durée ou augmente ton budget.` } };
  }

  const target = budget * SAFETY;
  const committed = new Set(pantry);
  const used = new Map();
  let spent = 0;
  const plan = [];

  for (let d = 0; d < days; d++) {
    const day = {};
    for (const slot of slots) {
      // Un déjeuner « restes » tous les trois jours : réaliste, et gratuit.
      if (slot === "midi" && d > 0 && d % 3 === 2) { day[slot] = "restes"; continue; }

      const candidates = pool.filter((r) => r.m.includes(slot));
      const list = candidates.length ? candidates : pool;
      const slotsLeft = Math.max(1, days*slots.length - plan.length*slots.length);
      const perSlot = Math.max(1, (target - spent) / slotsLeft);

      let best = null, bestScore = -Infinity;
      for (const r of list) {
        const keys = Object.keys(r.ing);
        const reused = keys.filter((k) => committed.has(k)).length / keys.length;
        const mealCost = cost(r) * household;
        const fit = 1 - Math.min(2, mealCost / perSlot) / 2;
        const seen = used.get(r.id) || 0;
        const jitter = ((r.id.charCodeAt(0) * 7 + seed * 13) % 11) / 11 * 6;
        const score = reused*40 + fit*25 - seen*45 + (1 - r.t/opts.maxTime)*10 + jitter;
        if (score > bestScore) { bestScore = score; best = r; }
      }

      day[slot] = best.id;
      spent += cost(best) * household;
      used.set(best.id, (used.get(best.id) || 0) + 1);
      Object.keys(best.ing).forEach((k) => committed.add(k));
    }
    plan.push(day);
  }

  return { plan, slots, total:spent };
}

/** Verrouille les jours passés, remplace la suite par le moins cher possible. */
function rebalance(plan, slots, fromDay, opts) {
  const pool = eligibleRecipes(opts).sort((a,b) => cost(a) - cost(b));
  return plan.map((day, i) => {
    if (i <= fromDay) return day;
    const next = {};
    slots.forEach((slot, j) => {
      if (day[slot] === "restes") { next[slot] = "restes"; return; }
      const cand = pool.filter((r) => r.m.includes(slot));
      const src = cand.length ? cand : pool;
      next[slot] = src[(i + j) % Math.min(3, src.length)].id;
    });
    return next;
  });
}

function buildList(plan, slots, household) {
  const agg = {};
  plan.forEach((d) => slots.forEach((s) => {
    const r = R(d[s]); if (!r) return;
    Object.entries(r.ing).forEach(([k,q]) => { agg[k] = (agg[k]||0) + q*household; });
  }));
  return Object.entries(agg).map(([k,q]) => ({
    id:k, name:ING[k].n, cat:ING[k].c, unit:ING[k].u,
    qty:Math.ceil(q*10)/10, price:q*ING[k].p,
  }));
}

function waste(plan, slots) {
  let occ = 0; const seen = new Set();
  plan.forEach((d) => slots.forEach((s) => {
    const r = R(d[s]); if (!r) return;
    Object.keys(r.ing).forEach((k) => { occ++; seen.add(k); });
  }));
  if (!occ) return { reuse:0, score:"0.0" };
  const reuse = 1 - seen.size/occ;
  return { reuse:Math.round(reuse*100), score:Math.min(10, reuse*10+1.2).toFixed(1) };
}

const planCost = (plan, slots, h) =>
  plan.reduce((s,d) => s + slots.reduce((t,k) => t + (R(d[k]) ? cost(R(d[k]))*h : 0), 0), 0);

/* ==================================================================
   4. Données communauté (démo)
   ================================================================== */

const PROFILES = {
  lea:{ n:"Léa M.", a:"👩‍🍳", cert:true, label:"Créatrice culinaire" },
  karim:{ n:"Karim B.", a:"🧑‍⚕️", cert:true, label:"Diététicien (ADELI)" },
  sofia:{ n:"Sofia", a:"🙋‍♀️", cert:false }, tom:{ n:"Tom", a:"🧑", cert:false },
  ines:{ n:"Inès", a:"👧", cert:false }, moi:{ n:"Toi", a:"🙂", cert:false },
};

const SPACES = [
  { s:"tous", n:"Tout", e:"✨" }, { s:"budget", n:"Petit budget", e:"💰" },
  { s:"batch", n:"Batch cooking", e:"🥘" }, { s:"veg", n:"Végétarien", e:"🌱" },
  { s:"nutrition", n:"Questions nutrition", e:"🩺", certifiedOnly:true },
];

const SEED_POSTS = [
  { id:1, space:"budget", author:"tom", title:"Mon dahl à 0,80 € la portion",
    body:"Lentilles corail, lait de coco, oignon, curry. Je fais une grosse marmite le dimanche, ça me tient quatre repas. Le secret c'est d'acheter les lentilles en sac d'un kilo, pas en boîte.",
    votes:127, comments:23, ago:"il y a 3 h", recipe:{ title:"Dahl de lentilles corail", verified:false } },
  { id:2, space:"nutrition", author:"karim", title:"Non, les protéines végétales ne sont pas « incomplètes »",
    body:"Je vois passer beaucoup d'inquiétudes ici. Sur une journée complète, l'association céréales et légumineuses couvre tous les acides aminés essentiels. Pas besoin de les combiner au même repas.",
    votes:214, comments:41, ago:"il y a 6 h" },
  { id:3, space:"batch", author:"lea", title:"Une base de sauce tomate pour cinq dîners",
    body:"Je fais deux litres le dimanche soir. Lundi pâtes, mardi pizza, jeudi shakshuka, vendredi gratin. Une seule casserole à laver dans la semaine.",
    votes:98, comments:15, ago:"hier", recipe:{ title:"Sauce tomate base", verified:true } },
  { id:4, space:"budget", author:"sofia", title:"Comment vous faites pour tenir à 40 € par semaine à deux ?",
    body:"Je tourne à 65 € et je n'arrive pas à descendre. Je cuisine déjà tout maison. Où est-ce que ça part chez vous ?",
    votes:56, comments:38, ago:"hier" },
  { id:5, space:"veg", author:"ines", title:"Le tofu revient moins cher que je pensais",
    body:"J'ai comparé au kilo de protéines : 400 g de tofu à 2,20 € contre 400 g de poulet à 4 €. Par contre il faut savoir le cuisiner, sinon c'est triste.",
    votes:34, comments:12, ago:"il y a 2 j" },
];

const LIVES = [
  { id:1, host:"lea", title:"Batch cooking du dimanche : 5 dîners en 90 minutes",
    when:"Dimanche 20 sept · 17 h", cat:"Atelier", registered:184, status:"SCHEDULED", cover:"🥘" },
  { id:2, host:"karim", title:"Vos questions nutrition, en direct",
    when:"Mardi 22 sept · 19 h", cat:"Questions-réponses", registered:97, status:"SCHEDULED", cover:"🩺" },
  { id:3, host:"lea", title:"Trois plats à moins d'un euro la portion",
    when:"Diffusé le 7 sept", cat:"Atelier", registered:312, status:"REPLAY", cover:"💰" },
];

const NOTIF_TOPICS = [
  { k:"courses", l:"Rappel de courses", d:"La veille de ton jour de courses habituel" },
  { k:"prep", l:"Rappel de préparation", d:"Quand une recette demande du trempage ou du repos" },
  { k:"budget", l:"Alerte budget", d:"Quand tu approches de ta limite hebdomadaire" },
  { k:"expiry", l:"Aliment bientôt périmé", d:"Deux jours avant la date" },
  { k:"plan", l:"Planning à générer", d:"Le samedi matin" },
  { k:"community", l:"Communauté", d:"Réponses à tes messages et sessions à venir" },
];

const SEED_NOTIFS = [
  { id:1, topic:"budget", title:"Tu as utilisé 73 % de ton budget", body:"Il te reste 16,28 € pour trois jours.", ago:"il y a 2 h", unread:true },
  { id:2, topic:"expiry", title:"Tes épinards périment jeudi", body:"Trois recettes de ton catalogue les utilisent.", ago:"hier", unread:true },
  { id:3, topic:"community", title:"Léa publie dimanche", body:"Batch cooking du dimanche : 5 dîners en 90 minutes.", ago:"il y a 2 j", unread:false },
];

/* Historique pour les statistiques : prévu contre réel. */
const HISTORY = [
  { w:"S-5", planned:60, actual:71.4 }, { w:"S-4", planned:60, actual:66.2 },
  { w:"S-3", planned:60, actual:61.9 }, { w:"S-2", planned:60, actual:58.4 },
  { w:"S-1", planned:60, actual:56.1 },
];

/* ==================================================================
   5. Composants
   ================================================================== */

const Card = ({ c, children, style, ...p }) => (
  <div {...p} style={{ background:c.card, borderRadius:18, border:`1px solid ${c.line}`, ...style }}>{children}</div>
);

const Bar = ({ c, pct, color }) => (
  <div style={{ height:10, borderRadius:99, background:c.leafSoft, overflow:"hidden" }}>
    <div style={{ width:`${Math.min(100,pct)}%`, height:"100%", background:color, borderRadius:99, transition:"width .45s ease" }} />
  </div>
);

const Chip = ({ c, on, children, ...p }) => (
  <button {...p} style={{ padding:"10px 15px", borderRadius:99, fontSize:14, cursor:"pointer", minHeight:44,
    border:`1.5px solid ${on?c.leaf:c.line}`, background:on?c.leaf:"transparent",
    color:on?c.onLeaf:c.ink, whiteSpace:"nowrap", ...UI }}>{children}</button>
);

const Btn = ({ c, children, ghost, disabled, ...p }) => (
  <button {...p} disabled={disabled} style={{ width:"100%", padding:"15px 18px", borderRadius:14, fontSize:16,
    fontWeight:600, cursor:disabled?"default":"pointer", minHeight:48, opacity:disabled?0.45:1,
    border:ghost?`1.5px solid ${c.line}`:"none",
    background:ghost?"transparent":c.leaf, color:ghost?c.ink:c.onLeaf, ...UI }}>{children}</button>
);

const Tile = ({ c, e, size=56 }) => (
  <div aria-hidden style={{ width:size, height:size, borderRadius:14, background:c.leafSoft, display:"flex",
    alignItems:"center", justifyContent:"center", fontSize:size*0.45, flexShrink:0 }}>{e}</div>
);

const Avatar = ({ c, p, size=38 }) => (
  <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
    <div style={{ width:size, height:size, borderRadius:99, background:c.leafSoft, display:"flex",
      alignItems:"center", justifyContent:"center", fontSize:size*0.5 }}>{p.a}</div>
    {p.cert && (
      <div style={{ position:"absolute", bottom:-2, right:-2, width:16, height:16, borderRadius:99,
        background:c.leaf, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${c.card}` }}>
        <Check size={9} color={c.onLeaf} strokeWidth={4} />
      </div>
    )}
  </div>
);

const Range = ({ c, low, high, size=38 }) => (
  <span style={{ ...NUM, fontSize:size, color:c.ink, lineHeight:1 }}>
    {low.toFixed(0)}<span style={{ fontSize:size*0.55, color:c.inkSoft }}>–</span>{high.toFixed(0)}
    <span style={{ fontSize:size*0.5, color:c.inkSoft }}> €</span>
  </span>
);

const Toggle = ({ c, on, onChange, label }) => (
  <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
    style={{ width:48, height:28, borderRadius:99, border:"none", cursor:"pointer", flexShrink:0,
      background:on?c.leaf:c.line, position:"relative", transition:"background .2s" }}>
    <span style={{ position:"absolute", top:3, left:on?23:3, width:22, height:22, borderRadius:99,
      background:"#fff", transition:"left .2s" }} />
  </button>
);

const Skeleton = ({ c, h=18, w="100%" }) => (
  <div style={{ height:h, width:w, borderRadius:8, background:c.leafSoft, opacity:0.6 }} />
);

const EmptyState = ({ c, icon, title, body, action }) => (
  <div className="flex flex-col items-center" style={{ padding:"48px 24px", textAlign:"center" }}>
    <div style={{ color:c.inkSoft, marginBottom:14 }}>{icon}</div>
    <div style={{ ...UI, fontSize:16, fontWeight:600, color:c.ink }}>{title}</div>
    <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginTop:6, lineHeight:1.5, maxWidth:280 }}>{body}</div>
    {action && <div style={{ marginTop:20, width:"100%", maxWidth:260 }}>{action}</div>}
  </div>
);

const ErrorState = ({ c, message, onRetry }) => (
  <Card c={c} style={{ padding:18, borderColor:c.alert }}>
    <div className="flex" style={{ gap:12 }}>
      <AlertCircle size={19} color={c.alert} style={{ flexShrink:0, marginTop:2 }} />
      <div style={{ flex:1 }}>
        <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>Ça n'a pas marché</div>
        <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginTop:4, lineHeight:1.5 }}>{message}</div>
        {onRetry && (
          <button onClick={onRetry} className="flex items-center"
            style={{ gap:7, marginTop:12, padding:"9px 14px", borderRadius:10, minHeight:40,
              border:`1.5px solid ${c.line}`, background:"transparent", color:c.ink, cursor:"pointer", ...UI, fontSize:14 }}>
            <RefreshCw size={15} /> Réessayer
          </button>
        )}
      </div>
    </div>
  </Card>
);

function Head({ c, title, sub, profile, onProfile, onNotifs, unread }) {
  return (
    <div className="flex items-start justify-between" style={{ padding:"22px 20px 12px", gap:10 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <h1 style={{ ...NUM, fontSize:30, color:c.ink, margin:0, lineHeight:1.15 }}>{title}</h1>
        {sub && <p style={{ ...UI, fontSize:14, color:c.inkSoft, margin:"4px 0 0" }}>{sub}</p>}
      </div>
      <div className="flex items-center" style={{ gap:6, marginTop:4 }}>
        {onNotifs && (
          <button onClick={onNotifs} aria-label="Notifications"
            style={{ background:"none", border:"none", cursor:"pointer", padding:8, position:"relative" }}>
            <Bell size={21} color={c.inkSoft} />
            {unread > 0 && (
              <span style={{ position:"absolute", top:5, right:5, minWidth:16, height:16, borderRadius:99,
                background:c.alert, color:"#fff", ...UI, fontSize:10, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center", padding:"0 4px" }}>{unread}</span>
            )}
          </button>
        )}
        {profile && (
          <button onClick={onProfile} aria-label="Mon profil"
            style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
            <div style={{ width:38, height:38, borderRadius:99, background:c.leafSoft, display:"flex",
              alignItems:"center", justifyContent:"center", ...NUM, fontSize:16, color:c.leaf }}>
              {(profile.name || "?").charAt(0).toUpperCase()}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   6. Authentification
   ================================================================== */

function AuthScreen({ c, onDone }) {
  const [mode, setMode] = useState(null);   // null | "signup" | "login"
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const field = (label, val, setVal, type="text", ph="") => (
    <div style={{ marginBottom:16 }}>
      <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>{label}</label>
      <input value={val} onChange={(e) => setVal(e.target.value)} type={type} placeholder={ph}
        style={{ ...UI, width:"100%", padding:"14px 16px", marginTop:8, fontSize:16, borderRadius:12,
          border:`1.5px solid ${c.line}`, background:c.card, color:c.ink, boxSizing:"border-box" }} />
    </div>
  );

  const submit = () => {
    setErr(null);
    if (!email.includes("@") || pwd.length < 6) {
      setErr("Vérifie ton adresse email et utilise un mot de passe d'au moins 6 caractères.");
      return;
    }
    setBusy(true);
    setTimeout(() => { setBusy(false); onDone(); }, 900);
  };

  if (!mode) {
    return (
      <div className="flex flex-col justify-end h-full" style={{ padding:28, background:c.paper }}>
        <div style={{ fontSize:72, marginBottom:20 }}>🥕</div>
        <h1 style={{ ...NUM, fontSize:42, lineHeight:1.05, color:c.ink, margin:0 }}>Mange mieux.<br />Dépense moins.</h1>
        <p style={{ ...UI, color:c.inkSoft, fontSize:16, lineHeight:1.5, marginTop:16, marginBottom:28 }}>
          Planifie tes repas, optimise tes courses et découvre des recettes adaptées à ton budget.
        </p>
        <Btn c={c} onClick={() => setMode("signup")}>Créer mon compte</Btn>
        <div style={{ height:10 }} />
        <Btn c={c} ghost onClick={() => setMode("login")}>J'ai déjà un compte</Btn>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background:c.paper }}>
      <div style={{ padding:"18px 20px 0" }}>
        <button onClick={() => setMode(null)} aria-label="Retour"
          style={{ background:"none", border:"none", color:c.ink, cursor:"pointer", padding:8, marginLeft:-8 }}>
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="flex-1" style={{ overflowY:"auto", padding:"8px 28px 28px" }}>
        <h2 style={{ ...NUM, fontSize:28, color:c.ink, margin:"0 0 22px" }}>
          {mode === "signup" ? "Créer ton compte" : "Te reconnecter"}
        </h2>
        {field("Email", email, setEmail, "email", "toi@exemple.fr")}
        {field("Mot de passe", pwd, setPwd, "password", "6 caractères minimum")}
        {err && <div style={{ marginBottom:16 }}><ErrorState c={c} message={err} /></div>}
        <Btn c={c} onClick={submit} disabled={busy}>
          {busy ? "Un instant…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </Btn>
        <div className="flex items-center" style={{ gap:12, margin:"22px 0" }}>
          <div style={{ flex:1, height:1, background:c.line }} />
          <span style={{ ...UI, fontSize:13, color:c.inkSoft }}>ou</span>
          <div style={{ flex:1, height:1, background:c.line }} />
        </div>
        <Btn c={c} ghost onClick={onDone}>Continuer avec Google</Btn>
        <div style={{ height:10 }} />
        <Btn c={c} ghost onClick={onDone}>Continuer avec Apple</Btn>
        <p style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:22, lineHeight:1.5 }}>
          En créant ton compte, tu acceptes les conditions d'utilisation. Tes données restent en Europe et tu peux les exporter ou les effacer à tout moment.
        </p>
      </div>
    </div>
  );
}

/* ==================================================================
   7. Onboarding
   ================================================================== */

const GOALS = [
  {k:"eco",e:"💰",l:"Économiser"},{k:"sain",e:"🥗",l:"Manger plus sainement"},
  {k:"sport",e:"💪",l:"Alimentation sportive"},{k:"temps",e:"⏱️",l:"Gagner du temps"},
  {k:"gaspi",e:"♻️",l:"Réduire le gaspillage"},
];
const DIETS = ["Omnivore","Végétarien","Végan","Pescétarien","Sans porc","Sans gluten","Sans lactose","Halal","Casher"];
const ALLERG = Object.keys(ALLERGEN_ING);

function Onboarding({ c, onDone }) {
  const [i, setI] = useState(0);
  const [p, setP] = useState({ name:"", household:2, goal:"eco", diet:"Omnivore",
    allergies:[], healthConsent:false, budget:60, maxTime:30 });
  const set = (k,v) => setP({ ...p, [k]:v });

  const steps = [
    <div key="p" style={{ padding:28 }}>
      <h2 style={{ ...NUM, fontSize:28, color:c.ink, margin:"0 0 22px" }}>On fait connaissance</h2>
      <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>Ton prénom</label>
      <input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Léa"
        style={{ ...UI, width:"100%", padding:"14px 16px", marginTop:8, marginBottom:24, fontSize:16,
          borderRadius:12, border:`1.5px solid ${c.line}`, background:c.card, color:c.ink, boxSizing:"border-box" }} />
      <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>Personnes à nourrir</label>
      <div className="flex items-center justify-between" style={{ marginTop:8, marginBottom:24, padding:"6px 12px",
        borderRadius:12, border:`1.5px solid ${c.line}` }}>
        <button onClick={() => set("household", Math.max(1,p.household-1))} aria-label="Moins"
          style={{ background:"none", border:"none", color:c.leaf, cursor:"pointer", padding:10 }}><Minus size={22} /></button>
        <span style={{ ...NUM, fontSize:26, color:c.ink }}>{p.household}</span>
        <button onClick={() => set("household", Math.min(8,p.household+1))} aria-label="Plus"
          style={{ background:"none", border:"none", color:c.leaf, cursor:"pointer", padding:10 }}><Plus size={22} /></button>
      </div>
      <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>Ton objectif principal</label>
      <div className="flex flex-col" style={{ gap:8, marginTop:10 }}>
        {GOALS.map((g) => (
          <button key={g.k} onClick={() => set("goal", g.k)} className="flex items-center"
            style={{ gap:12, padding:"14px 15px", borderRadius:13, cursor:"pointer", ...UI, fontSize:15, minHeight:48,
              border:`1.5px solid ${p.goal===g.k?c.leaf:c.line}`,
              background:p.goal===g.k?c.leafSoft:"transparent", color:c.ink }}>
            <span style={{ fontSize:20 }} aria-hidden>{g.e}</span>{g.l}
            {p.goal===g.k && <Check size={17} color={c.leaf} style={{ marginLeft:"auto" }} />}
          </button>
        ))}
      </div>
    </div>,

    <div key="d" style={{ padding:28 }}>
      <h2 style={{ ...NUM, fontSize:28, color:c.ink, margin:"0 0 6px" }}>Ton alimentation</h2>
      <p style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:22 }}>On ne te proposera que des recettes compatibles.</p>
      <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>Régime</label>
      <div className="flex flex-wrap" style={{ gap:8, marginTop:10, marginBottom:26 }}>
        {DIETS.map((d) => <Chip key={d} c={c} on={p.diet===d} onClick={() => set("diet", d)}>{d}</Chip>)}
      </div>

      {/* Consentement art. 9 RGPD : distinct, explicite, révocable. */}
      <Card c={c} style={{ padding:16, background:c.cardAlt }}>
        <div className="flex" style={{ gap:12 }}>
          <Lock size={18} color={c.leaf} style={{ flexShrink:0, marginTop:2 }} />
          <div style={{ flex:1 }}>
            <div style={{ ...UI, fontSize:14, color:c.ink, fontWeight:600 }}>Tes allergies sont des données de santé</div>
            <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:4, lineHeight:1.5 }}>
              On te demande ton accord séparément pour les enregistrer. Elles sont chiffrées et tu peux les effacer sans supprimer ton compte.
            </div>
            <button onClick={() => set("healthConsent", !p.healthConsent)} className="flex items-center"
              style={{ gap:10, marginTop:12, background:"none", border:"none", cursor:"pointer", padding:"6px 0" }}>
              <span style={{ width:22, height:22, borderRadius:6, flexShrink:0,
                border:`1.5px solid ${p.healthConsent?c.leaf:c.line}`, background:p.healthConsent?c.leaf:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {p.healthConsent && <Check size={14} color={c.onLeaf} />}
              </span>
              <span style={{ ...UI, fontSize:14, color:c.ink, textAlign:"left" }}>J'accepte l'enregistrement de mes allergies</span>
            </button>
          </div>
        </div>
      </Card>

      {p.healthConsent && (
        <div style={{ marginTop:22 }}>
          <label style={{ ...UI, fontSize:14, color:c.inkSoft }}>Allergies et aliments à éviter</label>
          <div className="flex flex-wrap" style={{ gap:8, marginTop:10 }}>
            {ALLERG.map((a) => (
              <Chip key={a} c={c} on={p.allergies.includes(a)}
                onClick={() => set("allergies", p.allergies.includes(a) ? p.allergies.filter((x)=>x!==a) : [...p.allergies,a])}>{a}</Chip>
            ))}
          </div>
          {p.allergies.length > 0 && (
            <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:14, lineHeight:1.5 }}>
              {eligibleRecipes({ diet:p.diet, allergies:p.allergies, maxTime:p.maxTime }).length} recettes restent disponibles pour toi.
            </div>
          )}
        </div>
      )}
    </div>,

    <div key="h" style={{ padding:28 }}>
      <h2 style={{ ...NUM, fontSize:28, color:c.ink, margin:"0 0 6px" }}>Ton temps en cuisine</h2>
      <p style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:24 }}>Combien de temps maximum pour un repas ?</p>
      <div className="flex flex-wrap" style={{ gap:8 }}>
        {[10,20,30,45,90].map((t) => (
          <Chip key={t} c={c} on={p.maxTime===t} onClick={() => set("maxTime", t)}>
            {t === 90 ? "Peu importe" : `${t} min`}
          </Chip>
        ))}
      </div>
      <Card c={c} style={{ padding:16, marginTop:24, background:c.cardAlt }}>
        <div style={{ ...UI, fontSize:14, color:c.ink }}>
          {eligibleRecipes({ diet:p.diet, allergies:p.allergies, maxTime:p.maxTime }).length} recettes correspondent à tes critères.
        </div>
      </Card>
    </div>,

    <div key="b" style={{ padding:28 }}>
      <h2 style={{ ...NUM, fontSize:28, color:c.ink, margin:"0 0 6px" }}>Ton budget courses</h2>
      <p style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:30 }}>Tu pourras le changer à tout moment.</p>
      <div style={{ ...NUM, fontSize:64, color:c.ink, textAlign:"center", lineHeight:1 }}>{p.budget}<span style={{ fontSize:30 }}> €</span></div>
      <div style={{ ...UI, fontSize:14, color:c.inkSoft, textAlign:"center", marginTop:6 }}>par semaine</div>
      <input type="range" min="25" max="200" step="5" value={p.budget} aria-label="Budget hebdomadaire"
        onChange={(e) => set("budget", +e.target.value)} style={{ width:"100%", marginTop:26, accentColor:c.leaf }} />
      <Card c={c} style={{ padding:16, marginTop:26, background:c.cardAlt }}>
        <div style={{ ...UI, fontSize:14, color:c.inkSoft }}>Ce qui te laisse</div>
        <div style={{ ...NUM, fontSize:26, color:c.ink, marginTop:4 }}>
          {euro(p.budget/7/p.household)} <span style={{ ...UI, fontSize:14, color:c.inkSoft }}>par personne et par jour</span>
        </div>
      </Card>
      <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:18, lineHeight:1.5 }}>
        Les prix affichés sont des estimations. Ils s'affineront à partir de tes tickets de caisse.
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col h-full" style={{ background:c.paper }}>
      <div className="flex items-center" style={{ padding:"18px 20px 0", gap:10 }}>
        <button onClick={() => i>0 && setI(i-1)} aria-label="Retour" disabled={i===0}
          style={{ background:"none", border:"none", color:i===0?c.line:c.ink, cursor:i===0?"default":"pointer", padding:8, marginLeft:-8 }}>
          <ChevronLeft size={24} />
        </button>
        <div className="flex" style={{ gap:5, flex:1 }}>
          {steps.map((_,s) => <div key={s} style={{ flex:1, height:3, borderRadius:99, background:s<=i?c.leaf:c.line }} />)}
        </div>
      </div>
      <div className="flex-1" style={{ overflowY:"auto" }}>{steps[i]}</div>
      <div style={{ padding:"12px 28px 28px" }}>
        <Btn c={c} onClick={() => (i===steps.length-1 ? onDone(p) : setI(i+1))}>
          {i===steps.length-1 ? "Créer mon planning" : "Continuer"}
        </Btn>
      </div>
    </div>
  );
}

/* ==================================================================
   8. Générateur de planning
   ================================================================== */

function GeneratorScreen({ c, p, onBack, onGenerated, quota, onPaywall }) {
  const [days, setDays] = useState(5);
  const [slots, setSlots] = useState(["midi","soir"]);
  const [state, setState] = useState("idle");   // idle | loading | error
  const [error, setError] = useState(null);

  const toggleSlot = (s) =>
    setSlots(slots.includes(s) ? (slots.length>1 ? slots.filter((x)=>x!==s) : slots) : [...slots, s]);

  const run = () => {
    if (quota <= 0) { onPaywall(); return; }
    setState("loading"); setError(null);
    setTimeout(() => {
      const res = generatePlan({ days, slots, budget:p.budget, household:p.household,
        diet:p.diet, allergies:p.allergies, maxTime:p.maxTime, seed:Math.floor(Math.random()*100) });
      if (res.error) { setError(res.error); setState("error"); return; }
      onGenerated(res);
    }, 1100);
  };

  return (
    <div style={{ padding:"0 20px 28px" }}>
      <div className="flex items-center" style={{ gap:8, padding:"22px 0 16px" }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ background:"none", border:"none", color:c.ink, cursor:"pointer", padding:8, marginLeft:-8 }}><ArrowLeft size={22} /></button>
        <h1 style={{ ...NUM, fontSize:26, color:c.ink, margin:0 }}>Créer mon planning</h1>
      </div>

      {state === "loading" ? (
        <div>
          <Card c={c} style={{ padding:20 }}>
            <div className="flex flex-col" style={{ gap:12 }}>
              <Skeleton c={c} h={24} w="60%" /><Skeleton c={c} h={14} w="85%" /><Skeleton c={c} h={14} w="70%" />
            </div>
          </Card>
          <div className="flex flex-col" style={{ gap:10, marginTop:14 }}>
            {[0,1,2].map((i) => (
              <Card key={i} c={c} style={{ padding:16 }}>
                <div className="flex" style={{ gap:14 }}>
                  <Skeleton c={c} h={52} w={52} />
                  <div className="flex flex-col" style={{ gap:8, flex:1, justifyContent:"center" }}>
                    <Skeleton c={c} h={14} w="70%" /><Skeleton c={c} h={12} w="45%" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p style={{ ...UI, fontSize:14, color:c.inkSoft, marginTop:18, textAlign:"center" }}>
            On cherche la combinaison la moins chère qui respecte tes contraintes…
          </p>
        </div>
      ) : (
        <>
          <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:10 }}>Durée</div>
          <div className="flex" style={{ gap:8, marginBottom:24 }}>
            {[3,5,7].map((d) => <Chip key={d} c={c} on={days===d} onClick={() => setDays(d)}>{d} jours</Chip>)}
          </div>

          <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:10 }}>Repas à planifier</div>
          <div className="flex flex-wrap" style={{ gap:8, marginBottom:24 }}>
            {["matin","midi","soir"].map((s) => (
              <Chip key={s} c={c} on={slots.includes(s)} onClick={() => toggleSlot(s)}>{SLOT_LABEL[s]}</Chip>
            ))}
          </div>

          <Card c={c} style={{ padding:18, marginBottom:20, background:c.cardAlt }}>
            {[
              ["Budget", `${p.budget} € par semaine`],
              ["Foyer", `${p.household} personne${p.household>1?"s":""}`],
              ["Régime", p.diet],
              ["Temps max", p.maxTime===90 ? "Peu importe" : `${p.maxTime} min`],
              ["Allergies", p.allergies.length ? p.allergies.join(", ") : "aucune"],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between" style={{ ...UI, fontSize:14, marginBottom:9 }}>
                <span style={{ color:c.inkSoft }}>{k}</span><span style={{ color:c.ink, textAlign:"right" }}>{v}</span>
              </div>
            ))}
            <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:6, paddingTop:12, borderTop:`1px solid ${c.line}`, lineHeight:1.5 }}>
              Le planning généré ne dépassera jamais ton budget. Si c'est impossible, on te le dira au lieu de te proposer autre chose.
            </div>
          </Card>

          {state === "error" && (
            <div style={{ marginBottom:18 }}>
              <ErrorState c={c} message={error.message} onRetry={() => setState("idle")} />
            </div>
          )}

          <Btn c={c} onClick={run}>Générer mon planning</Btn>
          <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:12, textAlign:"center" }}>
            {quota > 0 ? `${quota} génération${quota>1?"s":""} restante${quota>1?"s":""} cette semaine`
                       : "Tu as utilisé ta génération de la semaine"}
          </div>
        </>
      )}
    </div>
  );
}

/* ==================================================================
   9. Accueil
   ================================================================== */

function HomeScreen({ c, p, spent, plan, slots, list, openRecipe, go, onProfile, onNotifs,
                      unread, onRebalance, rebalanced, onStats, onGenerate }) {
  const left = p.budget - spent;
  const over = left < 0;
  const est = list.reduce((s,i) => s+i.price, 0);
  const today = plan[2] || plan[0];
  const { reuse } = waste(plan, slots);

  return (
    <div style={{ padding:"0 20px 24px" }}>
      <Head c={c} title={`Bonjour ${p.name || "toi"} 👋`} sub="Mercredi 16 septembre"
        profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />

      <Card c={c} style={{ padding:20, cursor:"pointer" }} onClick={onStats}>
        <div className="flex items-baseline justify-between" style={{ marginBottom:14 }}>
          <div style={{ ...NUM, fontSize:38, color:c.ink, lineHeight:1 }}>
            {euro(spent)}<span style={{ fontSize:17, color:c.inkSoft }}> / {p.budget} €</span>
          </div>
          <BarChart3 size={20} color={c.inkSoft} />
        </div>
        <Bar c={c} pct={(spent/p.budget)*100} color={over?c.alert:c.leaf} />
        <p className="flex items-center" style={{ ...UI, fontSize:14, color:over?c.alert:c.inkSoft, margin:"12px 0 0", gap:6 }}>
          {over && <AlertCircle size={15} />}
          {over ? `Tu as dépassé de ${euro(-left)} cette semaine.` : `Il te reste ${euro(left)} cette semaine.`}
        </p>
      </Card>

      {over && !rebalanced && (
        <Card c={c} style={{ padding:18, marginTop:12, background:c.leafSoft, border:"none" }}>
          <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>On rattrape la fin de semaine ?</div>
          <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:4, lineHeight:1.5 }}>
            Je remplace les jours restants par des repas moins chers, en utilisant ce que tu as déjà acheté.
          </div>
          <div style={{ marginTop:14 }}><Btn c={c} onClick={onRebalance}>Rééquilibrer ma semaine</Btn></div>
        </Card>
      )}
      {rebalanced && (
        <Card c={c} style={{ padding:16, marginTop:12, background:c.cardAlt }}>
          <div className="flex" style={{ gap:12 }}>
            <Check size={18} color={c.leaf} style={{ flexShrink:0, marginTop:2 }} />
            <div style={{ ...UI, fontSize:14, color:c.ink, lineHeight:1.5 }}>
              La fin de semaine a été remplacée. Tu retombes sous ton budget.
            </div>
          </div>
        </Card>
      )}

      <h2 style={{ ...UI, fontSize:15, fontWeight:600, color:c.ink, margin:"26px 0 12px" }}>Tes repas du jour</h2>
      <div className="flex flex-col" style={{ gap:10 }}>
        {slots.map((slot) => {
          const r = R(today[slot]);
          if (!r) return (
            <Card key={slot} c={c} style={{ padding:14, background:c.cardAlt }}>
              <div className="flex items-center" style={{ gap:14 }}>
                <Tile c={c} e="🍲" />
                <div>
                  <div style={{ ...UI, fontSize:12, color:c.inkSoft }}>{SLOT_LABEL[slot]}</div>
                  <div style={{ ...UI, fontSize:16, color:c.ink, fontWeight:600 }}>Restes de la veille</div>
                  <div style={{ ...UI, fontSize:13, color:c.leaf }}>Rien à racheter</div>
                </div>
              </div>
            </Card>
          );
          return (
            <Card key={slot} c={c} style={{ padding:14, cursor:"pointer" }} onClick={() => openRecipe(r)}>
              <div className="flex items-center" style={{ gap:14 }}>
                <Tile c={c} e={r.e} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ ...UI, fontSize:12, color:c.inkSoft }}>{SLOT_LABEL[slot]}</div>
                  <div style={{ ...UI, fontSize:16, color:c.ink, fontWeight:600 }}>{r.n}</div>
                  <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:2 }}>
                    {r.t} min · environ {euro(cost(r))} par personne
                  </div>
                </div>
                <ChevronRight size={18} color={c.inkSoft} />
              </div>
            </Card>
          );
        })}
      </div>

      <h2 style={{ ...UI, fontSize:15, fontWeight:600, color:c.ink, margin:"26px 0 12px" }}>Nos recommandations pour toi</h2>
      <div className="flex flex-col" style={{ gap:10 }}>
        <Card c={c} style={{ padding:16 }}>
          <div className="flex" style={{ gap:12 }}>
            <Recycle size={20} color={c.leaf} style={{ flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>Tu réutilises {reuse} % de tes ingrédients</div>
              <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:3 }}>Peu de restes en fin de semaine.</div>
            </div>
          </div>
        </Card>
        <Card c={c} style={{ padding:16, cursor:"pointer" }} onClick={() => go("courses")}>
          <div className="flex" style={{ gap:12 }}>
            <Sparkles size={20} color={c.apricot} style={{ flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>Ta liste tient dans ton budget</div>
              <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:3 }}>
                Entre {euro(est*(1-UNCERTAINTY))} et {euro(est*(1+UNCERTAINTY))} estimés.
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop:20 }}><Btn c={c} ghost onClick={onGenerate}>Créer un nouveau planning</Btn></div>
    </div>
  );
}

/* ==================================================================
   10. Planning
   ================================================================== */

function PlanningScreen({ c, p, plan, slots, openRecipe, onGenerate, onProfile, onNotifs, unread }) {
  const { reuse, score } = waste(plan, slots);
  const total = planCost(plan, slots, p.household);

  return (
    <div style={{ padding:"0 20px 24px" }}>
      <Head c={c} title="Ta semaine" sub={`${plan.length} jours · ${p.household} ${p.household>1?"personnes":"personne"}`}
        profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />

      <Card c={c} style={{ padding:18, marginBottom:18 }}>
        <div className="flex items-start justify-between">
          <div>
            <div style={{ ...UI, fontSize:13, color:c.inkSoft }}>Score anti-gaspillage</div>
            <div style={{ ...NUM, fontSize:30, color:c.ink, lineHeight:1.2 }}>{score}<span style={{ fontSize:16, color:c.inkSoft }}>/10</span></div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ ...UI, fontSize:13, color:c.inkSoft }}>Coût estimé</div>
            <Range c={c} low={total*(1-UNCERTAINTY)} high={total*(1+UNCERTAINTY)} size={30} />
          </div>
        </div>
        <div style={{ marginTop:14 }}><Bar c={c} pct={reuse} color={c.citron} /></div>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:8 }}>{reuse} % des ingrédients servent à plusieurs repas.</div>
      </Card>

      <div className="flex flex-col" style={{ gap:14 }}>
        {plan.map((d,i) => (
          <div key={i}>
            <div style={{ ...UI, fontSize:13, fontWeight:600, color:c.inkSoft, marginBottom:7 }}>{DAY_NAMES[i]}</div>
            <div className="flex" style={{ gap:10 }}>
              {slots.map((slot) => {
                const r = R(d[slot]);
                return (
                  <Card key={slot} c={c} style={{ flex:1, padding:12, cursor:r?"pointer":"default", background:r?c.card:c.cardAlt }}
                    onClick={() => r && openRecipe(r)}>
                    <div style={{ ...UI, fontSize:11, color:c.inkSoft }}>{SLOT_LABEL[slot]}</div>
                    <div style={{ fontSize:24, marginTop:4 }} aria-hidden>{r?r.e:"🍲"}</div>
                    <div style={{ ...UI, fontSize:13.5, color:c.ink, fontWeight:600, marginTop:5, lineHeight:1.25 }}>{r?r.n:"Restes"}</div>
                    <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:4 }}>
                      {r ? `${r.t} min · ${euro(cost(r)*p.household)}` : "—"}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:20 }}><Btn c={c} ghost onClick={onGenerate}>Générer un autre planning</Btn></div>
    </div>
  );
}

/* ==================================================================
   11. Courses
   ================================================================== */

function CoursesScreen({ c, p, list, checked, toggle, bump, remove, actual, setActual,
                         onProfile, onNotifs, unread, onComplete }) {
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState("");

  const total = list.reduce((s,i) => s + (actual[i.id] ?? i.price), 0);
  const done = list.filter((i) => checked.has(i.id)).reduce((s,i) => s + (actual[i.id] ?? i.price), 0);
  const known = Object.keys(actual).length;
  const allDone = list.length > 0 && checked.size === list.length;

  if (!list.length) {
    return (
      <div>
        <Head c={c} title="Tes courses" profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />
        <EmptyState c={c} icon={<ShoppingCart size={40} />} title="Pas encore de liste"
          body="Ta liste de courses se génère automatiquement à partir de ton planning de la semaine." />
      </div>
    );
  }

  return (
    <div style={{ padding:"0 20px 24px" }}>
      <Head c={c} title="Tes courses" sub={`${list.length} produits · générés depuis ton planning`}
        profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />

      <Card c={c} style={{ padding:20, marginBottom:18 }}>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft }}>Total estimé</div>
        <Range c={c} low={total*(1-UNCERTAINTY)} high={total*(1+UNCERTAINTY)} size={40} />
        <div style={{ marginTop:12 }}><Bar c={c} pct={(total/p.budget)*100} color={total>p.budget?c.alert:c.leaf} /></div>
        <div className="flex justify-between" style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:10 }}>
          <span>Budget {p.budget} €</span>
          <span style={{ color:total<=p.budget?c.leaf:c.alert, fontWeight:600 }}>
            {total<=p.budget ? `${euro(p.budget-total)} de marge` : `${euro(total-p.budget)} au-dessus`}
          </span>
        </div>
        <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:12, paddingTop:12, borderTop:`1px solid ${c.line}`, lineHeight:1.5 }}>
          {known > 0
            ? `${known} prix viennent de tes tickets précédents. La fourchette se resserre à mesure que tu en scannes.`
            : "Prix estimés à partir de moyennes nationales. Touche un prix pour le corriger."}
        </div>
      </Card>

      {done > 0 && <div style={{ ...UI, fontSize:14, color:c.leaf, marginBottom:14 }}>{euro(done)} déjà dans le panier.</div>}

      {CAT_ORDER.map((cat) => {
        const items = list.filter((i) => i.cat === cat);
        if (!items.length) return null;
        return (
          <div key={cat} style={{ marginBottom:20 }}>
            <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, marginBottom:9 }}>{CAT_EMOJI[cat]} {cat}</div>
            <Card c={c} style={{ overflow:"hidden" }}>
              {items.map((it,idx) => {
                const on = checked.has(it.id);
                const price = actual[it.id] ?? it.price;
                const isReal = actual[it.id] !== undefined;
                return (
                  <div key={it.id} className="flex items-center" style={{ gap:12, padding:"10px 14px", borderTop:idx?`1px solid ${c.line}`:"none" }}>
                    <button onClick={() => toggle(it.id)} aria-label={`Cocher ${it.name}`} aria-pressed={on}
                      style={{ width:44, height:44, flexShrink:0, cursor:"pointer", background:"none", border:"none",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ width:24, height:24, borderRadius:7,
                        border:`1.5px solid ${on?c.leaf:c.line}`, background:on?c.leaf:"transparent",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {on && <Check size={15} color={c.onLeaf} />}
                      </span>
                    </button>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ ...UI, fontSize:15, color:on?c.inkSoft:c.ink, textDecoration:on?"line-through":"none" }}>{it.name}</div>
                      {editing === it.id ? (
                        <div className="flex items-center" style={{ gap:6, marginTop:4 }}>
                          <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} placeholder="prix payé"
                            inputMode="decimal" aria-label={`Prix réel de ${it.name}`}
                            style={{ ...UI, width:84, padding:"6px 9px", fontSize:13, borderRadius:8,
                              border:`1.5px solid ${c.leaf}`, background:"transparent", color:c.ink }} />
                          <button onClick={() => { const v = parseFloat(val.replace(",","."));
                              if (v>0) setActual({ ...actual, [it.id]:v }); setEditing(null); setVal(""); }}
                            style={{ ...UI, fontSize:12, padding:"7px 11px", borderRadius:8, border:"none",
                              background:c.leaf, color:c.onLeaf, cursor:"pointer" }}>OK</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditing(it.id); setVal(""); }}
                          style={{ ...UI, fontSize:12, color:isReal?c.leaf:c.inkSoft, background:"none",
                            border:"none", padding:"3px 0", cursor:"pointer", textAlign:"left" }}>
                          × {it.qty} {it.unit} · {euro(price)}{isReal ? " · ton prix" : " · estimé"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center">
                      <button onClick={() => bump(it.id,-1)} aria-label={`Moins de ${it.name}`}
                        style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><Minus size={16} /></button>
                      <button onClick={() => bump(it.id,1)} aria-label={`Plus de ${it.name}`}
                        style={{ background:"none", border:"none", color:c.leaf, cursor:"pointer", padding:10 }}><Plus size={16} /></button>
                      <button onClick={() => remove(it.id)} aria-label={`Retirer ${it.name}`}
                        style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        );
      })}

      {allDone
        ? <Btn c={c} onClick={() => onComplete(total)}>Courses terminées · enregistrer {euro(total)}</Btn>
        : <Btn c={c} ghost><span className="flex items-center justify-center" style={{ gap:8 }}><Camera size={18} /> Scanner mon ticket</span></Btn>}
    </div>
  );
}

/* ==================================================================
   12. Communauté
   ================================================================== */

function CommunityScreen({ c, p, onProfile, onNotifs, unread, openPost, openLive, posts, onCompose }) {
  const [space, setSpace] = useState("tous");
  const shown = space === "tous" ? posts : posts.filter((x) => x.space === space);
  const currentSpace = SPACES.find((s) => s.s === space);

  return (
    <div style={{ padding:"0 0 24px" }}>
      <div style={{ padding:"0 20px" }}>
        <Head c={c} title="Communauté" sub="Les bonnes idées des autres"
          profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />
      </div>

      <div style={{ padding:"0 20px 10px" }}>
        <div className="flex items-center" style={{ gap:8 }}>
          <Radio size={17} color={c.apricot} />
          <span style={{ ...UI, fontSize:15, fontWeight:600, color:c.ink }}>Sessions à venir</span>
        </div>
      </div>
      <div className="flex" style={{ gap:12, overflowX:"auto", padding:"0 20px 4px" }}>
        {LIVES.map((l) => {
          const h = PROFILES[l.host];
          const replay = l.status === "REPLAY";
          return (
            <Card key={l.id} c={c} style={{ width:230, flexShrink:0, padding:14, cursor:"pointer" }} onClick={() => openLive(l)}>
              <div className="flex items-center justify-between" style={{ marginBottom:10 }}>
                <Tile c={c} e={l.cover} size={44} />
                <span style={{ ...UI, fontSize:11, padding:"4px 9px", borderRadius:99, fontWeight:600,
                  background: replay ? c.cardAlt : c.leafSoft, color: replay ? c.inkSoft : c.leaf }}>
                  {replay ? "Replay" : "Bientôt"}
                </span>
              </div>
              <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, lineHeight:1.3 }}>{l.title}</div>
              <div className="flex items-center" style={{ gap:7, marginTop:9 }}>
                <Avatar c={c} p={h} size={22} />
                <span style={{ ...UI, fontSize:12, color:c.inkSoft }}>{h.n}</span>
              </div>
              <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:8 }}>{l.when} · {l.registered} inscrits</div>
            </Card>
          );
        })}
      </div>

      <div className="flex" style={{ gap:8, overflowX:"auto", padding:"22px 20px 14px" }}>
        {SPACES.map((s) => (
          <Chip key={s.s} c={c} on={space===s.s} onClick={() => setSpace(s.s)}>
            {s.e} {s.n}{s.certifiedOnly && " 🔒"}
          </Chip>
        ))}
      </div>

      {currentSpace?.certifiedOnly && (
        <div style={{ padding:"0 20px 14px" }}>
          <Card c={c} style={{ padding:13, background:c.cardAlt }}>
            <div style={{ ...UI, fontSize:13, color:c.inkSoft, lineHeight:1.5 }}>
              Seuls les professionnels certifiés publient ici. Tout le monde peut commenter.
            </div>
          </Card>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState c={c} icon={<MessageCircle size={38} />} title="Rien ici pour l'instant"
          body="Sois la première personne à publier dans cet espace." />
      ) : (
        <div className="flex flex-col" style={{ gap:12, padding:"0 20px" }}>
          {shown.map((post) => {
            const a = PROFILES[post.author];
            return (
              <Card key={post.id} c={c} style={{ padding:16, cursor:"pointer" }} onClick={() => openPost(post)}>
                <div className="flex items-center" style={{ gap:10, marginBottom:11 }}>
                  <Avatar c={c} p={a} size={34} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="flex items-center" style={{ gap:6 }}>
                      <span style={{ ...UI, fontSize:14, color:c.ink, fontWeight:600 }}>{a.n}</span>
                      {a.cert && <ShieldCheck size={13} color={c.leaf} />}
                    </div>
                    <div style={{ ...UI, fontSize:12, color:a.cert?c.leaf:c.inkSoft }}>{a.cert ? a.label : post.ago}</div>
                  </div>
                  {post.pending && (
                    <span className="flex items-center" style={{ gap:5, ...UI, fontSize:11, padding:"4px 9px",
                      borderRadius:99, background:c.cardAlt, color:c.inkSoft }}>
                      <Clock size={11} /> En relecture
                    </span>
                  )}
                </div>

                <div style={{ ...UI, fontSize:16, fontWeight:600, color:c.ink, lineHeight:1.3 }}>{post.title}</div>
                <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginTop:6, lineHeight:1.5,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.body}</div>

                {post.recipe && (
                  <div className="flex items-center" style={{ gap:10, marginTop:12, padding:"10px 12px", borderRadius:12, background:c.cardAlt }}>
                    <Tile c={c} e="🍲" size={34} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ ...UI, fontSize:13, color:c.ink, fontWeight:600 }}>{post.recipe.title}</div>
                      <div className="flex items-center" style={{ gap:5, ...UI, fontSize:11,
                        color: post.recipe.verified ? c.leaf : c.apricot }}>
                        {post.recipe.verified ? <Check size={11} /> : <AlertCircle size={11} />}
                        {post.recipe.verified ? "Quantités vérifiées · ajoutable au planning" : "Non vérifiée · pas de coût calculé"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center" style={{ gap:18, marginTop:13 }}>
                  <span className="flex items-center" style={{ gap:5, ...UI, fontSize:13, color:c.inkSoft }}>
                    <ArrowBigUp size={17} /> {post.votes}
                  </span>
                  <span className="flex items-center" style={{ gap:5, ...UI, fontSize:13, color:c.inkSoft }}>
                    <MessageCircle size={15} /> {post.comments}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ padding:"18px 20px 0" }}><Btn c={c} onClick={onCompose}>Partager une recette</Btn></div>
    </div>
  );
}

/* ==================================================================
   13. Recettes & favoris
   ================================================================== */

function RecipesScreen({ c, p, openRecipe, onProfile, onNotifs, unread, favorites, toggleFav }) {
  const [pantry, setPantry] = useState([]);
  const [mode, setMode] = useState("all");
  const POP = ["riz","oeuf","carotte","oignon","soja","pates","tomate","pois","poulet","courgette","lentille","semoule"];

  const base = useMemo(
    () => eligibleRecipes({ diet:p.diet, allergies:p.allergies, maxTime:90 }),
    [p.diet, p.allergies]
  );

  const shown = useMemo(() => {
    if (mode === "fav") return base.filter((r) => favorites.has(r.id));
    if (mode === "pantry" && pantry.length) {
      return base.map((r) => {
        const missing = Object.keys(r.ing).filter((k) => !pantry.includes(k));
        return { ...r, missing:missing.length, missingNames:missing.map((k) => ING[k].n) };
      }).filter((r) => r.missing <= 2).sort((a,b) => a.missing - b.missing);
    }
    return base;
  }, [mode, pantry, base, favorites]);

  return (
    <div style={{ padding:"0 20px 24px" }}>
      <Head c={c} title="Recettes" profile={p} onProfile={onProfile} onNotifs={onNotifs} unread={unread} />
      <div className="flex" style={{ gap:8, marginBottom:18, overflowX:"auto" }}>
        <Chip c={c} on={mode==="all"} onClick={() => setMode("all")}>Pour toi</Chip>
        <Chip c={c} on={mode==="pantry"} onClick={() => setMode("pantry")}>Que puis-je cuisiner ?</Chip>
        <Chip c={c} on={mode==="fav"} onClick={() => setMode("fav")}>Favoris</Chip>
      </div>

      {mode === "pantry" && (
        <Card c={c} style={{ padding:16, marginBottom:18, background:c.cardAlt }}>
          <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600, marginBottom:4 }}>Qu'est-ce que tu as chez toi ?</div>
          <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginBottom:12 }}>Sélectionne ce qu'il te reste.</div>
          <div className="flex flex-wrap" style={{ gap:7 }}>
            {POP.map((k) => (
              <Chip key={k} c={c} on={pantry.includes(k)}
                onClick={() => setPantry(pantry.includes(k) ? pantry.filter((x)=>x!==k) : [...pantry,k])}>{ING[k].n}</Chip>
            ))}
          </div>
          {pantry.length > 0 && (
            <div style={{ ...UI, fontSize:14, color:c.leaf, marginTop:14, fontWeight:600 }}>
              {shown.length} recettes possibles avec tes ingrédients
            </div>
          )}
        </Card>
      )}

      {mode === "fav" && shown.length === 0 ? (
        <EmptyState c={c} icon={<Heart size={38} />} title="Aucun favori pour l'instant"
          body="Touche le cœur sur une recette pour la retrouver ici, et la voir revenir plus souvent dans tes plannings."
          action={<Btn c={c} ghost onClick={() => setMode("all")}>Parcourir les recettes</Btn>} />
      ) : (
        <div className="flex flex-col" style={{ gap:10 }}>
          {shown.map((r) => (
            <Card key={r.id} c={c} style={{ padding:14 }}>
              <div className="flex items-center" style={{ gap:14 }}>
                <div onClick={() => openRecipe(r)} style={{ cursor:"pointer" }}><Tile c={c} e={r.e} size={62} /></div>
                <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={() => openRecipe(r)}>
                  <div style={{ ...UI, fontSize:16, color:c.ink, fontWeight:600, lineHeight:1.25 }}>{r.n}</div>
                  <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:4 }}>
                    {r.t} min · {r.d} · {euro(cost(r))} / portion
                  </div>
                  {mode==="pantry" && pantry.length>0 && (
                    <div style={{ ...UI, fontSize:13, marginTop:5, color:r.missing===0?c.leaf:c.apricot, fontWeight:600 }}>
                      {r.missing===0 ? "Tu as tout ce qu'il faut"
                        : `Il te manque ${r.missing===1?"seulement ":""}${r.missingNames.join(", ").toLowerCase()}`}
                    </div>
                  )}
                </div>
                <button onClick={() => toggleFav(r.id)} aria-label={`Ajouter ${r.n} aux favoris`}
                  aria-pressed={favorites.has(r.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:10, flexShrink:0 }}>
                  <Heart size={20} color={favorites.has(r.id) ? c.alert : c.inkSoft}
                    fill={favorites.has(r.id) ? c.alert : "none"} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================================================================
   14. Statistiques
   ================================================================== */

function StatsScreen({ c, p, expenses, onBack }) {
  const spent = expenses.reduce((s,e) => s+e.amount, 0);
  const rows = [...HISTORY, { w:"Cette semaine", planned:p.budget, actual:spent }];
  const max = Math.max(...rows.map((r) => Math.max(r.planned, r.actual))) * 1.1;
  const meals = 10 * p.household;

  return (
    <div style={{ padding:"0 20px 28px" }}>
      <div className="flex items-center" style={{ gap:8, padding:"22px 0 16px" }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ background:"none", border:"none", color:c.ink, cursor:"pointer", padding:8, marginLeft:-8 }}><ArrowLeft size={22} /></button>
        <h1 style={{ ...NUM, fontSize:26, color:c.ink, margin:0 }}>Mes dépenses</h1>
      </div>

      <div className="flex" style={{ gap:10, marginBottom:20 }}>
        {[["Cette semaine", euro(spent)], ["Par repas", euro(spent/meals)], ["Par personne", euro(spent/p.household)]].map(([l,v]) => (
          <Card key={l} c={c} style={{ flex:1, padding:14 }}>
            <div style={{ ...UI, fontSize:11.5, color:c.inkSoft, lineHeight:1.3 }}>{l}</div>
            <div style={{ ...NUM, fontSize:19, color:c.ink, marginTop:6 }}>{v}</div>
          </Card>
        ))}
      </div>

      <Card c={c} style={{ padding:18, marginBottom:20 }}>
        <div style={{ ...UI, fontSize:15, fontWeight:600, color:c.ink, marginBottom:4 }}>Budget prévu et dépenses réelles</div>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginBottom:18 }}>Six dernières semaines</div>

        <div className="flex items-end" style={{ gap:10, height:150 }}>
          {rows.map((r) => (
            <div key={r.w} className="flex flex-col items-center" style={{ flex:1, height:"100%", justifyContent:"flex-end", gap:6 }}>
              <div className="flex items-end" style={{ gap:3, height:"100%", width:"100%", justifyContent:"center" }}>
                <div title="Prévu" style={{ width:9, height:`${(r.planned/max)*100}%`, background:c.leafSoft, borderRadius:"3px 3px 0 0" }} />
                <div title="Réel" style={{ width:9, height:`${(r.actual/max)*100}%`,
                  background:r.actual>r.planned?c.alert:c.leaf, borderRadius:"3px 3px 0 0" }} />
              </div>
              <div style={{ ...UI, fontSize:10, color:c.inkSoft }}>{r.w === "Cette semaine" ? "S0" : r.w}</div>
            </div>
          ))}
        </div>

        <div className="flex" style={{ gap:16, marginTop:16, paddingTop:14, borderTop:`1px solid ${c.line}` }}>
          {[["Prévu", c.leafSoft], ["Dans le budget", c.leaf], ["Dépassement", c.alert]].map(([l,col]) => (
            <span key={l} className="flex items-center" style={{ gap:6, ...UI, fontSize:12, color:c.inkSoft }}>
              <span style={{ width:9, height:9, borderRadius:2, background:col }} />{l}
            </span>
          ))}
        </div>
      </Card>

      <Card c={c} style={{ padding:16, background:c.leafSoft, border:"none", marginBottom:20 }}>
        <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>Tu dépenses 21 % de moins qu'il y a cinq semaines</div>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:4, lineHeight:1.5 }}>
          Soit environ 66 € économisés sur la période.
        </div>
      </Card>

      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, marginBottom:10 }}>Détail de la semaine</div>
      <Card c={c} style={{ overflow:"hidden" }}>
        {expenses.map((e,i) => (
          <div key={i} className="flex justify-between" style={{ padding:"13px 16px", borderTop:i?`1px solid ${c.line}`:"none" }}>
            <span style={{ ...UI, fontSize:14, color:c.ink }}>{e.label}</span>
            <span style={{ ...NUM, fontSize:14, color:c.ink }}>{euro(e.amount)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ==================================================================
   15. Notifications
   ================================================================== */

function NotificationsScreen({ c, notifs, prefs, setPrefs, onBack, markRead }) {
  const [tab, setTab] = useState("list");
  useEffect(() => { if (tab === "list") markRead(); }, [tab, markRead]);

  return (
    <div style={{ padding:"0 20px 28px" }}>
      <div className="flex items-center" style={{ gap:8, padding:"22px 0 16px" }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ background:"none", border:"none", color:c.ink, cursor:"pointer", padding:8, marginLeft:-8 }}><ArrowLeft size={22} /></button>
        <h1 style={{ ...NUM, fontSize:26, color:c.ink, margin:0 }}>Notifications</h1>
      </div>

      <div className="flex" style={{ gap:8, marginBottom:18 }}>
        <Chip c={c} on={tab==="list"} onClick={() => setTab("list")}>Récentes</Chip>
        <Chip c={c} on={tab==="prefs"} onClick={() => setTab("prefs")}>Réglages</Chip>
      </div>

      {tab === "list" ? (
        notifs.length === 0 ? (
          <EmptyState c={c} icon={<Inbox size={38} />} title="Rien de neuf"
            body="On te préviendra quand ton budget bouge ou qu'un aliment approche de sa date." />
        ) : (
          <div className="flex flex-col" style={{ gap:10 }}>
            {notifs.map((n) => (
              <Card key={n.id} c={c} style={{ padding:16, background:n.unread?c.card:c.cardAlt }}>
                <div className="flex" style={{ gap:12 }}>
                  {n.unread && <span style={{ width:7, height:7, borderRadius:99, background:c.leaf, marginTop:7, flexShrink:0 }} />}
                  <div style={{ flex:1 }}>
                    <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>{n.title}</div>
                    <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginTop:3, lineHeight:1.5 }}>{n.body}</div>
                    <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:7 }}>{n.ago}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <>
          <Card c={c} style={{ overflow:"hidden" }}>
            {NOTIF_TOPICS.map((t,i) => (
              <div key={t.k} className="flex items-center justify-between"
                style={{ gap:14, padding:"14px 16px", borderTop:i?`1px solid ${c.line}`:"none" }}>
                <div style={{ flex:1 }}>
                  <div style={{ ...UI, fontSize:15, color:c.ink }}>{t.l}</div>
                  <div style={{ ...UI, fontSize:12.5, color:c.inkSoft, marginTop:2, lineHeight:1.4 }}>{t.d}</div>
                </div>
                <Toggle c={c} on={prefs[t.k]} label={t.l} onChange={(v) => setPrefs({ ...prefs, [t.k]:v })} />
              </div>
            ))}
          </Card>
          <div style={{ ...UI, fontSize:12.5, color:c.inkSoft, marginTop:14, lineHeight:1.5 }}>
            Chaque catégorie se désactive séparément. Aucune notification n'est envoyée sans ton accord.
          </div>
        </>
      )}
    </div>
  );
}

/* ==================================================================
   16. Profil
   ================================================================== */

function ProfileScreen({ c, p, setP, dark, setDark, expenses, addExpense, reset, onBack, premium, onPaywall, onStats }) {
  const [amount, setAmount] = useState("");
  const spent = expenses.reduce((s,e) => s+e.amount, 0);

  return (
    <div style={{ padding:"0 20px 28px" }}>
      <div className="flex items-center" style={{ gap:8, padding:"22px 0 12px" }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ background:"none", border:"none", color:c.ink, cursor:"pointer", padding:8, marginLeft:-8 }}><ArrowLeft size={22} /></button>
        <h1 style={{ ...NUM, fontSize:26, color:c.ink, margin:0 }}>{p.name || "Ton profil"}</h1>
      </div>

      <Card c={c} style={{ padding:16, marginBottom:18 }}>
        <div className="flex items-center" style={{ gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:99, background:c.leafSoft, display:"flex",
            alignItems:"center", justifyContent:"center", ...NUM, fontSize:18, color:c.leaf }}>
            {(p.name||"?").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>@{(p.name||"toi").toLowerCase()}</div>
            <div style={{ ...UI, fontSize:13, color:c.inkSoft }}>{premium ? "Premium" : "Gratuit"} · non certifié</div>
          </div>
        </div>
        <div style={{ marginTop:14 }}><Btn c={c} ghost>Demander la certification</Btn></div>
        <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:10, lineHeight:1.5 }}>
          Réservée aux professionnels justifiant d'un titre : diététicien, chef, créateur culinaire.
        </div>
      </Card>

      {!premium && (
        <Card c={c} style={{ padding:18, marginBottom:22, background:c.leafSoft, border:"none" }}>
          <div className="flex items-center" style={{ gap:9, marginBottom:6 }}>
            <Crown size={18} color={c.leaf} />
            <span style={{ ...UI, fontSize:15, fontWeight:600, color:c.ink }}>Passer en Premium</span>
          </div>
          <div style={{ ...UI, fontSize:13, color:c.inkSoft, lineHeight:1.5, marginBottom:14 }}>
            Plannings illimités, historique complet, profils familiaux et analyse nutritionnelle.
          </div>
          <Btn c={c} onClick={onPaywall}>Voir Premium</Btn>
        </Card>
      )}

      <div className="flex items-center justify-between" style={{ marginBottom:10 }}>
        <span style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink }}>Mes dépenses</span>
        <button onClick={onStats} style={{ ...UI, fontSize:13, color:c.leaf, background:"none", border:"none", cursor:"pointer", padding:6 }}>
          Voir les statistiques
        </button>
      </div>
      <Card c={c} style={{ padding:20 }}>
        <div style={{ ...NUM, fontSize:34, color:c.ink, lineHeight:1.1 }}>{euro(spent)}</div>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:2 }}>
          cette semaine · {euro(spent/7/p.household)} par personne et par jour
        </div>
        <div className="flex" style={{ gap:8, marginTop:16 }}>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" inputMode="decimal"
            aria-label="Montant de la dépense"
            style={{ ...UI, flex:1, padding:"12px 14px", fontSize:15, borderRadius:11,
              border:`1.5px solid ${c.line}`, background:"transparent", color:c.ink, minWidth:0 }} />
          <button onClick={() => { const v = parseFloat(amount.replace(",",".")); if (v>0) { addExpense(v); setAmount(""); } }}
            style={{ ...UI, padding:"12px 18px", borderRadius:11, border:"none", background:c.leaf,
              color:c.onLeaf, fontWeight:600, cursor:"pointer", minHeight:44 }}>Ajouter</button>
        </div>
      </Card>

      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, margin:"26px 0 10px" }}>Budget</div>
      <Card c={c} style={{ padding:18 }}>
        <div className="flex items-baseline justify-between">
          <span style={{ ...UI, fontSize:15, color:c.ink }}>Par semaine</span>
          <span style={{ ...NUM, fontSize:24, color:c.ink }}>{p.budget} €</span>
        </div>
        <input type="range" min="25" max="200" step="5" value={p.budget} aria-label="Budget hebdomadaire"
          onChange={(e) => setP({ ...p, budget:+e.target.value })} style={{ width:"100%", marginTop:12, accentColor:c.leaf }} />
      </Card>

      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, margin:"26px 0 10px" }}>Régime</div>
      <div className="flex flex-wrap" style={{ gap:8 }}>
        {DIETS.slice(0,4).map((d) => <Chip key={d} c={c} on={p.diet===d} onClick={() => setP({ ...p, diet:d })}>{d}</Chip>)}
      </div>

      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, margin:"26px 0 10px" }}>Confidentialité</div>
      <Card c={c} style={{ overflow:"hidden" }}>
        {[
          { l:"Mes données de santé", s:p.healthConsent ? `${p.allergies.length} allergie${p.allergies.length>1?"s":""} enregistrée${p.allergies.length>1?"s":""}, chiffrée${p.allergies.length>1?"s":""}` : "Aucune donnée enregistrée" },
          { l:"Exporter mes données", s:"Archive JSON envoyée par email" },
          { l:"Supprimer mon compte", s:"Effacement définitif sous 30 jours" },
        ].map((row,i) => (
          <button key={row.l} className="flex items-center justify-between"
            style={{ width:"100%", padding:"14px 16px", borderTop:i?`1px solid ${c.line}`:"none",
              background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
            <span>
              <span style={{ ...UI, fontSize:15, color:c.ink, display:"block" }}>{row.l}</span>
              <span style={{ ...UI, fontSize:12, color:c.inkSoft, display:"block", marginTop:2 }}>{row.s}</span>
            </span>
            <ChevronRight size={17} color={c.inkSoft} />
          </button>
        ))}
      </Card>

      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, margin:"26px 0 10px" }}>Paramètres</div>
      <Card c={c} style={{ padding:"14px 18px" }}>
        <div className="flex items-center justify-between">
          <span className="flex items-center" style={{ ...UI, fontSize:15, color:c.ink, gap:10 }}>
            {dark ? <Moon size={18} /> : <Sun size={18} />} Thème sombre
          </span>
          <Toggle c={c} on={dark} onChange={setDark} label="Thème sombre" />
        </div>
      </Card>

      <div style={{ marginTop:26 }}><Btn c={c} ghost onClick={reset}>Se déconnecter</Btn></div>
    </div>
  );
}

/* ==================================================================
   17. Feuilles modales
   ================================================================== */

function Sheet({ c, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)", zIndex:50,
      display:"flex", alignItems:"flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog"
        style={{ background:c.paper, width:"100%", maxHeight:"88%", overflowY:"auto",
          borderTopLeftRadius:24, borderTopRightRadius:24, padding:24 }}>{children}</div>
    </div>
  );
}

function RecipeSheet({ c, r, household, onClose, favorites, toggleFav }) {
  if (!r) return null;
  const fav = favorites.has(r.id);
  return (
    <Sheet c={c} onClose={onClose}>
      <div className="flex items-start justify-between">
        <Tile c={c} e={r.e} size={72} />
        <div className="flex items-center" style={{ gap:4 }}>
          <button onClick={() => toggleFav(r.id)} aria-label="Favori" aria-pressed={fav}
            style={{ background:"none", border:"none", cursor:"pointer", padding:10 }}>
            <Heart size={21} color={fav?c.alert:c.inkSoft} fill={fav?c.alert:"none"} />
          </button>
          <button onClick={onClose} aria-label="Fermer"
            style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><X size={22} /></button>
        </div>
      </div>
      <h2 style={{ ...NUM, fontSize:27, color:c.ink, margin:"16px 0 8px", lineHeight:1.15 }}>{r.n}</h2>
      <div className="flex flex-wrap" style={{ gap:8, marginBottom:20 }}>
        {[`${r.t} min`, r.d, `${euro(cost(r))} / portion`, `${household} portions`].map((b) => (
          <span key={b} style={{ ...UI, fontSize:13, padding:"6px 11px", borderRadius:99, background:c.leafSoft, color:c.ink }}>{b}</span>
        ))}
      </div>
      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, marginBottom:10 }}>Ingrédients</div>
      <Card c={c} style={{ overflow:"hidden", marginBottom:22 }}>
        {Object.entries(r.ing).map(([k,q],i) => (
          <div key={k} className="flex justify-between" style={{ padding:"11px 15px", borderTop:i?`1px solid ${c.line}`:"none", ...UI, fontSize:14 }}>
            <span style={{ color:c.ink }}>{ING[k].n}</span>
            <span style={{ color:c.inkSoft }}>{Math.round(q*household*10)/10} {ING[k].u}</span>
          </div>
        ))}
      </Card>
      <div style={{ ...UI, fontSize:14, fontWeight:600, color:c.ink, marginBottom:10 }}>Préparation</div>
      <div className="flex flex-col" style={{ gap:12, marginBottom:24 }}>
        {r.steps.map((s,i) => (
          <div key={i} className="flex" style={{ gap:12 }}>
            <span style={{ ...NUM, fontSize:18, color:c.leaf, width:18, flexShrink:0 }}>{i+1}</span>
            <span style={{ ...UI, fontSize:15, color:c.ink, lineHeight:1.5 }}>{s}</span>
          </div>
        ))}
      </div>
      <Btn c={c} onClick={onClose}>Cuisiner</Btn>
      <div style={{ height:10 }} /><Btn c={c} ghost onClick={onClose}>Ajouter au planning</Btn>
    </Sheet>
  );
}

function PostSheet({ c, post, onClose }) {
  if (!post) return null;
  const a = PROFILES[post.author];
  return (
    <Sheet c={c} onClose={onClose}>
      <div className="flex items-start justify-between" style={{ marginBottom:16 }}>
        <div className="flex items-center" style={{ gap:11 }}>
          <Avatar c={c} p={a} size={42} />
          <div>
            <div className="flex items-center" style={{ gap:6 }}>
              <span style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>{a.n}</span>
              {a.cert && <ShieldCheck size={14} color={c.leaf} />}
            </div>
            <div style={{ ...UI, fontSize:12, color:a.cert?c.leaf:c.inkSoft }}>{a.cert ? a.label : post.ago}</div>
          </div>
        </div>
        <button onClick={onClose} aria-label="Fermer"
          style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><X size={22} /></button>
      </div>

      <h2 style={{ ...NUM, fontSize:24, color:c.ink, margin:"0 0 12px", lineHeight:1.2 }}>{post.title}</h2>
      <p style={{ ...UI, fontSize:15, color:c.ink, lineHeight:1.6, margin:0, whiteSpace:"pre-line" }}>{post.body}</p>

      {post.recipe && (
        <Card c={c} style={{ padding:14, marginTop:18 }}>
          <div className="flex items-center" style={{ gap:12 }}>
            <Tile c={c} e="🍲" size={44} />
            <div style={{ flex:1 }}>
              <div style={{ ...UI, fontSize:15, color:c.ink, fontWeight:600 }}>{post.recipe.title}</div>
              <div className="flex items-center" style={{ gap:5, ...UI, fontSize:12,
                color:post.recipe.verified?c.leaf:c.apricot, marginTop:2 }}>
                {post.recipe.verified ? <Check size={12} /> : <AlertCircle size={12} />}
                {post.recipe.verified ? "Quantités vérifiées" : "Quantités non vérifiées"}
              </div>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            {post.recipe.verified
              ? <Btn c={c} onClick={onClose}>Ajouter à mon planning</Btn>
              : <>
                  <Btn c={c} ghost onClick={onClose}>Enregistrer dans mes idées</Btn>
                  <div style={{ ...UI, fontSize:12, color:c.inkSoft, marginTop:10, lineHeight:1.5 }}>
                    Cette recette n'a pas encore de quantités structurées : elle ne peut pas entrer dans le calcul de ton budget.
                  </div>
                </>}
          </div>
        </Card>
      )}

      <div className="flex items-center" style={{ gap:14, marginTop:22, paddingTop:18, borderTop:`1px solid ${c.line}` }}>
        <button className="flex items-center" style={{ gap:6, ...UI, fontSize:14, color:c.ink, background:"none",
          border:"none", cursor:"pointer", padding:8 }}>
          <ArrowBigUp size={19} /> {post.votes}
        </button>
        <span className="flex items-center" style={{ gap:6, ...UI, fontSize:14, color:c.inkSoft }}>
          <MessageCircle size={16} /> {post.comments} réponses
        </span>
        <button className="flex items-center" style={{ gap:6, ...UI, fontSize:13, color:c.inkSoft, background:"none",
          border:"none", cursor:"pointer", padding:8, marginLeft:"auto" }}>
          <Flag size={14} /> Signaler
        </button>
      </div>
    </Sheet>
  );
}

function LiveSheet({ c, live, onClose }) {
  const [registered, setRegistered] = useState(false);
  if (!live) return null;
  const h = PROFILES[live.host];
  const isReplay = live.status === "REPLAY";

  return (
    <Sheet c={c} onClose={onClose}>
      <div className="flex items-start justify-between">
        <Tile c={c} e={live.cover} size={72} />
        <button onClick={onClose} aria-label="Fermer"
          style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><X size={22} /></button>
      </div>
      <h2 style={{ ...NUM, fontSize:25, color:c.ink, margin:"16px 0 10px", lineHeight:1.2 }}>{live.title}</h2>
      <div className="flex items-center" style={{ gap:10, marginBottom:18 }}>
        <Avatar c={c} p={h} size={34} />
        <div>
          <div style={{ ...UI, fontSize:14, color:c.ink, fontWeight:600 }}>{h.n}</div>
          <div style={{ ...UI, fontSize:12, color:c.leaf }}>{h.label}</div>
        </div>
      </div>
      <Card c={c} style={{ padding:16, marginBottom:18, background:c.cardAlt }}>
        {[[isReplay?"Diffusé":"Rendez-vous", live.when], ["Format", live.cat],
          [isReplay?"Vues":"Inscrits", String(live.registered + (registered?1:0))]].map(([k,v],i,arr) => (
          <div key={k} className="flex justify-between" style={{ ...UI, fontSize:14, color:c.ink, marginBottom:i<arr.length-1?8:0 }}>
            <span style={{ color:c.inkSoft }}>{k}</span><span>{v}</span>
          </div>
        ))}
      </Card>

      {isReplay ? (
        <Btn c={c} ghost onClick={onClose}>Le replay arrive bientôt</Btn>
      ) : (
        <Btn c={c} ghost={registered} onClick={() => setRegistered(!registered)}>
          <span className="flex items-center justify-center" style={{ gap:8 }}>
            {registered ? <><Check size={17} /> Inscrit · tu seras prévenu</> : <><Bell size={17} /> M'inscrire</>}
          </span>
        </Btn>
      )}
      <div style={{ ...UI, fontSize:13, color:c.inkSoft, marginTop:14, lineHeight:1.5 }}>
        Les sessions en direct ouvriront quand nous serons assez nombreux. Ton inscription nous aide à savoir quand.
      </div>
    </Sheet>
  );
}

function ComposeSheet({ c, onClose, onPublish }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [space, setSpace] = useState("budget");
  const [busy, setBusy] = useState(false);

  const input = (val, set, ph, rows) => rows ? (
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder={ph} rows={rows}
      style={{ ...UI, width:"100%", padding:"13px 15px", fontSize:15, borderRadius:12, resize:"none",
        border:`1.5px solid ${c.line}`, background:c.card, color:c.ink, boxSizing:"border-box", lineHeight:1.5 }} />
  ) : (
    <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
      style={{ ...UI, width:"100%", padding:"13px 15px", fontSize:15, borderRadius:12,
        border:`1.5px solid ${c.line}`, background:c.card, color:c.ink, boxSizing:"border-box" }} />
  );

  return (
    <Sheet c={c} onClose={onClose}>
      <div className="flex items-center justify-between" style={{ marginBottom:18 }}>
        <h2 style={{ ...NUM, fontSize:23, color:c.ink, margin:0 }}>Partager une recette</h2>
        <button onClick={onClose} aria-label="Fermer"
          style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><X size={22} /></button>
      </div>

      <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:9 }}>Espace</div>
      <div className="flex flex-wrap" style={{ gap:8, marginBottom:18 }}>
        {SPACES.filter((s) => s.s!=="tous" && !s.certifiedOnly).map((s) => (
          <Chip key={s.s} c={c} on={space===s.s} onClick={() => setSpace(s.s)}>{s.e} {s.n}</Chip>
        ))}
      </div>

      <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:9 }}>Titre</div>
      <div style={{ marginBottom:18 }}>{input(title, setTitle, "Mon dahl à 0,80 € la portion")}</div>

      <div style={{ ...UI, fontSize:14, color:c.inkSoft, marginBottom:9 }}>Ta recette</div>
      <div style={{ marginBottom:18 }}>
        {input(body, setBody, "Ingrédients, étapes, astuces… écris comme tu parles, on structurera ensuite.", 6)}
      </div>

      <Card c={c} style={{ padding:14, marginBottom:18, background:c.cardAlt }}>
        <div style={{ ...UI, fontSize:13, color:c.inkSoft, lineHeight:1.5 }}>
          Ta recette est relue avant publication. Une fois ses quantités structurées, elle pourra entrer dans les plannings de la communauté.
        </div>
      </Card>

      <Btn c={c} disabled={!title.trim() || !body.trim() || busy}
        onClick={() => { setBusy(true); setTimeout(() => onPublish({ title, body, space }), 800); }}>
        {busy ? "Envoi…" : "Publier"}
      </Btn>
    </Sheet>
  );
}

function PaywallSheet({ c, onClose, onSubscribe }) {
  return (
    <Sheet c={c} onClose={onClose}>
      <div className="flex items-start justify-between">
        <Tile c={c} e="👑" size={64} />
        <button onClick={onClose} aria-label="Fermer"
          style={{ background:"none", border:"none", color:c.inkSoft, cursor:"pointer", padding:10 }}><X size={22} /></button>
      </div>
      <h2 style={{ ...NUM, fontSize:26, color:c.ink, margin:"16px 0 8px", lineHeight:1.2 }}>
        Tu économises 12,80 € par semaine
      </h2>
      <p style={{ ...UI, fontSize:15, color:c.inkSoft, lineHeight:1.55, marginTop:0, marginBottom:22 }}>
        Premium coûte 3,99 € par mois. D'après tes six dernières semaines, il se rembourse en deux jours de courses.
      </p>

      <Card c={c} style={{ overflow:"hidden", marginBottom:20 }}>
        {[
          ["Plannings illimités", "Autant de générations que tu veux"],
          ["Historique complet", "Toutes tes dépenses, sans limite de date"],
          ["Profils familiaux", "Un régime par personne du foyer"],
          ["Analyse nutritionnelle", "Calories et macros sur la semaine"],
        ].map(([t,s],i) => (
          <div key={t} className="flex" style={{ gap:12, padding:"13px 16px", borderTop:i?`1px solid ${c.line}`:"none" }}>
            <Check size={17} color={c.leaf} style={{ flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ ...UI, fontSize:15, color:c.ink }}>{t}</div>
              <div style={{ ...UI, fontSize:12.5, color:c.inkSoft, marginTop:2 }}>{s}</div>
            </div>
          </div>
        ))}
      </Card>

      <Btn c={c} onClick={onSubscribe}>Essayer 7 jours gratuitement</Btn>
      <div style={{ ...UI, fontSize:12.5, color:c.inkSoft, marginTop:14, lineHeight:1.5, textAlign:"center" }}>
        Sans engagement, résiliable à tout moment. La version gratuite reste utilisable avec un planning par semaine.
      </div>
    </Sheet>
  );
}

/* ==================================================================
   18. Application
   ================================================================== */

const TABS = [
  { k:"accueil", l:"Accueil", I:Home },
  { k:"planning", l:"Planning", I:CalendarDays },
  { k:"courses", l:"Courses", I:ShoppingCart },
  { k:"communaute", l:"Communauté", I:Users },
  { k:"recettes", l:"Recettes", I:ChefHat },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const c = T(dark);

  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("accueil");
  const [overlay, setOverlay] = useState(null);   // profile | stats | notifs | generator

  const [gen, setGen] = useState(null);           // { plan, slots, total }
  const [rebalanced, setRebalanced] = useState(false);
  const [quota, setQuota] = useState(1);
  const [premium, setPremium] = useState(false);

  const [checked, setChecked] = useState(new Set());
  const [overrides, setOverrides] = useState({});
  const [removed, setRemoved] = useState(new Set());
  const [actual, setActual] = useState({});
  const [favorites, setFavorites] = useState(new Set(["curry"]));
  const [expenses, setExpenses] = useState([{ label:"Courses Carrefour", amount:43.72 }]);

  const [posts, setPosts] = useState(SEED_POSTS);
  const [notifs, setNotifs] = useState(SEED_NOTIFS);
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIF_TOPICS.map((t) => [t.k, true]))
  );

  const [recipe, setRecipe] = useState(null);
  const [post, setPost] = useState(null);
  const [live, setLive] = useState(null);
  const [compose, setCompose] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const unread = notifs.filter((n) => n.unread).length;
  const household = profile?.household || 2;
  const slots = gen?.slots || ["midi","soir"];

  const plan = useMemo(() => {
    if (!gen) return [];
    return rebalanced
      ? rebalance(gen.plan, gen.slots, 2, { diet:profile.diet, allergies:profile.allergies, maxTime:profile.maxTime })
      : gen.plan;
  }, [gen, rebalanced, profile]);

  const list = useMemo(() => {
    if (!plan.length) return [];
    return buildList(plan, slots, household)
      .filter((i) => !removed.has(i.id))
      .map((i) => {
        const m = overrides[i.id] ?? 1;
        return { ...i, qty:Math.round(i.qty*m*10)/10, price:i.price*m };
      });
  }, [plan, slots, household, overrides, removed]);

  /* ---- Parcours d'entrée ---- */
  if (!authed) return <Frame c={c}><AuthScreen c={c} onDone={() => setAuthed(true)} /></Frame>;
  if (!profile) return <Frame c={c}><Onboarding c={c} onDone={(p) => { setProfile(p); setOverlay("generator"); }} /></Frame>;

  const spent = expenses.reduce((s,e) => s+e.amount, 0);
  const toggleFav = (id) => {
    const n = new Set(favorites); n.has(id) ? n.delete(id) : n.add(id); setFavorites(n);
  };

  /* ---- Écrans superposés ---- */
  const overlayScreen = {
    generator: (
      <GeneratorScreen c={c} p={profile} quota={quota} onBack={() => gen && setOverlay(null)}
        onPaywall={() => setPaywall(true)}
        onGenerated={(res) => {
          setGen(res); setRebalanced(false); setChecked(new Set()); setRemoved(new Set());
          setOverrides({}); setQuota(premium ? quota : quota-1); setOverlay(null); setTab("planning");
        }} />
    ),
    profile: (
      <ProfileScreen c={c} p={profile} setP={setProfile} dark={dark} setDark={setDark}
        expenses={expenses} premium={premium} onPaywall={() => setPaywall(true)}
        onStats={() => setOverlay("stats")}
        addExpense={(v) => setExpenses([...expenses,{ label:"Dépense manuelle", amount:v }])}
        reset={() => { setProfile(null); setAuthed(false); setGen(null); setOverlay(null); }}
        onBack={() => setOverlay(null)} />
    ),
    stats: <StatsScreen c={c} p={profile} expenses={expenses} onBack={() => setOverlay(null)} />,
    notifs: (
      <NotificationsScreen c={c} notifs={notifs} prefs={prefs} setPrefs={setPrefs}
        markRead={() => setNotifs((ns) => ns.map((n) => ({ ...n, unread:false })))}
        onBack={() => setOverlay(null)} />
    ),
  }[overlay];

  if (overlayScreen) {
    return (
      <Frame c={c}>
        <div className="flex-1" style={{ overflowY:"auto" }}>{overlayScreen}</div>
        {paywall && <PaywallSheet c={c} onClose={() => setPaywall(false)}
          onSubscribe={() => { setPremium(true); setQuota(99); setPaywall(false); }} />}
      </Frame>
    );
  }

  const headProps = {
    onProfile:() => setOverlay("profile"), onNotifs:() => setOverlay("notifs"), unread,
  };

  return (
    <Frame c={c}>
      <div className="flex-1" style={{ overflowY:"auto" }}>
        {tab==="accueil" && (
          <HomeScreen c={c} p={profile} spent={spent} plan={plan} slots={slots} list={list}
            openRecipe={setRecipe} go={setTab} {...headProps}
            onStats={() => setOverlay("stats")} onGenerate={() => setOverlay("generator")}
            onRebalance={() => setRebalanced(true)} rebalanced={rebalanced} />
        )}
        {tab==="planning" && (
          <PlanningScreen c={c} p={profile} plan={plan} slots={slots} openRecipe={setRecipe}
            onGenerate={() => setOverlay("generator")} {...headProps} />
        )}
        {tab==="courses" && (
          <CoursesScreen c={c} p={profile} list={list} checked={checked}
            toggle={(id) => { const n = new Set(checked); n.has(id)?n.delete(id):n.add(id); setChecked(n); }}
            bump={(id,d) => setOverrides({ ...overrides, [id]:Math.max(0.5,(overrides[id]??1)+d*0.5) })}
            remove={(id) => setRemoved(new Set([...removed,id]))}
            actual={actual} setActual={setActual} {...headProps}
            onComplete={(t) => { setExpenses([...expenses,{ label:"Courses de la semaine", amount:t }]); setTab("accueil"); }} />
        )}
        {tab==="communaute" && (
          <CommunityScreen c={c} p={profile} posts={posts} openPost={setPost} openLive={setLive}
            onCompose={() => setCompose(true)} {...headProps} />
        )}
        {tab==="recettes" && (
          <RecipesScreen c={c} p={profile} openRecipe={setRecipe} favorites={favorites}
            toggleFav={toggleFav} {...headProps} />
        )}
      </div>

      <nav className="flex" style={{ borderTop:`1px solid ${c.line}`, background:c.card, paddingBottom:6 }}>
        {TABS.map(({ k,l,I }) => (
          <button key={k} onClick={() => setTab(k)} aria-current={tab===k ? "page" : undefined}
            className="flex flex-col items-center"
            style={{ flex:1, gap:4, padding:"11px 0 7px", background:"none", border:"none", cursor:"pointer",
              color:tab===k?c.leaf:c.inkSoft }}>
            <I size={21} strokeWidth={tab===k?2.4:1.8} />
            <span style={{ ...UI, fontSize:10.5, fontWeight:tab===k?700:400 }}>{l}</span>
          </button>
        ))}
      </nav>

      <RecipeSheet c={c} r={recipe} household={household} onClose={() => setRecipe(null)}
        favorites={favorites} toggleFav={toggleFav} />
      <PostSheet c={c} post={post} onClose={() => setPost(null)} />
      <LiveSheet c={c} live={live} onClose={() => setLive(null)} />
      {compose && (
        <ComposeSheet c={c} onClose={() => setCompose(false)}
          onPublish={({ title, body, space }) => {
            setPosts([{ id:Date.now(), space, author:"moi", title, body, votes:0, comments:0,
              ago:"à l'instant", pending:true }, ...posts]);
            setCompose(false);
          }} />
      )}
      {paywall && <PaywallSheet c={c} onClose={() => setPaywall(false)}
        onSubscribe={() => { setPremium(true); setQuota(99); setPaywall(false); }} />}
    </Frame>
  );
}

function Frame({ c, children }) {
  return (
    <div className="flex items-center justify-center" style={{ background:"#DDE3D6", minHeight:"100vh" }}>
      <div className="flex flex-col" style={{ width:"100%", maxWidth:420, height:"100vh", maxHeight:880,
        background:c.paper, overflow:"hidden", position:"relative" }}>{children}</div>
    </div>
  );
}
