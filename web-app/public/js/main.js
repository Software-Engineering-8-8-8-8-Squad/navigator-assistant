// Main JavaScript for Navigator Assistant

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the index page
    if (document.getElementById('route-form')) {
        initializeMainPage();
    }
    
    // Check if we're on the navigation page
    if (document.getElementById('results')) {
        initializeNavigationPage();
    }
});

function initializeMainPage() {
    const vehicleButtons = document.querySelectorAll('.vehicle-btn');
    const vehicleInput = document.getElementById('vehicle');
    const routeForm = document.getElementById('route-form');
    const submitBtn = routeForm.querySelector('.submit-btn');

    // Vehicle selection
    let selectedVehicle = '';

    vehicleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            vehicleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set the vehicle value
            selectedVehicle = this.dataset.vehicle;
            vehicleInput.value = selectedVehicle;
            
            // Update submit button state
            updateSubmitButton();
        });
    });

    // Form submission
    routeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!selectedVehicle) {
            alert('Please select a vehicle type');
            return;
        }

        // Store form data in sessionStorage
        const formData = {
            start: document.getElementById('start').value,
            end: document.getElementById('end').value,
            vehicle: selectedVehicle
        };
        
        sessionStorage.setItem('routeData', JSON.stringify(formData));
        
        // Redirect to navigation page
        window.location.href = '/navigation';
    });

    // Update submit button based on vehicle selection
    function updateSubmitButton() {
        if (selectedVehicle) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // Initial state
    updateSubmitButton();
}

function initializeNavigationPage() {
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');
    
    // Get route data from sessionStorage
    const routeData = JSON.parse(sessionStorage.getItem('routeData'));
    
    if (!routeData) {
        // Redirect back to home if no route data
        window.location.href = '/';
        return;
    }

    // Fetch route from API
    fetchRoute(routeData);

    async function fetchRoute(data) {
        try {
            const response = await fetch('/api/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to fetch route');
            }

            const result = await response.json();
            
            if (result.error) {
                showError(result.error);
            } else {
                displayResults(result);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            
            // Check if we have error response data
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                if (errorData.error) {
                    showError(errorData.error, errorData.details);
                } else {
                    showError('Failed to get directions. Please try again.');
                }
            } else {
                showError('Network error. Please check your connection and try again.');
            }
        }
    }

    function showError(message, details = null) {
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        
        const errorParagraph = errorDiv.querySelector('p');
        
        // If the message contains newlines, format it properly
        if (message.includes('\n')) {
            // Split the message into paragraphs
            const parts = message.split('\n');
            let formattedMessage = '';
            
            parts.forEach(part => {
                if (part.startsWith('•')) {
                    formattedMessage += `<li>${part.substring(1).trim()}</li>`;
                } else if (part.trim()) {
                    formattedMessage += `<p>${part}</p>`;
                }
            });
            
            // Wrap list items in ul if present
            if (formattedMessage.includes('<li>')) {
                formattedMessage = formattedMessage.replace(/<li>/g, '<ul><li>');
                formattedMessage = formattedMessage.replace(/<\/li>([^<])/g, '</li></ul>$1');
            }
            
            errorParagraph.innerHTML = formattedMessage;
        } else {
            errorParagraph.textContent = message;
        }
        
        // Add details if provided
        if (details) {
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'error-details';
            detailsDiv.innerHTML = `
                <h4>Details:</h4>
                <p>Start: ${details.startLocation}</p>
                <p>End: ${details.endLocation}</p>
                <p>Vehicle: ${details.vehicle}</p>
            `;
            errorParagraph.appendChild(detailsDiv);
        }
    }

    function displayResults(data) {
        loadingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';

        // Update route summary
        document.getElementById('start-location').textContent = 
            `${data.start.name}${data.start.country ? ', ' + data.start.country : ''}`;
        document.getElementById('end-location').textContent = 
            `${data.end.name}${data.end.country ? ', ' + data.end.country : ''}`;
        
        // Update vehicle info
        document.getElementById('vehicle-type').textContent = 
            getFormattedVehicleName(data.vehicle);
        
        // Update vehicle icon
        const vehicleIcon = document.getElementById('vehicle-icon');
        vehicleIcon.className = getVehicleIcon(data.vehicle);
        
        // Update distance and duration
        document.getElementById('distance').textContent = 
            `${data.route.distance.miles} mi / ${data.route.distance.km} km`;
        document.getElementById('duration').textContent = data.route.duration;

        // Update route details if available
        if (data.route.elevationGain !== undefined || data.route.elevationLoss !== undefined) {
            const routeDetails = document.getElementById('route-details');
            if (routeDetails) {
                routeDetails.style.display = 'block';
                if (data.route.elevationGain !== undefined) {
                    document.getElementById('elevation-gain').textContent = 
                        `${Math.round(data.route.elevationGain)} m`;
                }
                if (data.route.elevationLoss !== undefined) {
                    document.getElementById('elevation-loss').textContent = 
                        `${Math.round(data.route.elevationLoss)} m`;
                }
            }
        }

        // Update directions list
        const directionsList = document.getElementById('directions-list');
        directionsList.innerHTML = '';

        data.route.instructions.forEach((instruction, index) => {
            const directionItem = createDirectionItem(instruction, index + 1);
            directionsList.appendChild(directionItem);
        });
    }

    function getFormattedVehicleName(vehicle) {
        const names = {
            'car': 'Car',
            'bike': 'Bike',
            'foot': 'Walk',
            'ecargobike': 'E-Cargo Bike'
        };
        return names[vehicle] || vehicle.charAt(0).toUpperCase() + vehicle.slice(1);
    }

    function getVehicleIcon(vehicle) {
        switch (vehicle) {
            case 'car':
                return 'fas fa-car';
            case 'bike':
                return 'fas fa-bicycle';
            case 'foot':
                return 'fas fa-walking';
            case 'ecargobike':
                return 'fas fa-truck-loading';
            default:
                return 'fas fa-route';
        }
    }

    function createDirectionItem(instruction, number) {
        const item = document.createElement('div');
        item.className = 'direction-item';

        const distance = formatInstructionDistance(instruction.distance);
        
        item.innerHTML = `
            <div class="direction-number">${number}</div>
            <div class="direction-text">
                <p>${instruction.text}</p>
                <span class="direction-distance">${distance}</span>
            </div>
        `;

        return item;
    }

    function formatInstructionDistance(meters) {
        const km = meters / 1000;
        const miles = km * 0.621371;
        return `${miles.toFixed(1)} mi / ${km.toFixed(1)} km`;
    }
}