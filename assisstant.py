import requests
import urllib.parse
import json
import sys
import time
import os
from datetime import timedelta

# API configuration
GRAPHHOPPER_API_KEY = "cd1bb4ac-2bdb-4437-8d21-8ab1ea18b06c"
GEOCODE_URL = "https://graphhopper.com/api/1/geocode?"
ROUTE_URL = "https://graphhopper.com/api/1/route?"

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

def display_separator(char="=", length=70):
    """Display a separator line with specified character and length."""
    print(char * length)

def display_header(message, char="+", length=70):
    """Display a header with specified message, character, and length."""
    display_separator(char, length)
    print(message)
    display_separator(char, length)

def format_time(seconds):
    """Convert seconds to HH:MM:SS format."""
    return str(timedelta(seconds=seconds)).zfill(8)

def format_distance(meters):
    """Format distance in km and miles."""
    km = meters / 1000.0
    miles = km * 0.621371
    return f"{miles:.1f} miles / {km:.1f} km"
def geocode_location(location, key=GRAPHHOPPER_API_KEY):
    """
    Geocode a location to get its coordinates.
    
    Args:
        location (str): The location to geocode
        key (str): API key for GraphHopper
        
    Returns:
        tuple: (status_code, latitude, longitude, display_name) or (status_code, None, None, None)
    """
    if not location:
        return 0, None, None, None
    
    url = GEOCODE_URL + urllib.parse.urlencode({"q": location, "limit": "1", "key": key})
    
    try:
        response = requests.get(url)
        status_code = response.status_code
        
        if status_code == 200:
            json_data = response.json()
            
            # Save the json data to data folder for debugging/reference
            clean_name = location.replace(",", "_").replace(" ", "_")
            with open(f"data/geocode_{clean_name}.json", "w") as f:
                json.dump(json_data, f, indent=4)
            
            # Extract location information
            if json_data.get("hits") and len(json_data["hits"]) > 0:
                hit = json_data["hits"][0]
                lat = hit["point"]["lat"]
                lng = hit["point"]["lng"]
                display_name = hit.get("name", location)
                location_type = hit.get("osm_value", "")
                country = hit.get("country", "")
                
                # Build a more complete display name
                full_display_name = display_name
                if country:
                    full_display_name += f", {country}"
                
                print(f"Geocoding API URL for {full_display_name} (Location Type: {location_type})")
                print(url)
                
                return status_code, lat, lng, full_display_name
            else:
                print(f"No geocoding results found for {location}")
                return status_code, None, None, None
        else:
            print(f"Geocoding API error: Status code {status_code}")
            return status_code, None, None, None
    
    except Exception as e:
        print(f"Error during geocoding: {e}")
        return 0, None, None, None

