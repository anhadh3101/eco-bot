let map, directionsService, directionsRenderer, placesService, userLocation, userMarker, infoWindow, bicyclingLayer, trafficLayer;
let currentRadius = 5000;
let selectedTravelMode = 'DRIVING';
let selectedRecyclingCenter = null;
let markers = [];
let currentFilter = "";

// Dark mode map styles (if desired)
const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#383838" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 12,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  placesService = new google.maps.places.PlacesService(map);

  infoWindow = new google.maps.InfoWindow();
  bicyclingLayer = new google.maps.BicyclingLayer();
  trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(userLocation);

      userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location",
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });

      const userInfoWindow = new google.maps.InfoWindow({
        content: `<div style="font-weight: bold;">YOU ARE HERE</div>`
      });
      userInfoWindow.open(map, userMarker);

      fetchRecyclingCenters(userLocation.lat, userLocation.lng);
    }, () => {
      alert("Geolocation failed. Displaying default location.");
      // still fetch with default location if needed
      fetchRecyclingCenters(37.7749, -122.4194);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
    fetchRecyclingCenters(37.7749, -122.4194);
  }

  applyTheme(); // Apply the current theme to the map
}

function fetchRecyclingCenters(lat, lng) {
  clearMarkers();

  const request = {
    location: { lat: lat, lng: lng },
    radius: currentRadius,
    keyword: 'recycling ' + currentFilter
  };

  placesService.nearbySearch(request, (results, status, pagination) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      processPlacesResults(results);
      if (pagination && pagination.hasNextPage) {
        setTimeout(() => {
          pagination.nextPage();
        }, 200);
      }
    } else {
      console.warn("Error fetching recycling centers: " + status);
    }
  });
}

function filterRecyclingCenters() {
  currentFilter = document.getElementById('centerType').value;
  clearMarkers();
  selectedRecyclingCenter = null;
  directionsRenderer.setMap(null);
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  infoWindow.close();

  if (userLocation) {
    map.setCenter(userLocation);
    fetchRecyclingCenters(userLocation.lat, userLocation.lng);
    trafficLayer.setMap(map);

    setTimeout(() => fitMapToMarkers(), 500);
  }
}

function processPlacesResults(results) {
  results.forEach(place => {
    createMarker(place);
  });
}

function createMarker(place) {
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map,
    title: place.name
  });

  markers.push(marker);

  marker.addListener("click", () => {
    trafficLayer.setMap(map);
    fetchPlaceDetails(place);
  });
}

function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

function fetchPlaceDetails(place) {
  const request = {
    placeId: place.place_id,
    fields: ["name", "formatted_address", "photos", "geometry", "opening_hours", "formatted_phone_number", "website", "rating"]
  };

  placesService.getDetails(request, (placeResult, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      const photoUrl = (placeResult.photos && placeResult.photos.length > 0)
        ? placeResult.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
        : null;

      const openingHours = placeResult.opening_hours ? formatOpeningHours(placeResult.opening_hours.weekday_text) : "Not available";
      const phoneNumber = placeResult.formatted_phone_number || "Not available";
      const website = placeResult.website ? `<a href="${placeResult.website}" target="_blank">Visit Website</a>` : "Not available";
      const rating = placeResult.rating ? placeResult.rating.toFixed(1) : "Not rated";

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

      updateRoute();
    } else {
      alert("Failed to retrieve place details: " + status);
    }
  });
}

function searchLocation() {
  const address = document.getElementById('locationInput').value;
  if (!address.trim()) {
    alert("Please enter a location.");
    return;
  }

  const geocoder = new google.maps.Geocoder();
  const placesRequest = {
    query: address,
    fields: ["geometry", "name", "formatted_address", "place_id"],
  };

  placesService.findPlaceFromQuery(placesRequest, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      const place = results[0];
      const location = place.geometry.location;
      map.setCenter(location);
      map.setZoom(14);
      fetchPlaceDetails(place); // Show details and route for that place
    } else {
      // Fallback to general geocoding
      geocoder.geocode({ address: address }, (geoResults, geoStatus) => {
        if (geoStatus === google.maps.GeocoderStatus.OK && geoResults.length > 0) {
          const location = geoResults[0].geometry.location;
          map.setCenter(location);
          map.setZoom(14);
          fetchRecyclingCenters(location.lat(), location.lng());
        } else {
          alert("Could not find any matching location or recycling center.");
        }
      });
    }
  });
}

function adjustRadius() {
  const radius = parseInt(document.getElementById('radiusInput').value);
  if (radius && radius > 0) {
    currentRadius = radius;
    selectedRecyclingCenter = null;
    directionsRenderer.setMap(null);
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    infoWindow.close();

    if (userLocation) {
      map.setCenter(userLocation);
      fetchRecyclingCenters(userLocation.lat, userLocation.lng);
      setTimeout(() => fitMapToMarkers(), 500);
    }
  } else {
    alert("Please enter a valid radius in meters.");
  }
}

function fitMapToMarkers() {
  if (markers.length === 0 && userLocation) {
    map.setCenter(userLocation);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  bounds.extend(userLocation);
  markers.forEach(marker => {
    bounds.extend(marker.getPosition());
  });
  map.fitBounds(bounds);
}

function formatOpeningHours(weekdayText) {
  return `<ul>${weekdayText.map(day => `<li>${day}</li>`).join('')}</ul>`;
}

function updateTravelMode() {
  selectedTravelMode = document.getElementById('travelMode').value;

  if (selectedTravelMode === 'BICYCLING') {
    bicyclingLayer.setMap(map);
  } else {
    bicyclingLayer.setMap(null);
  }

  updateRoute();
}

function updateRoute() {
  if (!selectedRecyclingCenter || !userLocation) return;

  directionsRenderer.setMap(map);

  const request = {
    origin: { lat: userLocation.lat, lng: userLocation.lng },
    destination: { lat: selectedRecyclingCenter.lat, lng: selectedRecyclingCenter.lng },
    travelMode: google.maps.TravelMode[selectedTravelMode],
    drivingOptions: {
      departureTime: new Date()
    }
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      trafficLayer.setMap(null);

      const route = result.routes[0].legs[0];
      const travelTime = route.duration_in_traffic ? route.duration_in_traffic.text : route.duration.text;

      const infoWindowContent = `
        <div style="
          background-color: var(--info-window-background);
          color: var(--info-window-text);
          border: 1px solid var(--info-window-border);
          border-radius: 8px;
          padding: 10px;
          max-width: 300px;
        ">
          <h4>${selectedRecyclingCenter.name}</h4>
          <p>Address: ${selectedRecyclingCenter.address}</p>
          <p>Rating: ${selectedRecyclingCenter.rating}</p>
          <p>Phone: ${selectedRecyclingCenter.phoneNumber}</p>
          <p>Opening Hours: ${selectedRecyclingCenter.openingHours}</p>
          <p>Website: ${selectedRecyclingCenter.website}</p>
          <p>Estimated Travel Time (${selectedTravelMode.toLowerCase()}): ${travelTime}</p>
          ${selectedRecyclingCenter.photoUrl ? `<img src="${selectedRecyclingCenter.photoUrl}" alt="${selectedRecyclingCenter.name} photo" style="width:100%; max-width:300px; border-radius: 8px;">` : ''}
        </div>
      `;

      infoWindow.setContent(infoWindowContent);
      infoWindow.setPosition({ lat: selectedRecyclingCenter.lat, lng: selectedRecyclingCenter.lng });
      infoWindow.open(map);
    } else {
      alert("Failed to calculate route: " + status);
    }
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem('theme', newTheme);
  applyTheme();
  if (selectedRecyclingCenter) {
    updateRoute();
  }
}

function applyTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  map.setOptions({
    styles: currentTheme === "dark" ? darkModeStyles : []
  });
}

// This will be called from mode.js after detecting initial theme or on page load if needed
window.onload = initMap;
