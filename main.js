import html2pdf from 'html2pdf.js';

const form = document.getElementById('invoice-form');
const inputs = form.querySelectorAll('input, textarea');

// Elements del preview
const prevElements = {
    num: document.getElementById('prev-num'),
    data: document.getElementById('prev-data'),
    emissorNom: document.getElementById('prev-emissor-nom'),
    emissorNif: document.getElementById('prev-emissor-nif'),
    emissorAdreca: document.getElementById('prev-emissor-adreca'),
    clientNom: document.getElementById('prev-client-nom'),
    clientNif: document.getElementById('prev-client-nif'),
    clientAdreca: document.getElementById('prev-client-adreca'),
    concepte: document.getElementById('prev-concepte'),
    quantitat: document.getElementById('prev-quantitat'),
    preu: document.getElementById('prev-preu'),
    base: document.getElementById('prev-base'),
    preuEtiqueta: document.getElementById('prev-preu-etiqueta')
};

const totalElements = {
    base: document.getElementById('tot-base'),
    ivaP: document.getElementById('tot-iva-p'),
    iva: document.getElementById('tot-iva'),
    irpfP: document.getElementById('tot-irpf-p'),
    irpf: document.getElementById('tot-irpf'),
    final: document.getElementById('tot-final')
};

// Dades per defecte (mates al Python original)
const defaultData = {
    num_factura: '2026-001',
    data: new Date().toISOString().split('T')[0],
    emissor_nom: 'El Teu Nom o Empresa S.L.',
    emissor_nif: '12345678Z',
    emissor_adreca: 'Carrer de l\'Exemple 123, Barcelona',
    client_nom: 'Client Interessant S.A.',
    client_nif: 'A87654321',
    client_adreca: 'Avinguda de la IA 45, Madrid',
    concepte: 'Serveis de Consultoria Digital',
    quantitat: 1,
    preu_unitari: 1200,
    preu_etiqueta: 'Preu Unitari',
    iva_percentatge: 21,
    irpf_percentatge: 15
};

function updatePreview() {
    const dades = Object.fromEntries(new FormData(form));

    // Validar numèrics
    const quantitat = parseFloat(dades.quantitat) || 0;
    const preuUnitari = parseFloat(dades.preu_unitari) || 0;
    const ivaP = parseInt(dades.iva_percentatge) || 0;
    const irpfP = parseInt(dades.irpf_percentatge) || 0;

    // Càlculs
    const base = quantitat * preuUnitari;
    const ivaImport = base * (ivaP / 100);
    const irpfImport = base * (irpfP / 100);
    const total = base + ivaImport - irpfImport;

    // Actualitzar textos
    document.getElementById('iva-val').innerText = `${ivaP}%`;
    document.getElementById('irpf-val').innerText = `${irpfP}%`;
    document.querySelector('label[for="preu_unitari"]').innerText = `${dades.preu_etiqueta} (€)`;

    // Actualitzar preview
    prevElements.num.innerText = dades.num_factura;
    prevElements.data.innerText = dades.data;
    prevElements.emissorNom.innerText = dades.emissor_nom;
    prevElements.emissorNif.innerText = dades.emissor_nif ? `NIF: ${dades.emissor_nif}` : '';
    prevElements.emissorAdreca.innerText = dades.emissor_adreca;
    prevElements.clientNom.innerText = dades.client_nom;
    prevElements.clientNif.innerText = dades.client_nif ? `NIF: ${dades.client_nif}` : '';
    prevElements.clientAdreca.innerText = dades.client_adreca;
    prevElements.concepte.innerText = dades.concepte;
    prevElements.quantitat.innerText = quantitat;
    prevElements.preu.innerText = `${preuUnitari.toFixed(2)}€`;
    prevElements.base.innerText = `${base.toFixed(2)}€`;
    prevElements.preuEtiqueta.innerText = dades.preu_etiqueta;

    // Totals
    totalElements.base.innerText = `${base.toFixed(2)}€`;
    totalElements.ivaP.innerText = ivaP;
    totalElements.iva.innerText = `+${ivaImport.toFixed(2)}€`;
    totalElements.irpfP.innerText = irpfP;
    totalElements.irpf.innerText = `-${irpfImport.toFixed(2)}€`;
    totalElements.final.innerText = `${total.toFixed(2)}€`;
}

// Inicialitzar camps amb dades per defecte
Object.keys(defaultData).forEach(key => {
    const input = form.elements[key];
    if (input) input.value = defaultData[key];
});

// Listeners
inputs.forEach(input => {
    input.addEventListener('input', updatePreview);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dades = Object.fromEntries(new FormData(form));
    const element = document.getElementById('invoice-render');

    const opt = {
        margin: 10,
        filename: `factura_${dades.num_factura}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
});

// Run initial preview
updatePreview();
