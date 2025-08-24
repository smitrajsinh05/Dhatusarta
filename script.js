document.addEventListener('DOMContentLoaded', () => {
    // === Data-Driven Configuration ===
    const assessmentSteps = [
        {
            title: "1. Patient Record",
            id: "patientInfo",
            fields: [
                { id: "name", label: "Patient Name" },
                { id: "age", label: "Age" },
                { id: "gender", label: "Gender" }
            ]
        },
        {
            title: "2. Collection & Quantity",
            id: "Collection",
            fields: [
                { id: "collection_time", label: "Collection Time (e.g., Morning, Afternoon, Night)" },
                { id: "fasting_state", label: "State (e.g., Fasting, Post-prandial, Random)" },
                { id: "quantity", label: "Quantity (e.g., Scanty, Moderate, Excessive)" },
                { id: "frequency", label: "Frequency (e.g., Low, Normal, High)" },
                { id: "urgency", label: "Urgency (e.g., None, Mild, Strong)" },
                { id: "dysuria", label: "Dysuria/Burning (e.g., None, Mild, Severe)" }
            ]
        },
        {
            title: "3. Varna (Color)",
            id: "Varna",
            fields: [
                { id: "varna", label: "Color (e.g., Clear, Straw, Yellow, Dark Yellow, Reddish, Brownish)" }
            ]
        },
        {
            title: "4. Gandha & Sensation",
            id: "Gandha",
            fields: [
                { id: "gandha", label: "Odor (e.g., Mild, Strong, Foul, Sweetish)" },
                { id: "burning", label: "Burning Sensation (e.g., None, Mild, Burning)" }
            ]
        },
        {
            title: "5. Rupa (Appearance)",
            id: "Rupa",
            fields: [
                { id: "phenila", label: "Froth/Phenila (e.g., Absent, Mild, Persistent)" },
                { id: "avila", label: "Turbidity/Avila (e.g., Clear, Slightly turbid, Turbid)" },
                { id: "sediment", label: "Sediment (e.g., None, Minimal, Moderate, Heavy)" }
            ]
        },
        {
            title: "6. Picchila/Snigdhatva/Threads",
            id: "Picchila",
            fields: [
                { id: "picchila", label: "Mucus/Picchila (e.g., Absent, Present)" },
                { id: "snigdhatva", label: "Unctuousness/Snigdhatva (e.g., Absent, Present)" },
                { id: "tantra", label: "Threads/Tantrika (e.g., Absent, Present)" }
            ]
        },
        {
            title: "7. Additional Symptoms",
            id: "Additional",
            fields: [
                { id: "nocturia", label: "Nocturia (e.g., No, Yes)" },
                { id: "pain", label: "Pain while urination (e.g., None, Mild, Severe)" },
                { id: "edema", label: "Swelling/Edema (e.g., No, Yes)" }
            ]
        }
    ];

    // === State Management ===
    const state = {
        currentPage: 0,
        patientData: JSON.parse(localStorage.getItem('patientData') || '{}'),
        sarataData: JSON.parse(localStorage.getItem('sarataData') || '{}'),
        finalVerdict: localStorage.getItem('finalVerdict') || ''
    };

    // === DOM Elements ===
    const container = document.querySelector('.container');

    // === Rendering Logic ===
    const renderPage = () => {
        container.innerHTML = '';
        const step = assessmentSteps[state.currentPage];

        // Render progress bar
        const progressPercentage = (state.currentPage / (assessmentSteps.length + 1)) * 100;
        const progressBarHTML = `
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercentage}%;"></div>
            </div>
        `;

        // Render content based on current page
        let contentHTML;
        if (state.currentPage < assessmentSteps.length) {
            contentHTML = `
                <h2>${step.title}</h2>
                <form id="assessmentForm">
                    ${step.fields.map(field => `
                        <div class="form-group">
                            <label for="${field.id}">${field.label}:</label>
                            <input type="text" id="${field.id}" name="${field.id}" required>
                        </div>
                    `).join('')}
                    <div class="button-group">
                        <button type="button" class="back" onclick="navigate(-1)">Back</button>
                        <button type="submit" class="next">Next</button>
                    </div>
                </form>
            `;
        } else {
            // Final assessment page
            contentHTML = `
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
                        <button class="next" onclick="saveFinalVerdict()">Save Final Verdict</button>
                        <button class="next" onclick="printReport()">Print Report</button>
                        <button class="back" onclick="resetAll()">Reset All</button>
                    </div>
                </div>
                <div class="button-group">
                    <button type="button" class="back" onclick="navigate(-1)">Back</button>
                </div>
            `;
        }

        container.innerHTML = progressBarHTML + contentHTML;

        // Populate form fields with existing data
        if (state.currentPage < assessmentSteps.length) {
            const formData = state.currentPage === 0 ? state.patientData : state.sarataData[step.id];
            if (formData) {
                step.fields.forEach(field => {
                    const input = document.getElementById(field.id);
                    if (input && formData[field.id]) {
                        input.value = formData[field.id];
                    }
                });
            }
            document.getElementById('assessmentForm').addEventListener('submit', handleFormSubmit);
        } else {
            // Populate final assessment
            const patientInfoSummary = document.getElementById('patientInfoSummary');
            if (patientInfoSummary) {
                patientInfoSummary.textContent = `
Name: ${state.patientData.name || 'N/A'}
Age: ${state.patientData.age || 'N/A'}
Gender: ${state.patientData.gender || 'N/A'}
                `;
            }

            const sarataSummary = document.getElementById('sarataSummary');
            if (sarataSummary) {
                let text = '';
                for (const dhatu in state.sarataData) {
                    text += `--- ${dhatu} ---\n`;
                    for (const key in state.sarataData[dhatu]) {
                        text += `  ${assessmentSteps.find(s => s.id === dhatu)?.fields.find(f => f.id === key)?.label || key}: ${state.sarataData[dhatu][key]}\n`;
                    }
                    text += '\n';
                }
                const inference = inferDoshaAndNotes(state.sarataData);
                if (inference.summary) {
                    text += `Dosha Inference: ${inference.summary}\nRecommendations: ${inference.recommendations}\n`;
                }
                sarataSummary.textContent = text;
            }

            const finalVerdictTextarea = document.getElementById('finalVerdict');
            if (finalVerdictTextarea) {
                finalVerdictTextarea.value = state.finalVerdict;
            }
        }
    };

    // === Dosha Inference (basic heuristic) ===
    const inferDoshaAndNotes = (dataBySection) => {
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
    };

    // === Form Submission and Validation ===
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const currentStep = assessmentSteps[state.currentPage];
        const formData = {};
        let isComplete = true;

        currentStep.fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value) {
                isComplete = false;
            }
            formData[field.id] = input.value;
        });

        if (isComplete) {
            if (state.currentPage === 0) {
                state.patientData = formData;
                localStorage.setItem('patientData', JSON.stringify(state.patientData));
            } else {
                state.sarataData[currentStep.id] = formData;
                localStorage.setItem('sarataData', JSON.stringify(state.sarataData));
            }
            navigate(1);
        } else {
            alert('Please fill all fields to proceed.');
        }
    };

    // === Navigation Logic ===
    window.navigate = (direction) => {
        // Validation for navigating forward
        if (direction > 0) {
            const currentStep = assessmentSteps[state.currentPage];
            let dataComplete = false;
            if (state.currentPage === 0) {
                dataComplete = state.patientData && Object.keys(state.patientData).length === currentStep.fields.length;
            } else {
                dataComplete = state.sarataData[currentStep.id] && Object.keys(state.sarataData[currentStep.id]).length === currentStep.fields.length;
            }
            if (!dataComplete) {
                alert("Please complete the current page before moving forward.");
                return;
            }
        }
        
        state.currentPage += direction;
        if (state.currentPage < 0) {
            state.currentPage = 0; // Prevent going before first page
        } else if (state.currentPage > assessmentSteps.length) {
            state.currentPage = assessmentSteps.length; // Prevent going past last page
        }
        renderPage();
    };
    
    // === Final Verdict Save Logic ===
    window.saveFinalVerdict = () => {
        const verdict = document.getElementById('finalVerdict').value;
        if (verdict) {
            state.finalVerdict = verdict;
            localStorage.setItem('finalVerdict', verdict);
            alert('Final Verdict Saved!');
        } else {
            alert('Please provide a final verdict.');
        }
    };

    // === Print & Reset ===
    window.printReport = () => {
        window.print();
    };

    window.resetAll = () => {
        if (!confirm('Clear all saved data and restart?')) return;
        localStorage.removeItem('patientData');
        localStorage.removeItem('sarataData');
        localStorage.removeItem('finalVerdict');
        state.currentPage = 0;
        state.patientData = {};
        state.sarataData = {};
        state.finalVerdict = '';
        renderPage();
    };

    // Initial render
    renderPage();
});
