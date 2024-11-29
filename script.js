// Pricing constants (in pounds per square meter)
const MATERIAL_PRICES = {
    asphalt: 85,
    concrete: 100,
    pavers: 120,
    gravel: 45
};

const SERVICE_BASE_PRICES = {
    driveway: 50,
    patio: 65,
    walkway: 55,
    landscaping: 45,
    repair: 35
};

const ADDITIONAL_SERVICES = {
    drainage: 1500,
    edging: 25, // per linear meter, estimated as perimeter
    lighting: 750,
    sealing: 15 // per square meter
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quoteForm');
    const quoteResult = document.getElementById('quoteResult');
    const quoteDetails = document.querySelector('.quote-details');
    const newQuoteBtn = document.getElementById('newQuote');
    const saveQuoteBtn = document.getElementById('saveQuote');
    const emailQuoteBtn = document.getElementById('emailQuote');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generateQuote();
    });

    function generateQuote() {
        // Get form values
        const clientName = document.getElementById('clientName').value;
        const clientEmail = document.getElementById('clientEmail').value;
        const clientPhone = document.getElementById('clientPhone').value;
        const projectAddress = document.getElementById('projectAddress').value;
        const serviceType = document.getElementById('serviceType').value;
        const areaSize = parseFloat(document.getElementById('areaSize').value);
        const materialType = document.getElementById('materialType').value;
        const additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
            .map(checkbox => checkbox.value);
        const projectNotes = document.getElementById('projectNotes').value;

        // Calculate base cost
        const baseCost = (MATERIAL_PRICES[materialType] + SERVICE_BASE_PRICES[serviceType]) * areaSize;

        // Calculate additional services cost
        let additionalCost = 0;
        additionalServices.forEach(service => {
            if (service === 'edging') {
                // Estimate perimeter as sqrt(area) * 4
                const estimatedPerimeter = Math.ceil(Math.sqrt(areaSize) * 4);
                additionalCost += ADDITIONAL_SERVICES[service] * estimatedPerimeter;
            } else if (service === 'sealing') {
                additionalCost += ADDITIONAL_SERVICES[service] * areaSize;
            } else {
                additionalCost += ADDITIONAL_SERVICES[service];
            }
        });

        // Calculate total cost
        const subtotal = baseCost + additionalCost;
        const tax = subtotal * 0.20; // 20% tax
        const total = subtotal + tax;

        // Display quote
        displayQuote({
            clientName,
            clientEmail,
            clientPhone,
            projectAddress,
            serviceType,
            areaSize,
            materialType,
            additionalServices,
            projectNotes,
            baseCost,
            additionalCost,
            tax,
            total
        });
    }

    function displayQuote(quoteData) {
        const serviceNames = {
            driveway: 'Driveway Paving',
            patio: 'Patio Installation',
            walkway: 'Walkway Construction',
            landscaping: 'Landscaping',
            repair: 'Repair/Maintenance'
        };

        const materialNames = {
            asphalt: 'Asphalt',
            concrete: 'Concrete',
            pavers: 'Pavers',
            gravel: 'Gravel'
        };

        const quoteHTML = `
            <div class="quote-header">
                <h3>Quote Details</h3>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Quote Reference:</strong> IP-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div class="client-details">
                <h4>Client Information</h4>
                <p><strong>Name:</strong> ${quoteData.clientName}</p>
                <p><strong>Email:</strong> ${quoteData.clientEmail}</p>
                <p><strong>Phone:</strong> ${quoteData.clientPhone}</p>
                <p><strong>Project Address:</strong> ${quoteData.projectAddress}</p>
            </div>
            <div class="project-details">
                <h4>Project Specifications</h4>
                <p><strong>Service:</strong> ${serviceNames[quoteData.serviceType]}</p>
                <p><strong>Area Size:</strong> ${quoteData.areaSize} m²</p>
                <p><strong>Material:</strong> ${materialNames[quoteData.materialType]}</p>
                ${quoteData.additionalServices.length ? `
                    <p><strong>Additional Services:</strong></p>
                    <ul>
                        ${quoteData.additionalServices.map(service => 
                            `<li>${service.charAt(0).toUpperCase() + service.slice(1)}</li>`
                        ).join('')}
                    </ul>
                ` : ''}
                ${quoteData.projectNotes ? `
                    <p><strong>Notes:</strong> ${quoteData.projectNotes}</p>
                ` : ''}
            </div>
            <div class="cost-breakdown">
                <h4>Cost Breakdown</h4>
                <p><strong>Base Cost:</strong> £${quoteData.baseCost.toFixed(2)}</p>
                <p><strong>Additional Services:</strong> £${quoteData.additionalCost.toFixed(2)}</p>
                <p><strong>Subtotal:</strong> £${(quoteData.baseCost + quoteData.additionalCost).toFixed(2)}</p>
                <p><strong>Tax (20%):</strong> £${quoteData.tax.toFixed(2)}</p>
                <p class="total"><strong>Total:</strong> £${quoteData.total.toFixed(2)}</p>
            </div>
            <div class="quote-footer">
                <p><em>This quote is valid for 30 days from the date of issue.</em></p>
                <p><em>Terms and conditions apply. Please contact us for more details.</em></p>
            </div>
        `;

        quoteDetails.innerHTML = quoteHTML;
        quoteResult.classList.remove('hidden');
        window.scrollTo({ top: quoteResult.offsetTop, behavior: 'smooth' });
    }

    newQuoteBtn.addEventListener('click', function() {
        form.reset();
        quoteResult.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    saveQuoteBtn.addEventListener('click', function() {
        // Convert quote to PDF using jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const content = quoteDetails.innerText;
        const splitContent = doc.splitTextToSize(content, 180);
        
        doc.text('Indie Paving - Project Quote', 105, 15, { align: 'center' });
        doc.text(splitContent, 15, 25);
        
        doc.save('indie-paving-quote.pdf');
    });

    emailQuoteBtn.addEventListener('click', function() {
        const subject = 'Indie Paving - Project Quote';
        const body = quoteDetails.innerText;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
});
