# Navigator Assistant

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v14%2B-green.svg)
![npm](https://img.shields.io/badge/npm-v6%2B-orange.svg)

A comprehensive navigation solution with both web and Python interfaces, powered by GraphHopper routing API.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
  - [Web Application](#web-application)
  - [Python Application](#python-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- **Multiple Vehicle Options** - Car, bike, walking, or e-cargo bike routing
- **Interactive Interface** - Clean, intuitive UI with responsive design
- **Detailed Navigation** - Turn-by-turn directions with distances
- **Route Statistics** - Comprehensive overview of distance, duration, and elevation
- **Advanced Geocoding** - Detailed location data including city, state, and POI information
- **Robust Error Handling** - User-friendly messages with specific GraphHopper API error handling
- **Rate Limit Protection** - Graceful handling of API limits to prevent service disruption

## 🔧 Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **GraphHopper API Key**: Register at [GraphHopper](https://www.graphhopper.com/) to obtain your API key

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Software-Engineering-8-8-8-8-Squad/navigator-assistant.git
cd navigator-assistant
```

### 2. Set Up Environment Variables

Copy the example environment file and add your GraphHopper API key:

```bash
cp .example.env .env
```

Edit the `.env` file with your details:

```
PORT=3000
GRAPHHOPPER_API_KEY=your_api_key_here
```

## ⚙️ Configuration

### Web Application Setup

1. Navigate to the web application directory:

```bash
cd web-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start  # For production
# OR
npm run dev  # For development with auto-reload
```

4. Access the web interface at:

```
http://localhost:3000
```

### Python Application Setup

1. Navigate to the Python application directory:

```bash
cd python-app
```

2. Create and activate a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate on Linux/macOS
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

3. Install required packages:

```bash
pip install -r requirements.txt
```

## 🖥️ Usage

### Web Application

1. **Open the web interface** at `http://localhost:3000`
2. **Select your transportation mode** by clicking the appropriate icon
3. **Enter your starting point and destination** in the input fields
4. **Click "Start Navigation"** to generate your route
5. **View the results page** with your personalized navigation instructions

<p align="center">
  <img src="https://via.placeholder.com/600x300" alt="Web Interface" width="600">
</p>

### Python Application

The Python application provides additional functionality and can be used in several ways:

1. **Basic Usage:**

```bash
python main.py --start "New York, NY" --end "Boston, MA" --vehicle car
```

2. **Advanced Options:**

```bash
python main.py --start "Seattle, WA" --end "Portland, OR" --vehicle bike --elevation true --alternative-routes 3
```

3. **Interactive Mode:**

```bash
python main.py --interactive
```

4. **As a Module in Your Projects:**

```python
from navigator import RouteCalculator

# Initialize the calculator
calculator = RouteCalculator(api_key="your_api_key")

# Calculate a route
route = calculator.get_route(
    start="Chicago, IL",
    end="Milwaukee, WI",
    vehicle="car"
)

# Print the directions
for step in route.directions:
    print(f"{step.instruction} ({step.distance}m)")
```

## 📚 API Documentation

### Web Application Endpoints

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/route` | POST | Get route between two locations | `start`, `end`, `vehicle`, `options` |
| `/api/isochrone` | POST | Get isochrone/isodistance from a location | `location`, `time_limit`, `distance_limit`, `vehicle` |
| `/api/profiles` | GET | Get available vehicle profiles | None |

### Example API Request

```javascript
// Request a route
fetch('/api/route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    start: 'New York, NY',
    end: 'Philadelphia, PA',
    vehicle: 'car'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 📁 Project Structure

```
navigator-assistant/
├── web-app/                 # Web application
│   ├── server.js            # Express server
│   ├── package.json         # Node.js dependencies
│   ├── public/              # Static files
│   │   ├── css/             # Stylesheets
│   │   ├── js/              # Frontend JavaScript
│   │   └── images/          # Images and icons
│   ├── views/               # EJS templates
│   └── routes/              # Express routes
├── python-app/              # Python application
│   ├── main.py              # Main entry point
│   ├── navigator/           # Navigator module
│   │   ├── __init__.py
│   │   ├── calculator.py    # Route calculation logic
│   │   ├── models.py        # Data models
│   │   └── utils.py         # Utility functions
│   ├── tests/               # Test suite
│   └── requirements.txt     # Python dependencies
├── .env                     # Environment variables
├── .example.env             # Example environment file
├── README.md                # Documentation
└── LICENSE                  # MIT License
```

## 🎨 Customization

### Adding Vehicle Types

To add more vehicle profiles:

1. Update `routes/api.js` with new profile details:
```javascript
const PROFILES = {
  // ...existing profiles
  motorcycle: {
    name: "Motorcycle",
    icon: "motorcycle"
  }
};
```

2. Add the new vehicle button to `views/index.ejs`
3. Update the icon mapping in `public/js/main.js`

### Styling

Modify `public/css/styles.css` to customize:

- Color scheme (current primary: #007bff)
- Typography
- Layout and spacing
- Animations and transitions

## 🔍 Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure your `.env` file is in the correct location (project root)
   - Check that you've set the `GRAPHHOPPER_API_KEY` variable

2. **Cannot Connect to GraphHopper API**
   - Verify your internet connection
   - Check if you've exceeded your API rate limit
   - Ensure your API key is valid

3. **Node.js Application Not Starting**
   - Check if port 3000 is already in use
   - Verify you've installed all dependencies with `npm install`

### Getting Help

If you encounter issues not covered here, please:
- Submit an issue on our GitHub repository
- Check the GraphHopper API documentation for API-specific problems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the Navigator Assistant Team
</p>