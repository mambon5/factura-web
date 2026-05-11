# Generador de Factures Web Premium 🚀

Aquesta és una eina moderna i professional per generar factures en format PDF directament des del navegador. Ha estat dissenyada per substituir el script original en Python (`crea_factura.py`) per una experiència més visual, interactiva i agradable.

## ✨ Característiques

- **Interfície Moderna**: Disseny net amb focus en la usabilitat.
- **Preview en Temps Real**: Mira com queda la factura mentre l'estàs omplint.
- **Càlculs Automàtics**: L'IVA (21%), la retenció d'IRPF (15%) i els totals es calculen a l'instant.
- **Personalització d'Etiquetes**: Permet canviar el nom del camp de preu (ex: "Preu/hora", "Tarifa", etc.) perquè s'ajusti als teus serveis.
- **Generació de PDF Local**: Utilitza `html2pdf.js` per generar el document directament al client, sense necessitat de servidor de backend per al processament.

## 🛠️ Tecnotologies utilitzades

- **Vite**: Per a un desenvolupament ràpid i un empaquetat eficient.
- **Vanilla JavaScript**: Lògica pura sense frameworks pesats.
- **Vanilla CSS**: Estils moderns amb variables i animacions.
- **html2pdf.js**: Llibreria per a la conversió d'HTML a PDF de gran qualitat.

## 🚀 Com començar

### Requisits
- Tenir instal·lat [Node.js](https://nodejs.org/) (inclou npm).

### Instal·lació
1. Entra a la carpeta del projecte:
   ```bash
   cd factura-web
   ```
2. Instal·la les dependències:
   ```bash
   npm install
   ```

### Execució en mode desenvolupament
Per llançar l'aplicació localment:
```bash
npm run dev
```
Un cop executat, l'eina estarà disponible a `http://localhost:5173`.

## 📂 Estructura del Projecte

- `index.html`: Estructura semàntica i formulari.
- `style.css`: Sistema de disseny "premium".
- `main.js`: Lògica de càlcul, interactivitat i generació del PDF.
- `package.json`: Configuració i dependències.

---
Creat amb ❤️ per gestionar la teva hisenda de forma més fàcil.
