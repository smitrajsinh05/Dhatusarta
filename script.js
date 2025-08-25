// === Mutra Pariksha Report Generator ===
// A comprehensive Ayurvedic urine examination system

class MutraParikshaApp {
    constructor() {
        this.assessmentSteps = [
            {
                title: "1. Patient Record",
                id: "patientInfo",
                fields: [
                    { id: "name", label: "Patient Name", type: "text", required: true },
                    { id: "age", label: "Age", type: "text", required: true },
                    { id: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true }
                ]
            },
            {
                title: "2. Collection & Quantity",
                id: "Collection",
                fields: [
                    { id: "collection_time", label: "Collection Time", type: "select", options: ["Morning", "Afternoon", "Night"], required: true },
                    { id: "fasting_state", label: "State", type: "select", options: ["Fasting", "Post-prandial", "Random"], required: true },
                    { id: "quantity", label: "Quantity", type: "select", options: ["Scanty", "Moderate", "Excessive"], required: true },
                    { id: "frequency", label: "Frequency", type: "select", options: ["Low", "Normal", "High"], required: true },
                    { id: "urgency", label: "Urgency", type: "select", options: ["None", "Mild", "Strong"], required: true },
                    { id: "dysuria", label: "Dysuria/Burning", type: "select", options: ["None", "Mild", "Severe"], required: true }
                ]
            },
            {
                title: "3. Varna (Color)",
                id: "Varna",
                fields: [
                    { id: "varna", label: "Color", type: "select", options: ["Clear", "Straw", "Yellow", "Dark Yellow", "Reddish", "Brownish"], required: true }
                ]
            },
            {
                title: "4. Gandha & Sensation",
                id: "Gandha",
                fields: [
                    { id: "gandha", label: "Odor", type: "select", options: ["Mild", "Strong", "Foul", "Sweetish"], required: true },
                    { id: "burning", label: "Burning Sensation", type: "select", options: ["None", "Mild", "Burning"], required: true }
                ]
            },
            {
                title: "5. Rupa (Appearance)",
                id: "Rupa",
                fields: [
                    { id: "phenila", label: "Froth/Phenila", type: "select", options: ["Absent", "Mild", "Persistent"], required: true },
                    { id: "avila", label: "Turbidity/Avila", type: "select", options: ["Clear", "Slightly turbid", "Turbid"], required: true },
                    { id: "sediment", label: "Sediment", type: "select", options: ["None", "Minimal", "Moderate", "Heavy"], required: true }
                ]
            },
            {
                title: "6. Picchila/Snigdhatva/Threads",
                id: "Picchila",
                fields: [
                    { id: "picchila", label: "Mucus/Picchila", type: "select", options: ["Absent", "Present"], required: true },
                    { id: "snigdhatva", label: "Unctuousness/Snigdhatva", type: "select", options: ["Absent", "Present"], required: true },
                    { id: "tantra", label: "Threads/Tantrika", type: "select", options: ["Absent", "Present"], required: true }
                ]
            },
            {
                title: "7. Additional Symptoms",
                id: "Additional",
                fields: [
                    { id: "nocturia", label: "Nocturia", type: "select", options: ["No", "Yes"], required: true },
                    { id: "pain", label: "Pain while urination", type: "select", options: ["None", "Mild", "Severe"], required: true },
                    { id: "edema", label: "Swelling/Edema", type: "select", options: ["No", "Yes"], required: true }
                ]
            }
        ];

        this.state = {
            currentPage: 0,
            patientData: this.loadFromStorage('patientData', {}),
            sarataData: this.loadFromStorage('sarataData', {}),
            finalVerdict: this.loadFromStorage('finalVerdict', '')
        };

        this.container = document.getElementById('app-content');
        this.init();
    }

    init() {
        this.renderPage();
        this.bindEvents();
    }

    // === Storage Management ===
    loadFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            this.showToast('Error loading saved data', 'error');
            return defaultValue;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            this.showToast('Error saving data', 'error');
        }
    }

    // === Toast Notifications ===
    showToast(message, type = 'info', duration = 4000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    // === Rendering Logic ===
    renderPage() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        const step = this.assessmentSteps[this.state.currentPage];

        // Render progress bar
        const progressPercentage = (this.state.currentPage / (this.assessmentSteps.length + 1)) * 100;
        const progressBarHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercentage}%;"></div>
            </div>
        `;

        // Render content based on current page
        let contentHTML;
        if (this.state.currentPage < this.assessmentSteps.length) {
            contentHTML = this.renderFormPage(step);
        } else {
            contentHTML = this.renderFinalPage();
        }

        this.container.innerHTML = progressBarHTML + contentHTML;
        this.populateFormData();
        this.bindFormEvents();
    }

    renderFormPage(step) {
        return `
            <h2>${step.title}</h2>
            <form id="assessmentForm" novalidate>
                ${step.fields.map(field => this.renderField(field)).join('')}
                <div class="button-group">
                    <button type="button" class="back" onclick="app.navigate(-1)">Back</button>
                    <button type="submit" class="next">Next</button>
                </div>
            </form>
        `;
    }

    renderField(field) {
        if (field.type === 'select') {
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}:</label>
                    <select id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>
                        <option value="">Select ${field.label}</option>
                        ${field.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
            `;
        }
        
        return `
            <div class="form-group">
                <label for="${field.id}">${field.label}:</label>
                <input type="${field.type}" id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''}>
            </div>
        `;
    }

    renderFinalPage() {
        return `
            <h2>Final Mutra Pariksha Report</h2>
            <div id="summary">
                <h3>Patient Information</h3>
                <pre class="summary-content" id="patientInfoSummary"></pre>
                <h3>Mutra Observations</h3>
                <pre class="summary-content" id="sarataSummary"></pre>
            </div>
            <div class="final-verdict-section">
                <h3>Final Verdict</h3>
                <textarea id="finalVerdict" rows="5" placeholder="Enter the final verdict/summary..."></textarea>
                <div class="button-group">
                    <button class="next" onclick="app.saveFinalVerdict()">Save Final Verdict</button>
                    <button class="next" onclick="app.printReport()">Print Report</button>
                    <button class="next" onclick="app.exportData()">Export Data</button>
                    <button class="back" onclick="app.resetAll()">Reset All</button>
                </div>
            </div>
            <div class="data-management-section">
                <h3>Data Management</h3>
                <div class="import-export-controls">
                    <label for="importFile" class="file-input-label">
                        <span>Import Previous Report</span>
                        <input type="file" id="importFile" accept=".json" style="display: none;" onchange="app.handleFileImport(this)">
                    </label>
                    <button class="info" onclick="app.showDataInfo()">Data Info</button>
                </div>
            </div>
            <div class="button-group">
                <button type="button" class="back" onclick="app.navigate(-1)">Back</button>
            </div>
        `;
    }

    // === Form Population and Events ===
    populateFormData() {
        if (this.state.currentPage < this.assessmentSteps.length) {
            const step = this.assessmentSteps[this.state.currentPage];
            const formData = this.state.currentPage === 0 ? this.state.patientData : this.state.sarataData[step.id];
            
            if (formData) {
                step.fields.forEach(field => {
                    const input = document.getElementById(field.id);
                    if (input && formData[field.id]) {
                        input.value = formData[field.id];
                    }
                });
            }
        } else {
            this.populateFinalPage();
        }
    }

    populateFinalPage() {
        // Patient Info Summary
        const patientInfoSummary = document.getElementById('patientInfoSummary');
        if (patientInfoSummary) {
            patientInfoSummary.textContent = `
Name: ${this.state.patientData.name || 'N/A'}
Age: ${this.state.patientData.age || 'N/A'}
Gender: ${this.state.patientData.gender || 'N/A'}
            `;
        }

        // Sarata Summary
        const sarataSummary = document.getElementById('sarataSummary');
        if (sarataSummary) {
            let text = '';
            for (const dhatu in this.state.sarataData) {
                text += `--- ${dhatu} ---\n`;
                for (const key in this.state.sarataData[dhatu]) {
                    const step = this.assessmentSteps.find(s => s.id === dhatu);
                    const field = step?.fields.find(f => f.id === key);
                    text += `  ${field?.label || key}: ${this.state.sarataData[dhatu][key]}\n`;
                }
                text += '\n';
            }
            
            const inference = this.inferDoshaAndNotes(this.state.sarataData);
            if (inference.summary) {
                text += `Dosha Inference: ${inference.summary}\nRecommendations: ${inference.recommendations}\n`;
            }
            sarataSummary.textContent = text;
        }

        // Final Verdict
        const finalVerdictTextarea = document.getElementById('finalVerdict');
        if (finalVerdictTextarea) {
            finalVerdictTextarea.value = this.state.finalVerdict;
        }
    }

    bindFormEvents() {
        const form = document.getElementById('assessmentForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    bindEvents() {
        // Global event bindings if needed
    }

    // === Form Submission and Validation ===
    handleFormSubmit(event) {
        event.preventDefault();
        const currentStep = this.assessmentSteps[this.state.currentPage];
        const formData = {};
        let isValid = true;

        currentStep.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                isValid = false;
                this.showFieldError(input, `${field.label} is required`);
            } else {
                formData[field.id] = input.value.trim();
                this.clearFieldError(input);
            }
        });

        if (isValid) {
            if (this.state.currentPage === 0) {
                this.state.patientData = formData;
                this.saveToStorage('patientData', this.state.patientData);
            } else {
                this.state.sarataData[currentStep.id] = formData;
                this.saveToStorage('sarataData', this.state.sarataData);
            }
            this.showToast('Data saved successfully', 'success');
            this.navigate(1);
        } else {
            this.showToast('Please fill all required fields', 'error');
        }
    }

    showFieldError(input, message) {
        input.style.borderColor = 'var(--danger-color)';
        input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
        
        // Remove existing error message
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        input.style.borderColor = '';
        input.style.boxShadow = '';
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }

    // === Navigation Logic ===
    navigate(direction) {
        // Validation for navigating forward
        if (direction > 0) {
            const currentStep = this.assessmentSteps[this.state.currentPage];
            let dataComplete = false;
            
            if (this.state.currentPage === 0) {
                dataComplete = this.state.patientData && Object.keys(this.state.patientData).length === currentStep.fields.length;
            } else {
                dataComplete = this.state.sarataData[currentStep.id] && Object.keys(this.state.sarataData[currentStep.id]).length === currentStep.fields.length;
            }
            
            if (!dataComplete) {
                this.showToast('Please complete the current page before moving forward', 'error');
                return;
            }
        }
        
        this.state.currentPage += direction;
        if (this.state.currentPage < 0) {
            this.state.currentPage = 0;
        } else if (this.state.currentPage > this.assessmentSteps.length) {
            this.state.currentPage = this.assessmentSteps.length;
        }
        
        this.renderPage();
    }

    // === Dosha Inference ===
    inferDoshaAndNotes(dataBySection) {
        const scores = { vata: 0, pitta: 0, kapha: 0 };
        
        const add = (type, points = 1) => { scores[type] += points; };
        const get = (section, field) => (dataBySection[section] || {})[field] || '';
        const includes = (section, field, terms) => {
            const v = (get(section, field) + '').toLowerCase();
            return terms.some(t => v.includes(t));
        };

        // Varna
        if (includes('Varna', 'varna', ['dark', 'reddish', 'brown'])) add('pitta', 2);
        if (includes('Varna', 'varna', ['straw', 'pale', 'clear'])) add('vata', 1);
        if (includes('Varna', 'varna', ['yellow'])) add('pitta', 1);

        // Gandha & Burning
        if (includes('Gandha', 'gandha', ['foul', 'strong'])) add('pitta', 2);
        if (includes('Gandha', 'gandha', ['sweet'])) add('kapha', 2);
        if (includes('Gandha', 'burning', ['burn'])) add('pitta', 2);

        // Rupa
        if (includes('Rupa', 'phenila', ['persistent'])) add('vata', 1);
        if (includes('Rupa', 'avila', ['turbid'])) add('kapha', 2);
        if (includes('Rupa', 'sediment', ['heavy', 'moderate'])) add('kapha', 1);

        // Picchila / Snigdhatva / Threads
        if (includes('Picchila', 'picchila', ['present'])) add('kapha', 2);
        if (includes('Picchila', 'snigdhatva', ['present'])) add('kapha', 2);
        if (includes('Picchila', 'tantra', ['present'])) add('vata', 1);

        // Collection & Symptoms
        if (includes('Collection', 'quantity', ['excess'])) add('kapha', 1);
        if (includes('Collection', 'quantity', ['scanty'])) add('vata', 1) || add('pitta', 1);
        if (includes('Collection', 'urgency', ['strong'])) add('pitta', 1);
        if (includes('Collection', 'dysuria', ['severe'])) add('pitta', 2);

        if (includes('Additional', 'nocturia', ['yes'])) add('kapha', 1);
        if (includes('Additional', 'pain', ['severe'])) add('pitta', 1) || add('vata', 1);

        const top = Object.entries(scores).sort((a,b) => b[1]-a[1]);
        const primary = top[0][1] > 0 ? top[0][0] : '';
        const secondary = top[1][1] > 0 ? top[1][0] : '';
        
        let summary = '';
        if (primary && secondary && top[0][1] - top[1][1] <= 1) {
            summary = `${primary.toUpperCase()}-${secondary.toUpperCase()} dominant pattern`;
        } else if (primary) {
            summary = `${primary.toUpperCase()} dominant pattern`;
        }

        let recommendations = '';
        if (primary === 'pitta') recommendations = 'Pitta-pacifying: cool fluids, coriander, avoid spicy/sour, manage heat.';
        if (primary === 'vata') recommendations = 'Vata-pacifying: warm fluids, cumin-fennel tea, routine, avoid dehydration.';
        if (primary === 'kapha') recommendations = 'Kapha-pacifying: reduce sweets/dairy, ginger tea, increase activity.';

        return { scores, summary, recommendations };
    }

    // === Final Verdict Save Logic ===
    saveFinalVerdict() {
        const verdict = document.getElementById('finalVerdict')?.value;
        if (verdict && verdict.trim()) {
            this.state.finalVerdict = verdict.trim();
            this.saveToStorage('finalVerdict', this.state.finalVerdict);
            this.showToast('Final Verdict Saved Successfully!', 'success');
        } else {
            this.showToast('Please provide a final verdict', 'error');
        }
    }

    // === Print & Reset ===
    printReport() {
        window.print();
        this.showToast('Print dialog opened', 'info');
    }

    resetAll() {
        if (!confirm('Are you sure you want to clear all saved data and restart? This action cannot be undone.')) {
            return;
        }
        
        try {
            localStorage.removeItem('patientData');
            localStorage.removeItem('sarataData');
            localStorage.removeItem('finalVerdict');
            
            this.state.currentPage = 0;
            this.state.patientData = {};
            this.state.sarataData = {};
            this.state.finalVerdict = '';
            
            this.renderPage();
            this.showToast('All data cleared successfully', 'success');
        } catch (error) {
            console.error('Error clearing data:', error);
            this.showToast('Error clearing data', 'error');
        }
    }

    // === Export/Import Functionality ===
    exportData() {
        try {
            const exportData = {
                patientData: this.state.patientData,
                sarataData: this.state.sarataData,
                finalVerdict: this.state.finalVerdict,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `mutra-pariksha-report-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }

    handleFileImport(input) {
        const file = input.files[0];
        if (file) {
            this.importData(file);
            input.value = ''; // Reset input
        }
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.patientData && data.sarataData) {
                    this.state.patientData = data.patientData;
                    this.state.sarataData = data.sarataData;
                    this.state.finalVerdict = data.finalVerdict || '';
                    
                    this.saveToStorage('patientData', this.state.patientData);
                    this.saveToStorage('sarataData', this.state.sarataData);
                    this.saveToStorage('finalVerdict', this.state.finalVerdict);
                    
                    this.renderPage();
                    this.showToast('Data imported successfully', 'success');
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                this.showToast('Invalid file format or corrupted data', 'error');
            }
        };
        reader.readAsText(file);
    }

    showDataInfo() {
        const totalSteps = this.assessmentSteps.length;
        const completedSteps = Object.keys(this.state.sarataData).length;
        const hasPatientData = Object.keys(this.state.patientData).length > 0;
        const hasFinalVerdict = this.state.finalVerdict.trim().length > 0;
        
        const info = `
Data Status:
- Patient Information: ${hasPatientData ? '✓ Complete' : '✗ Incomplete'}
- Assessment Steps: ${completedSteps}/${totalSteps} completed
- Final Verdict: ${hasFinalVerdict ? '✓ Saved' : '✗ Not saved'}
- Data Last Modified: ${this.getLastModifiedDate()}
        `;
        
        alert(info);
    }

    getLastModifiedDate() {
        try {
            const patientData = localStorage.getItem('patientData');
            const sarataData = localStorage.getItem('sarataData');
            const finalVerdict = localStorage.getItem('finalVerdict');
            
            let lastModified = 0;
            if (patientData) lastModified = Math.max(lastModified, new Date(JSON.parse(patientData).lastModified || 0).getTime());
            if (sarataData) lastModified = Math.max(lastModified, new Date(JSON.parse(sarataData).lastModified || 0).getTime());
            if (finalVerdict) lastModified = Math.max(lastModified, new Date().getTime());
            
            return lastModified > 0 ? new Date(lastModified).toLocaleString() : 'Never';
        } catch (error) {
            return 'Unknown';
        }
    }
}

// === Initialize App ===
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MutraParikshaApp();
});

// === Global Functions for HTML onclick handlers ===
window.navigate = (direction) => app?.navigate(direction);
window.saveFinalVerdict = () => app?.saveFinalVerdict();
window.printReport = () => app?.printReport();
window.resetAll = () => app?.resetAll();
window.exportData = () => app?.exportData();
