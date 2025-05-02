# Navigator Assistant

## Features

- **Vehicle Selection**: Choose between car, bike, walking, or e-cargo bike
- **Visual Interface**: Attractive UI with icons and responsive design
- **Turn-by-turn Directions**: Detailed navigation instructions with distance
- **Route Summary**: Quick overview of total distance and duration
- **Elevation Data**: Shows elevation gain/loss for routes (when available)
- **Enhanced Geocoding**: Detailed location information including city, state, and location type
- **Error Handling**: User-friendly error messages with specific GraphHopper API error handling
- **API Rate Limit Protection**: Graceful handling of API limits

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository or create a new directory:
```bash
git clone https://github.com/Software-Engineering-8-8-8-8-Squad/navigator-assistant.git
cd navigator-assistant/web-app
```

2. Create the project structure as shown in the project files

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file with your GraphHopper API key:
```
PORT=3000
GRAPHHOPPER_API_KEY=your_api_key_here
```

## Project Structure

```
navigator-assistant/
├── server.js                 # Express server
├── package.json             # Node.js dependencies
├── .env                     # Environment variables
├── public/                  # Static files
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   └── main.js         # Frontend JavaScript
│   └── images/             # Images (optional)
├── views/                   # EJS templates
│   ├── index.ejs           # Main page
│   └── navigation.ejs      # Navigation results page
└── routes/                  # Express routes
    └── api.js              # API endpoints
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Select Vehicle Type**: Click on the car, bike, or walking icon
2. **Enter Locations**: Fill in your starting point and destination
3. **Start Navigation**: Click the "Start Navigation" button
4. **View Results**: See your route with turn-by-turn directions

## API Endpoints

- `POST /api/route`: Get route between two locations
  - Request body: `{ start: string, end: string, vehicle: string, options?: object }`
  - Returns: Route data with directions, distance, duration, elevation, and route details

- `POST /api/isochrone`: Get isochrone/isodistance from a location
  - Request body: `{ location: string, time_limit?: number, distance_limit?: number, vehicle?: string }`
  - Returns: Isochrone polygon data

- `GET /api/profiles`: Get available vehicle profiles
  - Returns: Array of available profiles with icons

## Technologies Used

- **Backend**: Node.js, Express
- **Templating**: EJS
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome
- **API**: GraphHopper Routing API

## Notes

- The application uses sessionStorage to pass data between pages
- GraphHopper API key should be kept secure in the `.env` file
- The free API has rate limits (500 requests/day), consider upgrading for production use
- Supports GraphHopper's standard vehicle profiles (car, bike, foot, ecargobike)
- Custom profiles can be added by following GraphHopper's documentation
- The API supports additional features like elevation data, route details, and isochrones

## Customization

### Adding Vehicle Types

To add more vehicle types, update:
1. `routes/api.js` - Add to available profiles
2. `views/index.ejs` - Add new vehicle button
3. `public/js/main.js` - Add icon mapping

### Styling

Modify `public/css/styles.css` to change:
- Colors (primary: #007bff)
- Fonts
- Layout
- Animations

## License

MIT License