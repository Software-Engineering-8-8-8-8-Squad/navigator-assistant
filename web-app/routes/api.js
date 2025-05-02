const express = require('express');
const router = express.Router();
const axios = require('axios');

// Make sure environment variables are loaded
if (!process.env.GRAPHHOPPER_API_KEY) {
    console.error('WARNING: GRAPHHOPPER_API_KEY not found in environment variables');
}

const GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;
const GEOCODE_URL = 'https://graphhopper.com/api/1/geocode';
const ROUTE_URL = 'https://graphhopper.com/api/1/route';

console.log('GraphHopper API Key loaded:', GRAPHHOPPER_API_KEY ? 'Yes' : 'No');

// Helper function to format time
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to format distance
function formatDistance(meters) {
    const km = meters / 1000;
    const miles = km * 0.621371;
    return {
        km: km.toFixed(1),
        miles: miles.toFixed(1)
    };
}

// Geocode location with more options
async function geocodeLocation(location) {
    try {
        console.log(`Geocoding location: "${location}"`);
        
        // Try to identify if it's a country code or short abbreviation
        const locationQuery = location.toLowerCase();
        const countryMappings = {
            'usa': 'United States',
            'us': 'United States',
            'uk': 'United Kingdom',
            'gb': 'United Kingdom',
            'uae': 'United Arab Emirates'
        };
        
        // Use mapping if available
        const queryLocation = countryMappings[locationQuery] || location;
        
        const response = await axios.get(GEOCODE_URL, {
            params: {
                q: queryLocation,
                limit: 1,
                key: GRAPHHOPPER_API_KEY,
                locale: 'en'  // Force English responses
            }
        });

        console.log(`Geocoding response for "${location}":`, response.data);

        if (response.data.hits && response.data.hits.length > 0) {
            const hit = response.data.hits[0];
            const locationData = {
                lat: hit.point.lat,
                lng: hit.point.lng,
                name: hit.name || location,
                country: hit.country,
                city: hit.city,
                state: hit.state,
                street: hit.street,
                osm_value: hit.osm_value  // Location type
            };
            console.log(`Geocoded "${location}" to:`, locationData);
            return locationData;
        }
        console.log(`No geocoding results found for "${location}"`);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        console.error('Error details:', error.response?.data);
        return null;
    }
}

// Get directions with enhanced options
async function getDirections(startLoc, endLoc, vehicle, options = {}) {
    try {
        // Manually construct URL to avoid axios array formatting issues
        const queryParams = [];
        
        // Add essential parameters
        queryParams.push(`vehicle=${encodeURIComponent(vehicle)}`);
        queryParams.push(`key=${encodeURIComponent(GRAPHHOPPER_API_KEY)}`);
        queryParams.push(`instructions=true`);
        queryParams.push(`locale=en`);
        
        // Add points
        queryParams.push(`point=${encodeURIComponent(startLoc.lat + ',' + startLoc.lng)}`);
        queryParams.push(`point=${encodeURIComponent(endLoc.lat + ',' + endLoc.lng)}`);
        
        // Optional parameters
        queryParams.push(`elevation=true`);
        queryParams.push(`points_encoded=false`);
        
        // Add details
        ['road_class', 'surface', 'max_speed'].forEach(detail => {
            queryParams.push(`details=${encodeURIComponent(detail)}`);
        });
        
        // Construct full URL
        const fullUrl = `${ROUTE_URL}?${queryParams.join('&')}`;
        console.log('Routing URL:', fullUrl);

        const response = await axios.get(fullUrl);

        if (response.data.paths && response.data.paths.length > 0) {
            const path = response.data.paths[0];
            return {
                distance: formatDistance(path.distance),
                duration: formatTime(path.time),
                instructions: path.instructions,
                points: path.points,
                elevationGain: path.ascend,
                elevationLoss: path.descend,
                details: path.details,
                warnings: path.warnings || []
            };
        }
        return null;
    } catch (error) {
        console.error('Routing error:', error);
        console.error('Error details:', error.response?.data);
        throw error;
    }
}

// API endpoint to get route
router.post('/route', async (req, res) => {
    const { start, end, vehicle, options } = req.body;

    if (!start || !end || !vehicle) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (!GRAPHHOPPER_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: API key not found' });
    }

    try {
        // Geocode start location
        const startLocation = await geocodeLocation(start);
        if (!startLocation) {
            return res.status(400).json({ error: 'Could not find starting location' });
        }

        // Geocode end location
        const endLocation = await geocodeLocation(end);
        if (!endLocation) {
            return res.status(400).json({ error: 'Could not find destination' });
        }

        // Check if locations are likely to be connected
        if (startLocation.osm_value === 'country' && endLocation.osm_value === 'country' &&
            startLocation.country !== endLocation.country) {
            // Different countries - check if they're on different continents
            const continents = {
                'Europe': ['United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Turkey', 'Russia'],
                'Asia': ['China', 'Japan', 'South Korea', 'India', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Russia', 'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'Uzbekistan'],
                'North America': ['United States', 'Canada', 'Mexico'],
                'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
                'Africa': ['South Africa', 'Egypt', 'Kenya', 'Nigeria', 'Morocco'],
                'Oceania': ['Australia', 'New Zealand']
            };
            
            let startContinent = null;
            let endContinent = null;
            
            for (const [continent, countries] of Object.entries(continents)) {
                if (countries.includes(startLocation.country)) startContinent = continent;
                if (countries.includes(endLocation.country)) endContinent = continent;
            }
            
            if (startContinent && endContinent && startContinent !== endContinent && 
                !(startContinent === 'Europe' && endContinent === 'Asia') && 
                !(startContinent === 'Asia' && endContinent === 'Europe')) {
                return res.status(400).json({ 
                    error: `Cannot route between ${startLocation.name} and ${endLocation.name}. These locations are on different continents and not connected by road network.`,
                    details: {
                        startLocation: startLocation.name,
                        endLocation: endLocation.name,
                        startContinent,
                        endContinent,
                        vehicle
                    }
                });
            }
        }

        // Get directions
        const route = await getDirections(startLocation, endLocation, vehicle, options);
        if (!route) {
            return res.status(400).json({ error: 'Could not calculate route' });
        }

        res.json({
            start: startLocation,
            end: endLocation,
            vehicle: vehicle,
            route: route
        });
    } catch (error) {
        console.error('Route API error:', error);
        
        // Handle specific GraphHopper errors
        if (error.response) {
            console.error('GraphHopper API Error Response:', error.response.data);
            
            if (error.response.status === 401) {
                return res.status(401).json({ 
                    error: 'Invalid API key. Please check your GraphHopper API key configuration.' 
                });
            }
            if (error.response.status === 429) {
                return res.status(429).json({ 
                    error: 'API rate limit exceeded. Please try again later.' 
                });
            }
            if (error.response.status === 400) {
                const message = error.response.data?.message || 'Bad request';
                console.error('400 Error details:', error.response.data);
                
                // Handle specific routing errors
                if (message.includes('Cannot find point')) {
                    const errorDetail = error.response.data.hints?.[0];
                    let userMessage = 'Unable to find a route between these locations. ';
                    
                    if (errorDetail?.point_index === 0) {
                        userMessage += `The starting location (${startLocation.name}) cannot be accessed by ${vehicle}. `;
                    } else if (errorDetail?.point_index === 1) {
                        userMessage += `The destination (${endLocation.name}) cannot be accessed by ${vehicle}. `;
                    } else {
                        userMessage += 'One or both locations cannot be accessed by the selected vehicle. ';
                    }
                    
                    userMessage += 'This might be because:\n';
                    userMessage += '• The location is not connected to the road network\n';
                    userMessage += '• The area is not covered by GraphHopper\'s map data\n';
                    userMessage += '• The locations are too far apart for routing\n';
                    userMessage += '\nTry using different locations or vehicle type.';
                    
                    return res.status(400).json({ 
                        error: userMessage,
                        details: {
                            message: message,
                            startLocation: startLocation.name,
                            endLocation: endLocation.name,
                            vehicle: vehicle
                        }
                    });
                }
                
                if (message.includes('Connection between locations not found')) {
                    return res.status(400).json({ 
                        error: `No connection found between ${startLocation.name} and ${endLocation.name} using ${vehicle}. These locations might be on different continents or islands.`
                    });
                }
                
                return res.status(400).json({ 
                    error: `GraphHopper API Error: ${message}` 
                });
            }
            if (error.response.data && error.response.data.message) {
                return res.status(400).json({ 
                    error: error.response.data.message 
                });
            }
        }
        
        res.status(500).json({ error: 'Failed to get route' });
    }
});

// New endpoint for isochrones
router.post('/isochrone', async (req, res) => {
    const { location, time_limit, distance_limit, vehicle } = req.body;

    try {
        const loc = await geocodeLocation(location);
        if (!loc) {
            return res.status(400).json({ error: 'Could not find location' });
        }

        const params = {
            point: `${loc.lat},${loc.lng}`,
            key: GRAPHHOPPER_API_KEY,
            vehicle: vehicle || 'car',
            buckets: 1
        };

        if (time_limit) {
            params.time_limit = time_limit;
        } else if (distance_limit) {
            params.distance_limit = distance_limit;
        }

        const response = await axios.get('https://graphhopper.com/api/1/isochrone', { params });
        
        res.json({
            location: loc,
            isochrone: response.data
        });
    } catch (error) {
        console.error('Isochrone API error:', error);
        res.status(500).json({ error: 'Failed to get isochrone' });
    }
});

// Get available profiles
router.get('/profiles', (req, res) => {
    // Standard profiles + any custom profiles
    const profiles = [
        { id: 'car', name: 'Car', icon: 'fas fa-car' },
        { id: 'bike', name: 'Bike', icon: 'fas fa-bicycle' },
        { id: 'foot', name: 'Walk', icon: 'fas fa-walking' }
    ];
    
    res.json(profiles);
});

module.exports = router;