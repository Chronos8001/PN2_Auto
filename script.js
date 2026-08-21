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

// Initialisation au chargement de la page
window.onload = function() {
    resoudreOpposition();
    changerAction();
};
