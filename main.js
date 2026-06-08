import { jsPDF } from 'jspdf';

const form = document.getElementById('invoice-form');
const itemsContainer = document.getElementById('items-container');
const addItemBtn = document.getElementById('add-item');
const previewItemsBody = document.getElementById('preview-items');

// Elements del preview fixos
const prevFixed = {
    num: document.getElementById('prev-num'),
    data: document.getElementById('prev-data'),
    emissorNom: document.getElementById('prev-emissor-nom'),
    emissorNif: document.getElementById('prev-emissor-nif'),
    emissorAdreca: document.getElementById('prev-emissor-adreca'),
    clientNom: document.getElementById('prev-client-nom'),
    clientNif: document.getElementById('prev-client-nif'),
    clientAdreca: document.getElementById('prev-client-adreca')
};

const totalElements = {
    base: document.getElementById('tot-base'),
    ivaP: document.getElementById('tot-iva-p'),
    iva: document.getElementById('tot-iva'),
    irpfP: document.getElementById('tot-irpf-p'),
    irpf: document.getElementById('tot-irpf'),
    final: document.getElementById('tot-final')
};

// Dades per defecte
const defaultData = {
    num_factura: '2026-001',
    data: new Date().toISOString().split('T')[0],
    emissor_nom: 'El Teu Nom o Empresa S.L.',
    emissor_nif: '12345678Z',
    emissor_adreca: 'Carrer de l\'Exemple 123, Barcelona',
    client_nom: 'Client Interessant S.A.',
    client_nif: 'A87654321',
    client_adreca: 'Avinguda de la IA 45, Madrid',
    conceptes: ['Serveis de Consultoria Digital'],
    quantitats: [1],
    preus: [1200],
    etiquetes: ['Preu Unitari'],
    iva_percentatge: 21,
    irpf_percentatge: 15
};

function createItemRow() {
    const div = document.createElement('div');
    div.className = 'invoice-item card-sub';
    div.innerHTML = `
        <div class="input-group">
            <label>Descripció del servei</label>
            <textarea name="concepte[]" rows="2" placeholder="Serveis de consultoria..." required></textarea>
        </div>
        <div class="grid-3">
            <div class="input-group">
                <label>Quantitat</label>
                <input type="number" name="quantitat[]" value="1" step="any" required>
            </div>
            <div class="input-group">
                <label>Unitat</label>
                <input type="text" name="preu_etiqueta[]" placeholder="Ex: Preu/hora">
            </div>
            <div class="input-group">
                <label>Preu Unitari (€)</label>
                <input type="number" name="preu_unitari[]" value="0.00" min="0" step="0.01" required>
            </div>
        </div>
        <button type="button" class="btn-remove" title="Eliminar Concepte">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    // Listeners for the new inputs
    div.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Remove button logic
    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
        updatePreview();
    });

    return div;
}

addItemBtn.addEventListener('click', () => {
    itemsContainer.appendChild(createItemRow());
    updatePreview();
});

function updatePreview() {
    const formData = new FormData(form);

    // Camps individuals
    const num_factura = formData.get('num_factura');
    const data = formData.get('data');
    const emissor_nom = formData.get('emissor_nom');
    const emissor_nif = formData.get('emissor_nif');
    const emissor_adreca = formData.get('emissor_adreca');
    const client_nom = formData.get('client_nom');
    const client_nif = formData.get('client_nif');
    const client_adreca = formData.get('client_adreca');
    const ivaP = parseInt(formData.get('iva_percentatge')) || 0;
    const irpfP = parseInt(formData.get('irpf_percentatge')) || 0;

    // Camps de conceptes (arrays)
    const conceptes = formData.getAll('concepte[]');
    const quantitats = formData.getAll('quantitat[]');
    const etiquetes = formData.getAll('preu_etiqueta[]');
    const preus = formData.getAll('preu_unitari[]');

    document.getElementById('iva-val').innerText = `${ivaP}%`;
    document.getElementById('irpf-val').innerText = `${irpfP}%`;

    // Update fixed preview fields
    prevFixed.num.innerText = num_factura;
    prevFixed.data.innerText = data;
    prevFixed.emissorNom.innerText = emissor_nom;
    prevFixed.emissorNif.innerText = emissor_nif ? `NIF: ${emissor_nif}` : '';
    prevFixed.emissorAdreca.innerText = emissor_adreca;
    prevFixed.clientNom.innerText = client_nom;
    prevFixed.clientNif.innerText = client_nif ? `NIF: ${client_nif}` : '';
    prevFixed.clientAdreca.innerText = client_adreca;

    // Update items preview
    previewItemsBody.innerHTML = '';
    let totalBase = 0;

    conceptes.forEach((concepte, index) => {
        const q = parseFloat(quantitats[index]) || 0;
        const p = parseFloat(preus[index]) || 0;
        const base = q * p;
        totalBase += base;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${concepte}</td>
            <td>${q}</td>
            <td>${p.toFixed(2)}€ <small>(${etiquetes[index] || 'u.'})</small></td>
            <td style="text-align: right">${base.toFixed(2)}€</td>
        `;
        previewItemsBody.appendChild(row);
    });

    const ivaImport = totalBase * (ivaP / 100);
    const irpfImport = totalBase * (irpfP / 100);
    const totalFinal = totalBase + ivaImport - irpfImport;

    // Totals
    totalElements.base.innerText = `${totalBase.toFixed(2)}€`;
    totalElements.ivaP.innerText = ivaP;
    totalElements.iva.innerText = `+${ivaImport.toFixed(2)}€`;
    totalElements.irpfP.innerText = irpfP;
    totalElements.irpf.innerText = `-${irpfImport.toFixed(2)}€`;
    totalElements.final.innerText = `${totalFinal.toFixed(2)}€`;
}

// Inicialitzar
function init() {
    // Fill fixed fields
    Object.keys(defaultData).forEach(key => {
        const input = form.elements[key];
        if (input && !Array.isArray(defaultData[key])) {
            input.value = defaultData[key];
        }
    });

    // Fill initial items
    itemsContainer.innerHTML = '';
    defaultData.conceptes.forEach((_, i) => {
        const row = createItemRow();
        row.querySelector('[name="concepte[]"]').value = defaultData.conceptes[i];
        row.querySelector('[name="quantitat[]"]').value = defaultData.quantitats[i];
        row.querySelector('[name="preu_etiqueta[]"]').value = defaultData.etiquetes[i];
        row.querySelector('[name="preu_unitari[]"]').value = defaultData.preus[i];
        itemsContainer.appendChild(row);
    });

    // Global listeners for fixed inputs
    form.querySelectorAll('input:not([name*="[]"]), textarea:not([name*="[]"]), select').forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    updatePreview();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const dades = {
        num: formData.get('num_factura'),
        data: formData.get('data'),
        emissor_nom: formData.get('emissor_nom'),
        emissor_nif: formData.get('emissor_nif'),
        emissor_adreca: formData.get('emissor_adreca'),
        client_nom: formData.get('client_nom'),
        client_nif: formData.get('client_nif'),
        client_adreca: formData.get('client_adreca'),
        ivaP: parseInt(formData.get('iva_percentatge')) || 0,
        irpfP: parseInt(formData.get('irpf_percentatge')) || 0,
        conceptes: formData.getAll('concepte[]'),
        quantitats: formData.getAll('quantitat[]'),
        etiquetes: formData.getAll('preu_etiqueta[]'),
        preus: formData.getAll('preu_unitari[]')
    };

    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    // Capçalera
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FACTURA", margin, y);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Nº: ${dades.num}`, 190, y - 4, { align: "right" });
    doc.text(`Data: ${dades.data}`, 190, y + 2, { align: "right" });

    y += 14;
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 10;

    // Blocs d'adreces
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150);
    doc.text("EMISSOR", margin, y);
    doc.text("CLIENT", 110, y);

    y += 5;
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text(dades.emissor_nom, margin, y);
    doc.text(dades.client_nom, 110, y);

    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(dades.emissor_nif ? `NIF: ${dades.emissor_nif}` : "", margin, y);
    doc.text(dades.client_nif ? `NIF: ${dades.client_nif}` : "", 110, y);

    y += 4;
    doc.setFontSize(7.5);
    doc.setTextColor(80);
    doc.text(dades.emissor_adreca || "", margin, y, { maxWidth: 80 });
    doc.text(dades.client_adreca || "", 110, y, { maxWidth: 80 });

    y += 16;

    // Taula Capçalera
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("DESCRIPCIÓ", margin, y);
    doc.text("QUANT.", 110, y, { align: "right" });
    doc.text("PREU UNIT.", 145, y, { align: "right" });
    doc.text("BASE", 190, y, { align: "right" });

    y += 3;
    doc.line(margin, y, 190, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(0);

    let totalBase = 0;

    dades.conceptes.forEach((concepte, i) => {
        const q = parseFloat(dades.quantitats[i]) || 0;
        const p = parseFloat(dades.preus[i]) || 0;
        const base = q * p;
        totalBase += base;

        const splitConcepte = doc.splitTextToSize(concepte, 80);

        // Check for page break (simplified)
        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.text(splitConcepte, margin, y);
        doc.text(q.toString(), 110, y, { align: "right" });
        doc.text(`${p.toFixed(2)}€`, 145, y, { align: "right" });
        doc.text(`${base.toFixed(2)}€`, 190, y, { align: "right" });

        y += (splitConcepte.length * 4) + 3;
    });

    y += 4;
    doc.setDrawColor(230);
    doc.line(margin, y, 190, y);
    y += 10;

    // Totals
    const ivaImport = totalBase * (dades.ivaP / 100);
    const irpfImport = totalBase * (dades.irpfP / 100);
    const totalFinal = totalBase + ivaImport - irpfImport;

    const totalX = 140;
    doc.setFontSize(9);
    doc.setTextColor(80);

    doc.text("Base Imposable:", totalX, y);
    doc.text(`${totalBase.toFixed(2)}€`, 190, y, { align: "right" });

    y += 7;
    doc.text(`IVA (${dades.ivaP}%):`, totalX, y);
    doc.text(`+${ivaImport.toFixed(2)}€`, 190, y, { align: "right" });

    y += 7;
    doc.text(`Retenció IRPF (${dades.irpfP}%):`, totalX, y);
    doc.text(`-${irpfImport.toFixed(2)}€`, 190, y, { align: "right" });

    y += 7;
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.line(totalX, y, 190, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text("TOTAL:", totalX, y);
    doc.text(`${totalFinal.toFixed(2)}€`, 190, y, { align: "right" });

    doc.save(`factura_${dades.num}.pdf`);
});

init();
