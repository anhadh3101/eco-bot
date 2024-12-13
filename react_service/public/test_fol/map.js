let map, directionsService, directionsRenderer, placesService, userLocation, userMarker, infoWindow, bicyclingLayer;
let currentRadius = 5000;
let selectedTravelMode = 'DRIVING';
let selectedRecyclingCenter = null;

function initMap() {
  // Initialize the map centered at a default location (temporary until we get the user's location)
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.7749, lng: -122.4194 }, // Default location
    zoom: 12,
  });

  // Initialize directions and places services
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  placesService = new google.maps.places.PlacesService(map);

  // Create a single InfoWindow instance for recycling center markers
  infoWindow = new google.maps.InfoWindow();

  // Initialize the bicycling layer but don't add it to the map yet
  bicyclingLayer = new google.maps.BicyclingLayer();

  // Use Geolocation API to get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(userLocation);

      // Add a blue marker for the user's current location
      userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Blue marker icon
      });

      // Add an InfoWindow with "YOU ARE HERE" label at user's current location
      const userInfoWindow = new google.maps.InfoWindow({
        content: `<div style="font-weight: bold;">YOU ARE HERE</div>`
      });
      userInfoWindow.open(map, userMarker);

      // Fetch and display nearby recycling centers around the user's current location
      fetchRecyclingCenters(userLocation.lat, userLocation.lng);
    }, () => {
      alert("Geolocation failed. Displaying default location.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function fetchRecyclingCenters(lat, lng) {
  const request = {
    location: { lat: lat, lng: lng },
    radius: currentRadius,
    keyword: 'recycling'
  };

  placesService.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach(place => {
        createMarker(place);
      });
    } else {
      alert("Error fetching recycling centers: " + status);
    }
  });
}

function createMarker(place) {
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map,
    title: place.name
  });

  // Add click listener to show info and directions
  marker.addListener("click", () => {
    fetchPlaceDetails(place);
  });
}

function fetchPlaceDetails(place) {
  const request = {
    placeId: place.place_id,
    fields: ["name", "formatted_address", "photos", "geometry", "opening_hours", "formatted_phone_number", "website", "rating"]
  };

  placesService.getDetails(request, (placeResult, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Get the first photo (if available)
      const photoUrl = placeResult.photos && placeResult.photos.length > 0
        ? placeResult.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
        : null;

      // Get other details for the recycling center
      const openingHours = placeResult.opening_hours ? formatOpeningHours(placeResult.opening_hours.weekday_text) : "Not available";
      const phoneNumber = placeResult.formatted_phone_number ? placeResult.formatted_phone_number : "Not available";
      const website = placeResult.website ? `<a href="${placeResult.website}" target="_blank">Visit Website</a>` : "Not available";
      const rating = placeResult.rating ? placeResult.rating.toFixed(1) : "Not rated";

      // Save the selected recycling center
      selectedRecyclingCenter = {
        lat: placeResult.geometry.location.lat(),
        lng: placeResult.geometry.location.lng(),
        name: placeResult.name,
        address: placeResult.formatted_address,
        photoUrl,
        openingHours,
        phoneNumber,
        website,
        rating
      };

      // Show directions and estimated arrival time from user's current location
      updateRoute();
    } else {
      alert("Failed to retrieve place details: " + status);
    }
  });
}

function updateRoute() {
  if (!selectedRecyclingCenter) return;

  const request = {
    origin: { lat: userLocation.lat, lng: userLocation.lng },
    destination: { lat: selectedRecyclingCenter.lat, lng: selectedRecyclingCenter.lng },
    travelMode: google.maps.TravelMode[selectedTravelMode],
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);

      // Calculate estimated travel time
      const route = result.routes[0].legs[0];
      const travelTime = route.duration.text;

      // Set content for the single info window
      const infoWindowContent = `
        <h4>${selectedRecyclingCenter.name}</h4>
        <p>Address: ${selectedRecyclingCenter.address}</p>
        <p>Rating: ${selectedRecyclingCenter.rating}</p>
        <p>Phone: ${selectedRecyclingCenter.phoneNumber}</p>
        <p>Opening Hours: ${selectedRecyclingCenter.openingHours}</p>
        <p>Website: ${selectedRecyclingCenter.website}</p>
        <p>Estimated Travel Time (${selectedTravelMode.toLowerCase()}): ${travelTime}</p>
        ${selectedRecyclingCenter.photoUrl ? `<img src="${selectedRecyclingCenter.photoUrl}" alt="${selectedRecyclingCenter.name} photo" style="width:100%; max-width:300px;">` : ''}
      `;

      // Set the info window content and position, and open it
      infoWindow.setContent(infoWindowContent);
      infoWindow.setPosition({ lat: selectedRecyclingCenter.lat, lng: selectedRecyclingCenter.lng });
      infoWindow.open(map);
    } else {
      alert("Directions request failed due to " + status);
    }
  });
}

function formatOpeningHours(weekdayText) {
  return `<ul>${weekdayText.map(day => `<li>${day}</li>`).join('')}</ul>`;
}

// Function to search for a new location based on user input
function searchLocation() {
  const address = document.getElementById('locationInput').value;
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === google.maps.GeocoderStatus.OK) {
      const location = results[0].geometry.location;
      map.setCenter(location);
      fetchRecyclingCenters(location.lat(), location.lng());
    } else {
      alert("Geocode was not successful: " + status);
    }
  });
}

// Function to adjust the search radius for recycling centers
function adjustRadius() {
  const radius = parseInt(document.getElementById('radiusInput').value);
  if (radius && radius > 0) {
    currentRadius = radius;
    if (userLocation) {
      fetchRecyclingCenters(userLocation.lat, userLocation.lng);
    }
  } else {
    alert("Please enter a valid radius in meters.");
  }
}

// Function to update the travel mode and recalculate the route if necessary
function updateTravelMode() {
  selectedTravelMode = document.getElementById('travelMode').value;

  // Add bicycling layer if travel mode is "Bicycling", otherwise remove it
  if (selectedTravelMode === 'BICYCLING') {
    bicyclingLayer.setMap(map);
  } else {
    bicyclingLayer.setMap(null);
  }

  updateRoute(); // Automatically update the route
}

window.onload = initMap;