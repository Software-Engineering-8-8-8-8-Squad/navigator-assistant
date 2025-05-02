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

