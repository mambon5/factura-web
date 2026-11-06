import { jsPDF } from 'jspdf';

const form = document.getElementById('nomina-form');

const preview = {
    periodo: document.getElementById('prev-periodo'),
    dies: document.getElementById('prev-dies'),
    empNom: document.getElementById('prev-emp-nom'),
    empCif: document.getElementById('prev-emp-cif'),
    empDom: document.getElementById('prev-emp-adreca') || document.getElementById('prev-emp-dom'),
    empPob: document.getElementById('prev-emp-poblacion') || document.getElementById('prev-emp-pob'),
    empCcc: document.getElementById('prev-emp-ccc'),
    trabNom: document.getElementById('prev-trab-nom'),
    trabNif: document.getElementById('prev-trab-nif'),
    trabSs: document.getElementById('prev-trab-ss'),
    trabCat: document.getElementById('prev-trab-cat'),
    trabAnt: document.getElementById('prev-trab-antiguedad') || document.getElementById('prev-trab-ant'),

    // Devengos
    salBase: document.getElementById('prev-sal-base'),
    complementos: document.getElementById('prev-complementos'),
    extraJun: document.getElementById('prev-extra-jun'),
    extraDic: document.getElementById('prev-extra-dic'),
    totDev: document.getElementById('prev-tot-dev'),

    // Deduccions treballadora
    dedCC: document.getElementById('prev-ded-cc'),
    dedMEI: document.getElementById('prev-ded-mei'),
    dedDes: document.getElementById('prev-ded-des'),
    totDed: document.getElementById('prev-tot-ded'),
    liquid: document.getElementById('prev-liquid'),

    // Seguretat Social - Totals
    ssTotalPagarAvia: document.getElementById('prev-ss-total-pagar-avia'),
    ssCuotaCompleta: document.getElementById('prev-ss-cuota-completa'),
    ssDescuentoTotal: document.getElementById('prev-ss-descuento-total'),
    ssBase: document.getElementById('prev-ss-base'),

    // Seguretat Social - Cuota Empleador (Àvia)
    empCC_pagar: document.getElementById('prev-emp-cc-pagar') || document.getElementById('prev-emp-cc'),
    empCC_brut: document.getElementById('prev-emp-cc-brut'),
    empProf: document.getElementById('prev-emp-prof'),
    empDes_pagar: document.getElementById('prev-emp-des-pagar') || document.getElementById('prev-emp-des'),
    empDes_brut: document.getElementById('prev-emp-des-brut'),
    empMEI: document.getElementById('prev-emp-mei'),
    empFogasa_pagar: document.getElementById('prev-emp-fogasa-pagar') || document.getElementById('prev-emp-fogasa'),
    empFogasa_brut: document.getElementById('prev-emp-fogasa-brut'),
    totEmpBrut: document.getElementById('prev-emp-tot-brut'),
    totEmpPagar: document.getElementById('prev-emp-tot-pagar') || document.getElementById('prev-tot-emp'),

    // Seguretat Social - Cuota Treballador
    trabCC: document.getElementById('prev-trab-cc'),
    trabDes: document.getElementById('prev-trab-des'),
    trabMEI: document.getElementById('prev-trab-mei'),
    trabTotal: document.getElementById('prev-trab-tot'),

    // Resum Cost Total Àvia
    resumLiquid: document.getElementById('prev-resum-liquid'),
    resumRebutSS: document.getElementById('prev-resum-rebut-ss'),
    costTotalAvia: document.getElementById('prev-cost-total-avia')
};

function round2(val) {
    return Math.round((val + Number.EPSILON) * 100) / 100;
}

function calcularTotals() {
    const formData = new FormData(form);
    const salarioBase = parseFloat(formData.get('salario_base')) || 0;
    const complementos = parseFloat(formData.get('complementos')) || 0;
    const extraJunio = parseFloat(formData.get('paga_extra_junio')) || 0;
    const extraDic = parseFloat(formData.get('paga_extra_dic')) || 0;

    const totalDevengado = round2(salarioBase + complementos + extraJunio + extraDic);

    // Base de cotització (des del formulari o mínim 970.00 €)
    const baseInput = parseFloat(formData.get('base_ss'));
    const baseSS = (!isNaN(baseInput) && baseInput > 0)
        ? baseInput
        : (totalDevengado <= 970 ? 970.00 : totalDevengado);

    // --- Deduccions treballadora ---
    const dedCC = round2(baseSS * 0.047);   // 4,7% = 45,59 €
    const dedDes = round2(baseSS * 0.0155); // 1,55% = 15,04 €
    const dedMEI = round2(baseSS * 0.0015); // 0,15% = 1,46 €
    const totalDeducir = round2(dedCC + dedDes + dedMEI); // 62,09 €
    const liquido = round2(totalDevengado - totalDeducir);

    // --- Quota Empleador/a sense bonificacions ---
    const empCC_brut = round2(baseSS * 0.236);    // 23,60% = 228,92 €
    const empProf = round2(baseSS * 0.015);       // 1,50% = 14,55 €
    const empDes_brut = round2(baseSS * 0.055);   // 5,50% = 53,35 €
    const empMEI = round2(baseSS * 0.0075);       // 0,75% = 7,28 €
    const empFogasa_brut = round2(baseSS * 0.002); // 0,20% = 1,94 €
    const empTotalBrut = round2(empCC_brut + empProf + empDes_brut + empMEI + empFogasa_brut); // 306,04 €

    // --- Bonificacions / Descomptes Empleador/a ---
    const bonCC = round2(empCC_brut * 0.20);         // 20% descompte en CC = 45,78 €
    const bonDes = round2(empDes_brut * 0.80);       // 80% descompte desocupació = 42,68 €
    const bonFogasa = round2(empFogasa_brut * 0.80); // 80% descompte FOGASA = 1,55 €
    const totalDescuento = round2(bonCC + bonDes + bonFogasa); // 90,01 €

    // --- Quota Empleador/a a pagar (bonificada) ---
    const empCC_pagar = round2(empCC_brut - bonCC);         // 183,14 €
    const empProf_pagar = empProf;                           // 14,55 €
    const empDes_pagar = round2(empDes_brut - bonDes);       // 10,67 €
    const empMEI_pagar = empMEI;                             // 7,28 €
    const empFogasa_pagar = round2(empFogasa_brut - bonFogasa); // 0,39 €
    const totalEmpresari = round2(empCC_pagar + empProf_pagar + empDes_pagar + empMEI_pagar + empFogasa_pagar); // 216,03 €

    // --- Totals Seguretat Social (Àvia) ---
    // Quota completa sense descompte = 306,04 € + 62,09 € = 368,13 €
    const cuotaCompletaSinDescuento = round2(empTotalBrut + totalDeducir);
    // Total rebut a pagar mensualment per l'àvia al banc = 216,03 € + 62,09 € = 278,12 €
    const totalPagarSegSocialAvia = round2(totalEmpresari + totalDeducir);
    // Cost total mensual per a l'àvia = Salari líquid + Rebut Seguretat Social
    const costTotalRealAvia = round2(liquido + totalPagarSegSocialAvia);

    return {
        salarioBase, complementos, extraJunio, extraDic, totalDevengado,
        baseSS,
        dedCC, dedDes, dedMEI, totalDeducir, liquido,
        empCC_brut, empProf, empDes_brut, empMEI, empFogasa_brut, empTotalBrut,
        bonCC, bonDes, bonFogasa, totalDescuento,
        empCC_pagar, empProf_pagar, empDes_pagar, empMEI_pagar, empFogasa_pagar, totalEmpresari,
        cuotaCompletaSinDescuento,
        totalPagarSegSocialAvia,
        costTotalRealAvia
    };
}

function updatePreview() {
    const formData = new FormData(form);
    const res = calcularTotals();

    // Dades generals
    if (preview.periodo) preview.periodo.innerText = formData.get('periodo') || '-';
    if (preview.dies) preview.dies.innerText = formData.get('dies_hores') || '-';
    if (preview.empNom) preview.empNom.innerText = formData.get('emp_nom') || '-';
    if (preview.empCif) preview.empCif.innerText = formData.get('emp_cif') || '-';
    if (preview.empDom) preview.empDom.innerText = formData.get('emp_adreca') || '-';
    if (preview.empPob) preview.empPob.innerText = formData.get('emp_poblacion') || '-';
    if (preview.empCcc) preview.empCcc.innerText = formData.get('emp_ccc') || '-';

    if (preview.trabNom) preview.trabNom.innerText = formData.get('trab_nom') || '-';
    if (preview.trabNif) preview.trabNif.innerText = formData.get('trab_nif') || '-';
    if (preview.trabSs) preview.trabSs.innerText = formData.get('trab_ss') || '-';
    if (preview.trabCat) preview.trabCat.innerText = formData.get('trab_cat') || '-';
    if (preview.trabAnt) preview.trabAnt.innerText = formData.get('trab_antiguedad') || '-';

    // Devengos detallats
    if (preview.salBase) preview.salBase.innerText = `${res.salarioBase.toFixed(2)} €`;
    if (preview.complementos) preview.complementos.innerText = `${res.complementos.toFixed(2)} €`;
    if (preview.extraJun) preview.extraJun.innerText = `${res.extraJunio.toFixed(2)} €`;
    if (preview.extraDic) preview.extraDic.innerText = `${res.extraDic.toFixed(2)} €`;
    if (preview.totDev) preview.totDev.innerText = `${res.totalDevengado.toFixed(2)} €`;

    // Deduccions detallades treballadora
    if (preview.dedCC) preview.dedCC.innerText = `-${res.dedCC.toFixed(2)} €`;
    if (preview.dedMEI) preview.dedMEI.innerText = `-${res.dedMEI.toFixed(2)} €`;
    if (preview.dedDes) preview.dedDes.innerText = `-${res.dedDes.toFixed(2)} €`;
    if (preview.totDed) preview.totDed.innerText = `-${res.totalDeducir.toFixed(2)} €`;
    if (preview.liquid) preview.liquid.innerText = `${res.liquido.toFixed(2)} €`;

    // Seguretat Social - Totals Càrrec Àvia
    if (preview.ssTotalPagarAvia) preview.ssTotalPagarAvia.innerText = `${res.totalPagarSegSocialAvia.toFixed(2)} €/mes`;
    if (preview.ssCuotaCompleta) preview.ssCuotaCompleta.innerText = `${res.cuotaCompletaSinDescuento.toFixed(2)} €/mes (sense descompte)`;
    if (preview.ssDescuentoTotal) preview.ssDescuentoTotal.innerText = `-${res.totalDescuento.toFixed(2)} €/mes d'estalvi`;
    if (preview.ssBase) preview.ssBase.innerText = `${res.baseSS.toFixed(2)} €/mes`;

    // Seguretat Social - Cuota Empleador (Àvia)
    if (preview.empCC_pagar) preview.empCC_pagar.innerText = `${res.empCC_pagar.toFixed(2)} €`;
    if (preview.empCC_brut) preview.empCC_brut.innerText = `${res.empCC_brut.toFixed(2)} €`;
    if (preview.empProf) preview.empProf.innerText = `${res.empProf_pagar.toFixed(2)} €`;
    if (preview.empDes_pagar) preview.empDes_pagar.innerText = `${res.empDes_pagar.toFixed(2)} €`;
    if (preview.empDes_brut) preview.empDes_brut.innerText = `${res.empDes_brut.toFixed(2)} €`;
    if (preview.empMEI) preview.empMEI.innerText = `${res.empMEI_pagar.toFixed(2)} €`;
    if (preview.empFogasa_pagar) preview.empFogasa_pagar.innerText = `${res.empFogasa_pagar.toFixed(2)} €`;
    if (preview.empFogasa_brut) preview.empFogasa_brut.innerText = `${res.empFogasa_brut.toFixed(2)} €`;
    if (preview.totEmpBrut) preview.totEmpBrut.innerText = `${res.empTotalBrut.toFixed(2)} €`;
    if (preview.totEmpPagar) preview.totEmpPagar.innerText = `${res.totalEmpresari.toFixed(2)} €`;

    // Seguretat Social - Cuota Treballador
    if (preview.trabCC) preview.trabCC.innerText = `${res.dedCC.toFixed(2)} €`;
    if (preview.trabDes) preview.trabDes.innerText = `${res.dedDes.toFixed(2)} €`;
    if (preview.trabMEI) preview.trabMEI.innerText = `${res.dedMEI.toFixed(2)} €`;
    if (preview.trabTotal) preview.trabTotal.innerText = `${res.totalDeducir.toFixed(2)} €`;

    // Resum Cost Total Àvia
    if (preview.resumLiquid) preview.resumLiquid.innerText = `${res.liquido.toFixed(2)} €`;
    if (preview.resumRebutSS) preview.resumRebutSS.innerText = `${res.totalPagarSegSocialAvia.toFixed(2)} €`;
    if (preview.costTotalAvia) preview.costTotalAvia.innerText = `${res.costTotalRealAvia.toFixed(2)} €/mes`;
}

// Carregar dades inicials des del fitxer .env (a través de Vite import.meta.env)
function carregarDadesEnv() {
    const envVars = {
        emp_nom: import.meta.env.VITE_EMP_NOM,
        emp_cif: import.meta.env.VITE_EMP_CIF,
        emp_adreca: import.meta.env.VITE_EMP_ADRECA,
        emp_poblacion: import.meta.env.VITE_EMP_POBLACION,
        emp_ccc: import.meta.env.VITE_EMP_CCC,

        trab_nom: import.meta.env.VITE_TRAB_NOM,
        trab_nif: import.meta.env.VITE_TRAB_NIF,
        trab_ss: import.meta.env.VITE_TRAB_SS,
        trab_cat: import.meta.env.VITE_TRAB_CAT,
        trab_antiguedad: import.meta.env.VITE_TRAB_ANTIGUEDAD,

        periodo: import.meta.env.VITE_PERIODO,
        dies_hores: import.meta.env.VITE_DIES_HORES,
        salario_base: import.meta.env.VITE_SALARIO_BASE,
        complementos: import.meta.env.VITE_COMPLEMENTOS,
        paga_extra_junio: import.meta.env.VITE_EXTRA_JUNIO,
        paga_extra_dic: import.meta.env.VITE_EXTRA_DIC,

        base_ss: import.meta.env.VITE_BASE_SS
    };

    Object.entries(envVars).forEach(([id, val]) => {
        if (val !== undefined && val !== '') {
            const input = document.getElementById(id);
            if (input) {
                input.value = val;
            }
        }
    });
}

if (form) {
    carregarDadesEnv();

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    updatePreview();

    // Generació del PDF
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const res = calcularTotals();

        const dades = {
            periodo: formData.get('periodo') || '',
            dies_hores: formData.get('dies_hores') || '',
            emp_nom: formData.get('emp_nom') || '',
            emp_cif: formData.get('emp_cif') || '',
            emp_dom: formData.get('emp_adreca') || '',
            emp_pob: formData.get('emp_poblacion') || '',
            emp_ccc: formData.get('emp_ccc') || '',
            trab_nom: formData.get('trab_nom') || '',
            trab_nif: formData.get('trab_nif') || '',
            trab_ss: formData.get('trab_ss') || '',
            trab_cat: formData.get('trab_cat') || '',
            trab_ant: formData.get('trab_antiguedad') || ''
        };

        const doc = new jsPDF();
        const margin = 12;
        let y = 15;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("RECIBO DE SALARIOS — EMPLEADOS DE HOGAR", margin, y);

        y += 6;
        doc.setFontSize(7);
        doc.setDrawColor(120);
        doc.rect(margin, y, 92, 28);
        doc.rect(margin + 96, y, 92, 28);

        // Quadre Empleador
        doc.text("EMPLEADOR/A", margin + 3, y + 4);
        doc.setFont("helvetica", "normal");
        doc.text(`Nom: ${dades.emp_nom}`, margin + 3, y + 9);
        doc.text(`NIF: ${dades.emp_cif}`, margin + 3, y + 13);
        doc.text(`Domicilio: ${dades.emp_dom}`, margin + 3, y + 17, { maxWidth: 88 });
        doc.text(`Población: ${dades.emp_pob} | CCC: ${dades.emp_ccc}`, margin + 3, y + 23);

        // Quadre Treballador
        doc.setFont("helvetica", "bold");
        doc.text("TRABAJADOR/A", margin + 99, y + 4);
        doc.setFont("helvetica", "normal");
        doc.text(`Nom: ${dades.trab_nom}`, margin + 99, y + 9);
        doc.text(`NIF: ${dades.trab_nif}`, margin + 99, y + 13);
        doc.text(`N.º S. Social: ${dades.trab_ss}`, margin + 99, y + 17);
        doc.text(`Categoría: ${dades.trab_cat} | Antigüedad: ${dades.trab_ant}`, margin + 99, y + 23, { maxWidth: 88 });

        y += 33;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`Periodo de liquidación: ${dades.periodo} · ${dades.dies_hores}`, margin, y);

        y += 6;
        doc.text("I. Devengos", margin, y);
        doc.text("Euros", 195, y, { align: "right" });
        y += 2;
        doc.line(margin, y, 195, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        const devList = [
            ["Salario base", res.salarioBase],
            ["Complementos salariales", res.complementos],
            ["Paga extra de junio (prorrata)", res.extraJunio],
            ["Paga extra de diciembre (prorrata)", res.extraDic]
        ];

        devList.forEach(([nom, val]) => {
            if (val > 0) {
                doc.text(nom, margin, y);
                doc.text(`${val.toFixed(2)} €`, 195, y, { align: "right" });
                y += 5;
            }
        });

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.text("A. Total devengado", margin, y);
        doc.text(`${res.totalDevengado.toFixed(2)} €`, 195, y, { align: "right" });

        y += 8;
        doc.text("II. Deducciones: aportación de la trabajadora a la Seguridad Social", margin, y);
        y += 4;
        doc.setFontSize(7);
        doc.text("Concepto", margin, y);
        doc.text("Base", 115, y, { align: "right" });
        doc.text("Tipo", 145, y, { align: "right" });
        doc.text("Importe", 195, y, { align: "right" });
        y += 2;
        doc.line(margin, y, 195, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        const dedList = [
            ["Contingencias comunes", res.dedCC, "4,7 %"],
            ["Mecanismo de Equidad Intergeneracional (MEI)", res.dedMEI, "0,15 %"],
            ["Desempleo", res.dedDes, "1,55 %"]
        ];

        dedList.forEach(([con, imp, tip]) => {
            doc.text(con, margin, y);
            doc.text(`${res.baseSS.toFixed(2)} €`, 115, y, { align: "right" });
            doc.text(tip, 145, y, { align: "right" });
            doc.text(`-${imp.toFixed(2)} €`, 195, y, { align: "right" });
            y += 5;
        });

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.text("B. Total a deducir", margin, y);
        doc.text(`-${res.totalDeducir.toFixed(2)} €`, 195, y, { align: "right" });

        y += 8;
        doc.setFontSize(9);
        doc.setTextColor(37, 99, 235);
        doc.text("Líquido total a percibir (A - B):", margin, y);
        doc.text(`${res.liquido.toFixed(2)} €`, 195, y, { align: "right" });

        y += 10;
        doc.setTextColor(0);
        doc.setFontSize(7.5);
        doc.text("Determinación de la base de cotización (disposición transitoria 16.ª LGSS)", margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.text("Remuneración mensual, con la parte de las pagas extra", margin, y);
        doc.text(`${res.totalDevengado.toFixed(2)} €`, 195, y, { align: "right" });
        y += 5;
        doc.text("Tramo de cotización", margin, y);
        doc.text(`${res.baseSS.toFixed(2)} €`, 195, y, { align: "right" });

        y += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Aportación del empleador/a a la Seguridad Social", margin, y);
        y += 4;
        doc.setFontSize(7);
        doc.text("Concepto", margin, y);
        doc.text("Tipo", 115, y, { align: "right" });
        doc.text("Bonificación", 155, y, { align: "right" });
        doc.text("A pagar", 195, y, { align: "right" });
        y += 2;
        doc.line(margin, y, 195, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        const empList = [
            ["Contingencias comunes", "18,88 %*", "20 %", res.empCC_pagar],
            ["MEI", "0,75 %", "—", res.empMEI_pagar],
            ["Contingencias profesionales", "1,50 %", "—", res.empProf_pagar],
            ["Desempleo", "1,10 %**", "80 %", res.empDes_pagar],
            ["FOGASA", "0,04 %**", "80 %", res.empFogasa_pagar]
        ];

        empList.forEach(([con, tip, bon, pag]) => {
            doc.text(con, margin, y);
            doc.text(tip, 115, y, { align: "right" });
            doc.text(bon, 155, y, { align: "right" });
            doc.text(`${pag.toFixed(2)} €`, 195, y, { align: "right" });
            y += 5;
        });

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.text("Total a cargo del empleador/a", margin, y);
        doc.text(`${res.totalEmpresari.toFixed(2)} €`, 195, y, { align: "right" });

        // Caixa destacada: Liquidació mensual Seguretat Social (Càrrec al banc)
        y += 6;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, 183, 20, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(30, 58, 138);
        doc.text("LIQUIDACIÓN SEGURIDAD SOCIAL — CARGO EN CUENTA BANCARIA DE LA EMPLEADORA", margin + 3, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        doc.text(`Cuota empleador/a (bonificada): ${res.totalEmpresari.toFixed(2)} €  +  Cuota trabajadora (retenida): ${res.totalDeducir.toFixed(2)} €`, margin + 3, y + 10);
        doc.text(`Cuota íntegra sin descuento: ${res.cuotaCompletaSinDescuento.toFixed(2)} €  ·  Ahorro bonificaciones: -${res.totalDescuento.toFixed(2)} €  ·  Base: ${res.baseSS.toFixed(2)} €`, margin + 3, y + 14);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(22, 101, 52);
        doc.text(`TOTAL A PAGAR: ${res.totalPagarSegSocialAvia.toFixed(2)} €/mes`, margin + 180, y + 11, { align: "right" });

        y += 26;
        doc.setFontSize(7.5);
        doc.setTextColor(100);
        doc.text("Firma del empleador/a", margin, y);
        doc.text("Fecha: ____/____/2026", margin + 80, y);
        doc.text("Recibí (Trabajador/a)", margin + 140, y);

        doc.save(`nomina_${dades.periodo.replace(/\s+/g, '_')}.pdf`);
    });
}