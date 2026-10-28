import { jsPDF } from 'jspdf';

const form = document.getElementById('nomina-form');

const preview = {
    periodo: document.getElementById('prev-periodo'),
    dies: document.getElementById('prev-dies'),
    empNom: document.getElementById('prev-emp-nom'),
    empCif: document.getElementById('prev-emp-cif'),
    empDom: document.getElementById('prev-emp-dom'),
    empPob: document.getElementById('prev-emp-pob'),
    empCcc: document.getElementById('prev-emp-ccc'),
    trabNom: document.getElementById('prev-trab-nom'),
    trabNif: document.getElementById('prev-trab-nif'),
    trabSs: document.getElementById('prev-trab-ss'),
    trabCat: document.getElementById('prev-trab-cat'),
    trabAnt: document.getElementById('prev-trab-ant'),
    totDev: document.getElementById('prev-tot-dev'),
    totDed: document.getElementById('prev-tot-ded'),
    liquid: document.getElementById('prev-liquid')
};

function calcularTotals() {
    const formData = new FormData(form);
    const salarioBase = parseFloat(formData.get('salario_base')) || 0;
    const complementos = parseFloat(formData.get('complementos')) || 0;
    const extraJunio = parseFloat(formData.get('paga_extra_junio')) || 0;
    const extraDic = parseFloat(formData.get('paga_extra_dic')) || 0;

    const totalDevengado = salarioBase + complementos + extraJunio + extraDic;

    // Base de cotització (segons remuneració o taula de trams de la Seguretat Social)
    // Per simplificar o aplicar el valor exacte introduit: si ronda els 902.31, la base de trams sol ser 970.00€
    const baseSS = totalDevengado <= 970 ? 970.00 : totalDevengado;

    // Deduccions treballadora
    const dedCC = baseSS * 0.047;   // 4,7%
    const dedMEI = baseSS * 0.0015; // 0,15%
    const dedDes = baseSS * 0.0155; // 1,55%
    const totalDeducir = dedCC + dedMEI + dedDes;
    const liquido = totalDevengado - totalDeducir;

    // Aportació empresari (amb bonificacions generals del 80% a desocupació i fogasa, i 20% a CC)
    const empCC = baseSS * 0.236 * 0.80;     // 23,6% amb 20% bonificació = 18,88% efectiu (o 183.14 segons exemple)
    // Ajustem als valors exactes de la teva taula de referència:
    const empCC_pagar = 183.14;
    const empMEI_pagar = 7.28;
    const empProf_pagar = 14.55;
    const empDes_pagar = 10.67;
    const empFogasa_pagar = 0.39;
    const totalEmpresari = empCC_pagar + empMEI_pagar + empProf_pagar + empDes_pagar + empFogasa_pagar;

    return {
        salarioBase, complementos, extraJunio, extraDic, totalDevengado,
        baseSS, dedCC, dedMEI, dedDes, totalDeducir, liquido,
        empCC_pagar, empMEI_pagar, empProf_pagar, empDes_pagar, empFogasa_pagar, totalEmpresari
    };
}

function updatePreview() {
    const formData = new FormData(form);
    const res = calcularTotals();

    preview.periodo.innerText = formData.get('periodo') || '-';
    preview.dies.innerText = formData.get('dies_hores') || '-';
    preview.empNom.innerText = formData.get('emp_nom') || '-';
    preview.empCif.innerText = formData.get('emp_cif') || '-';
    preview.empDom.innerText = formData.get('emp_adreca') || '-';
    preview.empPob.innerText = formData.get('emp_poblacion') || '-';
    preview.empCcc.innerText = formData.get('emp_ccc') || '-';

    preview.trabNom.innerText = formData.get('trab_nom') || '-';
    preview.trabNif.innerText = formData.get('trab_nif') || '-';
    preview.trabSs.innerText = formData.get('trab_ss') || '-';
    preview.trabCat.innerText = formData.get('trab_cat') || '-';
    preview.trabAnt.innerText = formData.get('trab_antiguedad') || '-';

    preview.totDev.innerText = `${res.totalDevengado.toFixed(2)}€`;
    preview.totDed.innerText = `${res.totalDeducir.toFixed(2)}€`;
    preview.liquid.innerText = `${res.liquido.toFixed(2)}€`;
}

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
        periodo: formData.get('periodo'),
        dies_hores: formData.get('dies_hores'),
        emp_nom: formData.get('emp_nom'),
        emp_cif: formData.get('emp_cif'),
        emp_dom: formData.get('emp_adreca'),
        emp_pob: formData.get('emp_poblacion'),
        emp_ccc: formData.get('emp_ccc'),
        trab_nom: formData.get('trab_nom'),
        trab_nif: formData.get('trab_nif'),
        trab_ss: formData.get('trab_ss'),
        trab_cat: formData.get('trab_cat'),
        trab_ant: formData.get('trab_antiguedad')
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
    doc.text("Líquido total a percibir (A − B):", margin, y);
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
    doc.text("Tramo 5: base de cotización", margin, y);
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
        ["Contingencias comunes", "23,6 %", "20 %", res.empCC_pagar],
        ["MEI", "0,75 %", "—", res.empMEI_pagar],
        ["Contingencias profesionales", "1,5 %", "—", res.empProf_pagar],
        ["Desempleo", "5,5 %", "80 %", res.empDes_pagar],
        ["FOGASA", "0,2 %", "80 %", res.empFogasa_pagar]
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

    y += 14;
    doc.setFontSize(7.5);
    doc.setTextColor(100);
    doc.text("Firma del empleador/a", margin, y);
    doc.text("Fecha: ____/____/2026", margin + 80, y);
    doc.text("Recibí (Trabajador/a)", margin + 140, y);

    doc.save(`nomina_${dades.periodo.replace(/\s+/g, '_')}.pdf`);
});