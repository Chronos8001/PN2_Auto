// Table officielle des mesures et valeurs de Pavillon Noir 2
const tableMesuresVal = [
    {m: 1/10, v: -10}, {m: 1/8, v: -9}, {m: 1/7, v: -8}, {m: 1/5, v: -7}, {m: 1/4, v: -6},
    {m: 1/3, v: -5}, {m: 2/5, v: -4}, {m: 1/2, v: -3}, {m: 3/5, v: -2}, {m: 4/5, v: -1},
    {m: 1, v: 0}, {m: 1.25, v: 1}, {m: 1.5, v: 2}, {m: 2, v: 3}, {m: 2.5, v: 4},
    {m: 3, v: 5}, {m: 4, v: 6}, {m: 5, v: 7}, {m: 6, v: 8}, {m: 8, v: 9},
    {m: 10, v: 10}, {m: 12.5, v: 11}, {m: 15, v: 12}, {m: 20, v: 13}, {m: 25, v: 14},
    {m: 30, v: 15}, {m: 40, v: 16}, {m: 50, v: 17}, {m: 60, v: 18}, {m: 80, v: 19},
    {m: 100, v: 20}, {m: 125, v: 21}, {m: 150, v: 22}, {m: 200, v: 23}, {m: 250, v: 24},
    {m: 300, v: 25}, {m: 400, v: 26}, {m: 500, v: 27}, {m: 600, v: 28}, {m: 800, v: 29}
];

// Définition des officiers par type d'action (Efficacité / Commandement)
const configsOfficiers = {
    artillerie: [
        {nom: "Capitaine (Balistique / VC)", eff: 5, vc: 7},
        {nom: "Second (Meneur d'hommes / VC)", eff: 4, vc: 6},
        {nom: "Canonnier (Balistique / VC)", eff: 6, vc: 6},
        {nom: "Maître canonnier (Pointage / VC)", eff: 5, vc: 7}
    ],
    combat: [
        {nom: "Capitaine (Meneur d'hommes / VC x2)", eff: 6, vc: 8, doubleVC: true},
        {nom: "Second (Tactique / VC)", eff: 5, vc: 7},
        {nom: "Canonnier (Meneur d'hommes / VC)", eff: 4, vc: 5}
    ],
    habilete: [
        {nom: "Chef du groupe (Meneur d'hommes / VC)", eff: 5, vc: 7}
    ],
    manoeuvre: [
        {nom: "Capitaine (Hydrographie / VC)", eff: 5, vc: 7},
        {nom: "Second (Connaissances nautiques / VC)", eff: 4, vc: 6},
        {nom: "Maître d'équipage (Pratique nautique / VC)", eff: 6, vc: 7},
        {nom: "Quartier-maître (Timonerie / VC)", eff: 4, vc: 8}
    ],
    recharge: [
        {nom: "Canonnier (Meneur d'hommes / VC)", eff: 5, vc: 6},
        {nom: "Maître canonnier (Recharge de pièces / VC)", eff: 6, vc: 7},
        {nom: "Maître d'équipage (Intimidation / VC)", eff: 4, vc: 6},
        {nom: "Quartier-maître (Connaissances nautiques / VC)", eff: 4, vc: 8}
    ],
    ruse: [
        {nom: "Capitaine (Meneur d'hommes / VC)", eff: 5, vc: 7},
        {nom: "Second (Tactique / VC)", eff: 4, vc: 6},
        {nom: "Canonnier (Vigilance / VC)", eff: 4, vc: 6},
        {nom: "Quartier-maître (Discrétion / VC)", eff: 6, vc: 8}
    ]
};

// Trouve la valeur la plus proche dans la table pour une mesure donnée (avec extrapolation si hors-bornes)
function trouverLigneParMesure(mesure) {
    if (mesure <= 0) return {m: 0.1, v: -10};
    
    // Si la mesure est dans les limites de la table, on cherche l'élément le plus proche
    if (mesure >= 0.1 && mesure <= 800) {
        return tableMesuresVal.reduce((prev, curr) => Math.abs(curr.m - mesure) < Math.abs(prev.m - mesure) ? curr : prev);
    }
    
    // Extrapolation logarithmique pour les valeurs hors table (v = 10 * log10(m))
    let vApprox = Math.round(10 * Math.log10(mesure));
    return { m: mesure, v: vApprox };
}

// Applique la règle de la table de resolution d'action de groupe
function calculerDetailTable(mesureInitiale, netSucces) {
    let ligneInitiale = trouverLigneParMesure(mesureInitiale);
    let valeurFinaleNum = (ligneInitiale.v - 10) + (netSucces * 2);
    
    // Recherche dans la table
    let resultatTable = tableMesuresVal.find(item => item.v === valeurFinaleNum);
    let mesureFinale;
    
    if (resultatTable) {
        mesureFinale = resultatTable.m;
    } else {
        // Formule d'extrapolation : mesure = 10^(v/10)
        let approx = Math.pow(10, valeurFinaleNum / 10);
        mesureFinale = Math.max(0, Math.round(approx * 10) / 10);
    }
    
    return { valInitiale: ligneInitiale.v, valFinale: valeurFinaleNum, mesureFinale: mesureFinale };
}

// Met à jour la résolution de l'opposition
function resoudreOpposition() {
    const sJInput = document.getElementById('succesJoueurs');
    const sAInput = document.getElementById('succesAdverses');
    const mesureInitInput = document.getElementById('mesureInitiale');
    
    if (!sJInput || !sAInput || !mesureInitInput) return;
    
    let sJ = parseInt(sJInput.value) || 0;
    let sA = parseInt(sAInput.value) || 0;
    let mesureInit = parseFloat(mesureInitInput.value) || 1;
    let reussiteJoueurs = sJ - sA; 

    let html = "";
    if (reussiteJoueurs > 0) {
        let res = calculerDetailTable(mesureInit, reussiteJoueurs);
        html += `✅ <strong>Victoire des Joueurs</strong> (Réussite nette : +${reussiteJoueurs})<br>`;
        html += `• Valeur table : ${res.valInitiale} ➔ Remontée (-10) + ${reussiteJoueurs * 2} colonnes = <strong>Valeur finale : ${res.valFinale >= 0 ? '+' : ''}${res.valFinale}</strong><br>`;
        html += `• <strong>Mesure correspondante : ${res.mesureFinale}</strong> (ex: nombre d'hommes touchés ou dégâts appliqués)`;
    } else if (reussiteJoueurs < 0) {
        let netAdverse = Math.abs(reussiteJoueurs);
        let res = calculerDetailTable(mesureInit, netAdverse);
        html += `❌ <strong>Échec des Joueurs / Riposte adverse</strong> (Réussite nette adverse : +${netAdverse})<br>`;
        html += `• Valeur table : ${res.valInitiale} ➔ Remontée (-10) + ${netAdverse * 2} colonnes = <strong>Valeur finale : ${res.valFinale >= 0 ? '+' : ''}${res.valFinale}</strong><br>`;
        html += `• <strong>Mesure correspondante subie par les PJ : ${res.mesureFinale}</strong>`;
    } else {
        html += `⚖️ <strong>Égalité parfaite</strong> : Aucun effet majeur (les succès s'annulent).`;
    }
    
    const resBox = document.getElementById('resultatOpposition');
    if (resBox) resBox.innerHTML = html;
}

// Gère le changement d'action
function changerAction() {
    const typeActionSelect = document.getElementById('typeAction');
    if (!typeActionSelect) return;
    
    const type = typeActionSelect.value;
    const officiers = configsOfficiers[type];
    if (!officiers) return;
    
    let html = "<h3>Officiers impliqués</h3><div class='grid-2'>";

    officiers.forEach((off, index) => {
        html += `<div>
            <label>${off.nom}</label>
            <div style="display:flex; gap:5px;">
                <input type="number" id="eff_${index}" value="${off.eff}" placeholder="Compétence" oninput="calculerTestGroup()" title="Compétence individuelle">
                <input type="number" id="vc_${index}" value="${off.vc}" placeholder="VC" oninput="calculerTestGroup()" title="Valeur de commandement">
            </div>
        </div>`;
    });
    html += "</div>";
    
    const zoneOfficiers = document.getElementById('zoneOfficiers');
    if (zoneOfficiers) {
        zoneOfficiers.innerHTML = html;
    }
    calculerTestGroup();
}

// Calcule le test de groupe
function calculerTestGroup() {
    const typeActionSelect = document.getElementById('typeAction');
    const niveauMatelotsSelect = document.getElementById('niveauMatelots');
    if (!typeActionSelect || !niveauMatelotsSelect) return;
    
    const type = typeActionSelect.value;
    const officiers = configsOfficiers[type];
    if (!officiers) return;
    
    const modMatelots = parseInt(niveauMatelotsSelect.value) || 0;

    let sommeEff = 0;
    let sommeVC = 0;
    let diviseurEff = officiers.length;
    let diviseurVC = officiers.length;

    officiers.forEach((off, index) => {
        const effInput = document.getElementById(`eff_${index}`);
        const vcInput = document.getElementById(`vc_${index}`);
        
        let e = effInput ? (parseFloat(effInput.value) || 0) : off.eff;
        let v = vcInput ? (parseFloat(vcInput.value) || 0) : off.vc;

        sommeEff += e;
        if (off.doubleVC) {
            sommeVC += (v * 2);
            diviseurVC += 1; // Le VC du capitaine compte double dans la moyenne de facilité pour le combat
        } else {
            sommeVC += v;
        }
    });

    // Moyennes
    let efficaciteBase = sommeEff / diviseurEff;
    let faciliteBase = sommeVC / diviseurVC;

    // Calcul final : Efficacité arrondie en dés, Facilité = Moyenne VC + Modificateur matelots
    let desFinal = Math.round(efficaciteBase);
    let faciliteFinale = Math.round(faciliteBase + modMatelots);

    const resTest = document.getElementById('resultatTest');
    if (resTest) {
        resTest.innerHTML = `
            Jet de Groupe conseillé : <strong>${desFinal} F ${faciliteFinale}</strong><br>
            <span style="font-size:0.85em; color: #444;">
                • Efficacité de base : ${efficaciteBase.toFixed(1)} ➔ <strong>${desFinal} dés</strong><br>
                • Facilité de base : ${faciliteBase.toFixed(1)} + Modif Matelots (${modMatelots >= 0 ? '+' + modMatelots : modMatelots}) = <strong>Seuil de ${faciliteFinale}</strong>
            </span>
        `;
    }
}

// --- CONFIGURATION ET GESTION DES DÉGÂTS DU NAVIRE ---

const NIVEAUX_DEGATS = {
    "OK": 0,
    "Léger": 1,
    "Sérieux": 2,
    "Grave": 3,
    "Critique": 4,
    "Ponton ou Ravagé": 5,
    "Coulé": 6
};

const LABELS_DEGATS = ["OK", "Léger", "Sérieux", "Grave", "Critique", "Ponton ou Ravagé", "Coulé"];

const TABLE_SANTE_EQUIPAGE = [
    { maxSum: -4, l: 0, s: 0, g: 0, c: 0 },
    { maxSum: -3, l: 0, s: 0, g: 1, c: 1 },
    { maxSum: -2, l: 0, s: 1, g: 1, c: 1 },
    { maxSum: -1, l: 0, s: 1, g: 1, c: 1 },
    { maxSum: 0,  l: 1, s: 1, g: 1, c: 1 },
    { maxSum: 1,  l: 2, s: 1, g: 1, c: 1 },
    { maxSum: 2,  l: 2, s: 2, g: 1, c: 1 },
    { maxSum: 3,  l: 2, s: 2, g: 2, c: 1 },
    { maxSum: Infinity, l: 2, s: 2, g: 2, c: 2 }
];

let currentShipState = {
    presets: {
        espadon: { mature: 125, coque: 125 },
        chaloupe: { mature: 10, coque: 10 },
        corvette: { mature: 80, coque: 80 },
        galion: { mature: 250, coque: 250 }
    },
    localisations: {
        // Mâture
        misaine: { label: "Misaine (Fore Mast)", type: "mature", current: 125, max: 125, criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        grand_mat: { label: "Grand Mât (Main Mast)", type: "mature", current: 125, max: 125, criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        artimon: { label: "Artimon (Mizzen Mast)", type: "mature", current: 125, max: 125, criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        // Coque
        proue: { label: "Proue (Bow)", type: "coque", current: 125, max: 125, weapons: "Pièces de chasse", criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        entrepont_babord: { label: "Entrepont Bâbord", type: "coque", current: 125, max: 125, weapons: "Bordée Bâbord", criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        entrepont_tribord: { label: "Entrepont Tribord", type: "coque", current: 125, max: 125, weapons: "Bordée Tribord", criticals: { a: false, b: false, c: false, d: false, e: false, f: false } },
        poupe: { label: "Poupe (Stern)", type: "coque", current: 125, max: 125, weapons: "Pièces de fuite", criticals: { a: false, b: false, c: false, d: false, e: false, f: false } }
    },
    crewInjuries: {
        legeres: 0,
        serieuses: 0,
        graves: 0,
        critiques: 0
    }
};

function querySanteEquipage(sum) {
    if (sum <= -4) return TABLE_SANTE_EQUIPAGE[0];
    if (sum === -3) return TABLE_SANTE_EQUIPAGE[1];
    if (sum === -2) return TABLE_SANTE_EQUIPAGE[2];
    if (sum === -1) return TABLE_SANTE_EQUIPAGE[3];
    if (sum === 0) return TABLE_SANTE_EQUIPAGE[4];
    if (sum === 1) return TABLE_SANTE_EQUIPAGE[5];
    if (sum === 2) return TABLE_SANTE_EQUIPAGE[6];
    if (sum === 3) return TABLE_SANTE_EQUIPAGE[7];
    return TABLE_SANTE_EQUIPAGE[8];
}

function calculerSeuilsTable(maxPS) {
    let ligne = trouverLigneParMesure(maxPS);
    let v = ligne.v;
    
    let getM = (vTarget) => {
        let found = tableMesuresVal.find(item => item.v === vTarget);
        if (found) return found.m;
        let approx = Math.pow(10, vTarget / 10);
        return Math.max(0.1, Math.round(approx * 10) / 10);
    };
    
    let leger = Math.round(getM(v - 1));
    let serieux = Math.round(getM(v - 2));
    let grave = Math.round(getM(v - 4));
    let critique = Math.round(getM(v - 7));
    
    leger = Math.min(maxPS - 1, leger);
    serieux = Math.min(leger - 1, serieux);
    grave = Math.min(serieux - 1, grave);
    critique = Math.min(grave - 1, critique);
    
    leger = Math.max(1, leger);
    serieux = Math.max(1, serieux);
    grave = Math.max(1, grave);
    critique = Math.max(1, critique);
    
    return { ok: maxPS, leger, serieux, grave, critique, ponton: 0 };
}

function calculerSeuilsDirect(maxPS) {
    let leger = Math.round(maxPS * 4 / 5);
    let serieux = Math.round(maxPS * 3 / 5);
    let grave = Math.round(maxPS * 2 / 5);
    let critique = Math.round(maxPS * 1 / 5);
    
    leger = Math.min(maxPS - 1, leger);
    serieux = Math.min(leger - 1, serieux);
    grave = Math.min(serieux - 1, grave);
    critique = Math.min(grave - 1, critique);
    
    leger = Math.max(1, leger);
    serieux = Math.max(1, serieux);
    grave = Math.max(1, grave);
    critique = Math.max(1, critique);
    
    return { ok: maxPS, leger, serieux, grave, critique, ponton: 0 };
}

function getSeuilsForLoc(key) {
    let loc = currentShipState.localisations[key];
    let methodeSelect = document.getElementById("methodeSeuils");
    let methode = methodeSelect ? methodeSelect.value : "table";
    if (methode === "table") {
        return calculerSeuilsTable(loc.max);
    } else {
        return calculerSeuilsDirect(loc.max);
    }
}

function determinerEtat(ps, seuils) {
    if (ps < 0) return "Coulé";
    if (ps === 0) return "Ponton ou Ravagé";
    if (ps < seuils.critique) return "Critique";
    if (ps < seuils.grave) return "Critique";
    if (ps < seuils.serieux) return "Grave";
    if (ps < seuils.leger) return "Sérieux";
    if (ps < seuils.ok) return "Léger";
    return "OK";
}

function getBadgeClass(etat) {
    switch (etat) {
        case "OK": return "badge-ok";
        case "Léger": return "badge-leger";
        case "Sérieux": return "badge-serieux";
        case "Grave": return "badge-grave";
        case "Critique": return "badge-critique";
        case "Ponton ou Ravagé": return "badge-ponton";
        case "Coulé": return "badge-coule";
        default: return "badge-ok";
    }
}

function getBarClass(etat) {
    switch (etat) {
        case "OK": return "bar-ok";
        case "Léger": return "bar-leger";
        case "Sérieux": return "bar-serieux";
        case "Grave": return "bar-grave";
        case "Critique": return "bar-critique";
        case "Ponton ou Ravagé": return "bar-ponton";
        case "Coulé": return "bar-coule";
        default: return "bar-ok";
    }
}

function genererLocalisationsUI() {
    const listMature = document.getElementById("listeMature");
    const listCoque = document.getElementById("listeCoque");
    if (!listMature || !listCoque) return;

    let htmlMature = "";
    let htmlCoque = "";

    for (let key in currentShipState.localisations) {
        let loc = currentShipState.localisations[key];
        let seuils = getSeuilsForLoc(key);
        let etat = determinerEtat(loc.current, seuils);
        let badgeClass = getBadgeClass(etat);
        let barClass = getBarClass(etat);
        let percent = loc.max > 0 ? Math.max(0, Math.min(100, (loc.current / loc.max) * 100)) : 0;
        
        let criticalCheckboxes = "";
        ['a', 'b', 'c', 'd', 'e', 'f'].forEach(letter => {
            let checked = loc.criticals[letter] ? "checked" : "";
            criticalCheckboxes += `<label><input type="checkbox" onchange="toggleCritique('${key}', '${letter}', this.checked)" ${checked}>${letter}</label>`;
        });

        let cardHtml = `
            <div class="loc-card" id="card_${key}">
                <div class="loc-header">
                    <span class="loc-title">${loc.label}</span>
                    <span class="loc-badge ${badgeClass}">${etat}</span>
                </div>
                <div style="font-size: 0.8em; color: #555; margin-bottom: 5px;">
                    Structure : <strong>${loc.current} / ${loc.max} PS</strong>
                    ${loc.weapons ? `<br><span style="font-style: italic; color:#7f2727;">Artillerie : ${loc.weapons}</span>` : ""}
                </div>
                
                <div class="ps-bar-container">
                    <div class="ps-bar ${barClass}" style="width: ${percent}%;"></div>
                </div>
                
                <div class="loc-controls">
                    <button class="btn-ps" onclick="ajusterPS('${key}', -5)">-5</button>
                    <button class="btn-ps" onclick="ajusterPS('${key}', -1)">-</button>
                    <input type="number" value="${loc.current}" style="width:65px; margin:0; text-align:center; padding: 4px;" onchange="definirPS('${key}', this.value)">
                    <button class="btn-ps" onclick="ajusterPS('${key}', 1)">+</button>
                    <button class="btn-ps" onclick="ajusterPS('${key}', 5)">+5</button>
                </div>
                
                <div class="critical-flag-group">
                    <span>Critiques:</span>
                    <div class="critical-flags">
                        ${criticalCheckboxes}
                    </div>
                </div>
                
                <button class="btn-repair" onclick="reparerUnNiveau('${key}')">Réparer 1 Niv</button>
            </div>
        `;

        if (loc.type === "mature") {
            htmlMature += cardHtml;
        } else {
            htmlCoque += cardHtml;
        }
    }

    listMature.innerHTML = htmlMature;
    listCoque.innerHTML = htmlCoque;
}

function ajusterPS(key, val) {
    let loc = currentShipState.localisations[key];
    loc.current = Math.min(loc.max, Math.max(-50, loc.current + val));
    recalculerTout();
}

function definirPS(key, val) {
    let loc = currentShipState.localisations[key];
    let num = parseInt(val);
    if (isNaN(num)) num = loc.max;
    loc.current = Math.min(loc.max, Math.max(-50, num));
    recalculerTout();
}

function toggleCritique(key, letter, checked) {
    currentShipState.localisations[key].criticals[letter] = checked;
    recalculerTout();
}

function reparerUnNiveau(key) {
    let loc = currentShipState.localisations[key];
    let seuils = getSeuilsForLoc(key);
    let etat = determinerEtat(loc.current, seuils);
    
    let target = loc.current;
    if (etat === "Coulé") {
        target = 0;
    } else if (etat === "Ponton ou Ravagé") {
        target = seuils.critique;
    } else if (etat === "Critique") {
        target = seuils.grave;
    } else if (etat === "Grave") {
        target = seuils.serieux;
    } else if (etat === "Sérieux") {
        target = seuils.leger;
    } else if (etat === "Léger") {
        target = seuils.ok;
    }
    
    loc.current = target;
    recalculerTout();
}

function appliquerPresetNavire() {
    const presetSelect = document.getElementById("presetNavire");
    const maxMatureInput = document.getElementById("maxPSMature");
    const maxCoqueInput = document.getElementById("maxPSCoque");
    if (!presetSelect || !maxMatureInput || !maxCoqueInput) return;

    const key = presetSelect.value;
    if (key === "personnalise") return;

    const values = currentShipState.presets[key];
    if (values) {
        maxMatureInput.value = values.mature;
        maxCoqueInput.value = values.coque;
        mettreAJourMaxPS();
    }
}

function mettreAJourMaxPS() {
    const maxMatureInput = document.getElementById("maxPSMature");
    const maxCoqueInput = document.getElementById("maxPSCoque");
    if (!maxMatureInput || !maxCoqueInput) return;

    const maxMature = parseInt(maxMatureInput.value) || 100;
    const maxCoque = parseInt(maxCoqueInput.value) || 100;

    for (let key in currentShipState.localisations) {
        let loc = currentShipState.localisations[key];
        let oldMax = loc.max;
        let isMature = loc.type === "mature";
        loc.max = isMature ? maxMature : maxCoque;
        
        if (loc.current === oldMax || loc.current > loc.max) {
            loc.current = loc.max;
        }
    }
    recalculerTout();
}

function calculerEtatGeneralMature() {
    let m1 = determinerEtat(currentShipState.localisations.misaine.current, getSeuilsForLoc("misaine"));
    let m2 = determinerEtat(currentShipState.localisations.grand_mat.current, getSeuilsForLoc("grand_mat"));
    let m3 = determinerEtat(currentShipState.localisations.artimon.current, getSeuilsForLoc("artimon"));
    
    let v1 = NIVEAUX_DEGATS[m1];
    let v2 = NIVEAUX_DEGATS[m2];
    let v3 = NIVEAUX_DEGATS[m3];
    
    let maxV = Math.max(v1, v2, v3);
    
    if (maxV === 0) {
        return "OK";
    }
    
    let count = 0;
    if (v1 === maxV) count++;
    if (v2 === maxV) count++;
    if (v3 === maxV) count++;
    
    if (count > 1) {
        let finalV = Math.min(5, maxV + 1);
        return LABELS_DEGATS[finalV];
    }
    
    return LABELS_DEGATS[maxV];
}

function getModifsMature(etatGen) {
    switch (etatGen) {
        case "OK": return { vit: 0, man: 0 };
        case "Léger": return { vit: 0, man: 0 };
        case "Sérieux": return { vit: -1, man: -1 };
        case "Grave": return { vit: -2, man: -2 };
        case "Critique": return { vit: -4, man: -4 };
        case "Ponton ou Ravagé": return { vit: -6, man: -6 };
        default: return { vit: 0, man: 0 };
    }
}

function getModifsVoilure(voilure) {
    switch (voilure) {
        case "tres_sous_toile": return { vit: -2, man: 2, label: "Très sous-toilé" };
        case "sous_toile": return { vit: -1, man: 1, label: "Sous-toilé" };
        case "normale": return { vit: 0, man: 0, label: "Normale" };
        case "surtoile": return { vit: 1, man: -2, label: "Surtoilé" };
        case "tres_surtoile": return { vit: 2, man: -4, label: "Très surtoilé" };
        default: return { vit: 0, man: 0, label: "Normale" };
    }
}

function getModifsVent(vent) {
    switch (vent) {
        case "calme": return { vit: 0, man: 0, label: "Calme plat", special: "Seuls des avirons peuvent faire avancer ou tourner le navire." };
        case "petit": return { vit: -1, man: 0, label: "Petit temps", special: "Jamais de Test de Gros Temps. Le navire ne peut pas être surtoilé." };
        case "etabli": return { vit: 0, man: 0, label: "Établi", special: "" };
        case "frais": return { vit: 1, man: -1, label: "Frais", special: "" };
        case "grand_frais": return { vit: 2, man: -3, label: "Grand frais", special: "Vous devez effectuer un Test de Tenue dans le gros temps après chaque Test de Manœuvre." };
        case "tempete": return { vit: 3, man: -4, label: "Tempête", special: "Vous devez effectuer un Test de Tenue dans le gros temps après chaque Test de Manœuvre. Le navire ne peut pas être sous-toilé." };
        case "ouragan": return { vit: 4, man: -6, label: "Ouragan", special: "" };
        default: return { vit: 0, man: 0, label: "Établi", special: "" };
    }
}

function getModifsQualites() {
    let vit = 0;
    let man = 0;
    if (document.getElementById("qualiteRapide") && document.getElementById("qualiteRapide").checked) vit += 1;
    if (document.getElementById("qualiteManiable") && document.getElementById("qualiteManiable").checked) man += 1;
    if (document.getElementById("qualiteMauvaiseCarene") && document.getElementById("qualiteMauvaiseCarene").checked) vit -= 1;
    if (document.getElementById("qualiteTropMou") && document.getElementById("qualiteTropMou").checked) man -= 1;
    if (document.getElementById("qualiteMalFoutu") && document.getElementById("qualiteMalFoutu").checked) man -= 2;
    return { vit, man };
}

function recalculerTout() {
    genererLocalisationsUI();
    
    let etatGenMature = calculerEtatGeneralMature();
    let modMature = getModifsMature(etatGenMature);
    
    let voilureSelect = document.getElementById("voilureChoisie") ? document.getElementById("voilureChoisie").value : "normale";
    let modVoilure = getModifsVoilure(voilureSelect);
    
    let ventSelect = document.getElementById("forceVent") ? document.getElementById("forceVent").value : "etabli";
    let modVent = getModifsVent(ventSelect);
    
    let modQualites = getModifsQualites();
    
    let vitFinale = modMature.vit + modVoilure.vit + modVent.vit + modQualites.vit;
    let manFinale = modMature.man + modVoilure.man + modVent.man + modQualites.man;
    
    let babordState = determinerEtat(currentShipState.localisations.entrepont_babord.current, getSeuilsForLoc("entrepont_babord"));
    let tribordState = determinerEtat(currentShipState.localisations.entrepont_tribord.current, getSeuilsForLoc("entrepont_tribord"));
    let proueState = determinerEtat(currentShipState.localisations.proue.current, getSeuilsForLoc("proue"));
    let poupeState = determinerEtat(currentShipState.localisations.poupe.current, getSeuilsForLoc("poupe"));
    
    let getMalusArtillerie = (etat) => {
        switch (etat) {
            case "OK": return "<span style='color:#2d7a43; font-weight:bold;'>Aucun malus (OK)</span>";
            case "Léger": return "<span style='color:#2d7a43; font-weight:bold;'>Aucun malus (Léger)</span>";
            case "Sérieux": return "<span style='color:#b25e00; font-weight:bold;'>Malus de -1</span>";
            case "Grave": return "<span style='color:#b23000; font-weight:bold;'>Malus de -2</span>";
            case "Critique": return "<span style='color:#8b0000; font-weight:bold;'>Malus de -4</span>";
            case "Ponton ou Ravagé": return "<span style='color:#222; font-weight:bold; text-transform:uppercase;'>Désactivé (0 PS)</span>";
            case "Coulé": return "<span style='color:#000; font-weight:bold; text-transform:uppercase;'>Détruit / Coulé (<0 PS)</span>";
            default: return "+0";
        }
    };
    
    let alerts = [];
    
    for (let key in currentShipState.localisations) {
        let loc = currentShipState.localisations[key];
        if (loc.type === "coque") {
            if (loc.current < 0) {
                alerts.push(`🚨 <strong>LE NAVIRE COMMENCE À SOMBRER !</strong> (${loc.label} coulé : ${loc.current} PS)`);
            } else if (loc.current === 0) {
                alerts.push(`⚠️ <strong>Section coque ravagée (0 PS) !</strong> Voie d'eau potentielle sur la localisation : ${loc.label}.`);
            }
        }
    }
    
    if (ventSelect === "grand_frais" || ventSelect === "tempete") {
        if (voilureSelect === "surtoile" || voilureSelect === "tres_surtoile") {
            alerts.push(`🌊 <strong>Test de Tenue requis dans le gros temps</strong> après chaque test de manœuvre.`);
        }
    }
    
    if (ventSelect === "calme") {
        alerts.push(`🛶 <strong>Calme plat</strong> : seuls les avirons peuvent faire avancer ou tourner.`);
    }
    if (ventSelect === "tempete" && (voilureSelect === "sous_toile" || voilureSelect === "tres_sous_toile")) {
        alerts.push(`⚠️ <strong>Tempête</strong> : le navire ne peut théoriquement pas être sous-toilé !`);
    }
    if (ventSelect === "petit" && (voilureSelect === "surtoile" || voilureSelect === "tres_surtoile")) {
        alerts.push(`⚠️ <strong>Petit temps</strong> : le navire ne peut théoriquement pas être surtoilé !`);
    }

    let dashboardHtml = `
        <div class="dashboard-title">Tableau de Bord du Navire</div>
        <div class="dashboard-grid">
            <div class="dashboard-stat">
                <div style="font-size:0.9em; text-transform:uppercase; color:#b59a63;">État Général Mâture</div>
                <div class="dashboard-stat-val" style="font-size: 1.3em; margin: 10px 0; color:#fff;">${etatGenMature}</div>
                <div style="font-size: 0.8em; color: #ccc;">
                    Malus mâture seul : Vitesse ${modMature.vit >= 0 ? '+' : ''}${modMature.vit} / Manœuvre ${modMature.man >= 0 ? '+' : ''}${modMature.man}
                </div>
            </div>
            <div class="dashboard-stat">
                <div style="font-size:0.9em; text-transform:uppercase; color:#b59a63;">Navigation Finale</div>
                <div class="dashboard-stat-val" style="color: #ffca28; font-size: 1.2em; line-height:1.2;">
                    Vitesse cumulée : <strong>${vitFinale >= 0 ? '+' : ''}${vitFinale}</strong><br>
                    Manœuvre cumulée : <strong>${manFinale >= 0 ? '+' : ''}${manFinale}</strong>
                </div>
                <div style="font-size: 0.75em; color: #ccc; text-align:left; margin-top:5px; padding-left:10px;">
                    • Voilure: ${modVoilure.label} (Vit: ${modVoilure.vit}, Man: ${modVoilure.man})<br>
                    • Vent: ${modVent.label} (Vit: ${modVent.vit}, Man: ${modVent.man})<br>
                    • Qualités: Vit ${modQualites.vit >= 0 ? '+' : ''}${modQualites.vit}, Man ${modQualites.man >= 0 ? '+' : ''}${modQualites.man}
                </div>
            </div>
            
            <div class="dashboard-stat" style="grid-column: 1 / -1; text-align: left; font-size: 0.85em;">
                <div style="font-weight: bold; margin-bottom: 5px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 3px; color:#b59a63;">
                    Statut de l'Artillerie (Malus de Dégâts de Coque)
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div>• <strong>Pièces de Chasse (Proue)</strong> : ${getMalusArtillerie(proueState)}</div>
                    <div>• <strong>Pièces de Fuite (Poupe)</strong> : ${getMalusArtillerie(poupeState)}</div>
                    <div>• <strong>Bordée Bâbord</strong> : ${getMalusArtillerie(babordState)}</div>
                    <div>• <strong>Bordée Tribord</strong> : ${getMalusArtillerie(tribordState)}</div>
                </div>
            </div>
    `;
    
    if (alerts.length > 0) {
        dashboardHtml += `
            <div class="dashboard-alert">
                ${alerts.join('<br>')}
            </div>
        `;
    }
    
    dashboardHtml += `</div>`;
    
    const dbFinal = document.getElementById("dashboardFinal");
    if (dbFinal) dbFinal.innerHTML = dashboardHtml;
    
    calculerSanteEquipage();
    calculerMalusRecharge();
}

function calculerSanteEquipage() {
    const modCombatInput = document.getElementById("modifCombat");
    const modRechargeInput = document.getElementById("modifRecharge");
    const container = document.getElementById("casesSanteEquipage");
    if (!modCombatInput || !modRechargeInput || !container) return;

    let c = parseInt(modCombatInput.value) || 0;
    let r = parseInt(modRechargeInput.value) || 0;
    let sum = c + r;

    let row = querySanteEquipage(sum);

    currentShipState.crewInjuries.legeres = Math.min(row.l, currentShipState.crewInjuries.legeres);
    currentShipState.crewInjuries.serieuses = Math.min(row.s, currentShipState.crewInjuries.serieuses);
    currentShipState.crewInjuries.graves = Math.min(row.g, currentShipState.crewInjuries.graves);
    currentShipState.crewInjuries.critiques = Math.min(row.c, currentShipState.crewInjuries.critiques);

    let malusL = currentShipState.crewInjuries.legeres * -1;
    let malusS = currentShipState.crewInjuries.serieuses * -2;
    let malusG = currentShipState.crewInjuries.graves * -3;
    let malusC = currentShipState.crewInjuries.critiques * -4;
    let totalMalusSante = malusL + malusS + malusG + malusC;

    let renderBoxes = (type, count, checkedCount) => {
        let html = "";
        for (let i = 0; i < count; i++) {
            let isChecked = i < checkedCount;
            let checkedClass = isChecked ? "checked" : "";
            html += `<span class="crew-health-box ${checkedClass}" onclick="toggleCrewInjury('${type}', ${isChecked})">${isChecked ? 'X' : '&nbsp;'}</span>`;
        }
        return html || "<span style='color:#777; font-style:italic;'>Aucune case</span>";
    };

    let html = `
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 0.95em;">Somme des modifs : ${sum >= 0 ? '+' : ''}${sum}</div>
        <table style="width: 100%; font-size: 0.9em; border-collapse: collapse;">
            <tr>
                <td style="padding: 3px 0;"><strong>Légères (-1) :</strong></td>
                <td style="padding-left:10px;">${renderBoxes('legeres', row.l, currentShipState.crewInjuries.legeres)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 0;"><strong>Sérieuses (-2) :</strong></td>
                <td style="padding-left:10px;">${renderBoxes('serieuses', row.s, currentShipState.crewInjuries.serieuses)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 0;"><strong>Graves (-3) :</strong></td>
                <td style="padding-left:10px;">${renderBoxes('graves', row.g, currentShipState.crewInjuries.graves)}</td>
            </tr>
            <tr>
                <td style="padding: 3px 0;"><strong>Critiques (-4) :</strong></td>
                <td style="padding-left:10px;">${renderBoxes('critiques', row.c, currentShipState.crewInjuries.critiques)}</td>
            </tr>
        </table>
        <div style="margin-top: 8px; font-weight: bold; color: var(--accent-color); font-size: 0.95em;">
            Malus de Santé global : ${totalMalusSante} (appliqué aux tests)
        </div>
    `;

    container.innerHTML = html;
}

function toggleCrewInjury(type, isCurrentlyChecked) {
    if (isCurrentlyChecked) {
        currentShipState.crewInjuries[type]--;
    } else {
        currentShipState.crewInjuries[type]++;
    }
    currentShipState.crewInjuries[type] = Math.max(0, currentShipState.crewInjuries[type]);
    calculerSanteEquipage();
}

function calculerMalusRecharge() {
    const reqInput = document.getElementById("artilleursRequis");
    const actInput = document.getElementById("artilleursActifs");
    const resBox = document.getElementById("resultatMalusRecharge");
    if (!reqInput || !actInput || !resBox) return;

    let req = parseInt(reqInput.value) || 1;
    let act = parseInt(actInput.value) || 0;
    
    if (act >= req) {
        resBox.innerHTML = `
            <strong>Aucun malus (100% opérationnel)</strong><br>
            <span style="font-size:0.85em; color: #555;">
                Effectif suffisant (${act} / ${req} artilleurs).
            </span>
        `;
        return;
    }

    let ratio = act / req;
    let ligne = trouverLigneParMesure(ratio);
    
    let malus = ligne.v;
    
    resBox.innerHTML = `
        Malus au Test de Recharge : <strong style="color: var(--accent-color); font-size: 1.2em;">${malus}</strong><br>
        <span style="font-size:0.85em; color: #555;">
            • Ratio d'effectif : ${(ratio * 100).toFixed(0)}% (${act}/${req})<br>
            • Mesure table la plus proche : ${ligne.m.toFixed(2)} (Valeur : ${ligne.v})
        </span>
    `;
}

// Gestion du basculement d'onglets (Windows/Tabs)
function switchTab(tabId) {
    // Masquer tous les contenus d'onglets
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active-content');
    });

    // Désactiver tous les boutons d'onglets
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Afficher le contenu de l'onglet sélectionné
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active-content');
    }

    // Activer le bouton de l'onglet cliqué
    const clickedButton = Array.from(buttons).find(btn => btn.getAttribute('onclick').includes(tabId));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Initialisation au chargement de la page
window.onload = function() {
    resoudreOpposition();
    changerAction();
    recalculerTout();
};
