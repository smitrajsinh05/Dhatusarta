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
            title: "2. Tvak Sara Assessment",
            id: "Tvak Sara",
            fields: [
                { id: "oiliness", label: "Skin Oiliness (e.g., Oily, Dry, Normal)" },
                { id: "smoothness", label: "Skin Smoothness (e.g., Smooth, Rough)" },
                { id: "radiance", label: "Skin Radiance (e.g., Radiant, Dull)" },
                { id: "hair", label: "Hair Qualities (e.g., Soft, Shiny, Dense)" }
            ]
        },
        {
            title: "3. Rakta Sara Assessment",
            id: "Rakta Sara",
            fields: [
                { id: "complexion", label: "Complexion (e.g., Reddish, Rosy)" },
                { id: "radiance", label: "Radiance" },
                { id: "mental", label: "Mental Attributes (e.g., Intelligence, Tolerance to Stress)" }
            ]
        },
        {
            title: "4. Mamsa Sara Assessment",
            id: "Mamsa Sara",
            fields: [
                { id: "development", label: "Muscle Development (e.g., Well-developed, Firm)" },
                { id: "forgiveness", label: "Forgiveness" },
                { id: "retaining", label: "Retaining Power" }
            ]
        },
        {
            title: "5. Medas Sara Assessment",
            id: "Medas Sara",
            fields: [
                { id: "oiliness", label: "Oily Qualities (e.g., Oily, Dry)" },
                { id: "body_frame", label: "Body Frame (e.g., Heavy, Light)" },
                { id: "tolerance", label: "Physical Tolerance (e.g., High, Low)" }
            ]
        },
        {
            title: "6. Asthi Sara Assessment",
            id: "Asthi Sara",
            fields: [
                { id: "bones", label: "Prominence of Bones (e.g., Heels, Ankles)" },
                { id: "enthusiasm", label: "Enthusiasm" },
                { id: "activity", label: "Activity Level" }
            ]
        },
        {
            title: "7. Majja Sara Assessment",
            id: "Majja Sara",
            fields: [
                { id: "body_parts", label: "Body Parts (e.g., Well-built limbs)" },
                { id: "voice", label: "Voice Quality" },
                { id: "joint_size", label: "Joint Size" }
            ]
        },
        {
            title: "8. Shukra Sara Assessment",
            id: "Shukra Sara",
            fields: [
                { id: "appearance", label: "Appearance (e.g., Gentle Look, Oily Teeth)" },
                { id: "personality", label: "Personality Traits (e.g., Charming, Powerful)" },
                { id: "libido", label: "High Libido" }
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
                <h2>Final Assessment & Verdict</h2>
                <div id="summary">
                    <h3>Patient Information</h3>
                    <pre class="summary-content" id="patientInfoSummary"></pre>
                    <h3>Sara Assessments</h3>
                    <pre class="summary-content" id="sarataSummary"></pre>
                </div>
                <div class="final-verdict-section">
                    <h3>Final Verdict</h3>
                    <textarea id="finalVerdict" rows="5" placeholder="Enter the final verdict/summary..."></textarea>
                    <button class="next" onclick="saveFinalVerdict()">Save Final Verdict</button>
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
                sarataSummary.textContent = text;
            }

            const finalVerdictTextarea = document.getElementById('finalVerdict');
            if (finalVerdictTextarea) {
                finalVerdictTextarea.value = state.finalVerdict;
            }
        }
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

    // Initial render
    renderPage();
});
