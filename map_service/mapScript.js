// Load Leaflet Map with Mapbox for routing
function loadMap() {
    // Create map and set default view to user's current location if available
    const map = L.map('map').setView([51.505, -0.09], 13);
    let currentPolyline = null;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Use HTML5 geolocation to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userPos = [position.coords.latitude, position.coords.longitude];
                map.setView(userPos, 13);

                // Place a marker for user's location
                L.marker(userPos).addTo(map).bindPopup("You are here").openPopup();
                findRecyclingCenters(userPos, map);
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }

    // Add search control for recycling centers
    const searchControl = L.control({ position: 'topleft' });
    searchControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'search-container');
        div.innerHTML = `
            <input type="text" id="search-input" placeholder="Enter location to search recycling centers">
            <button id="search-button">Search</button>
        `;
        return div;
    };
    searchControl.addTo(map);

    document.getElementById('search-button').addEventListener('click', () => {
        const location = document.getElementById('search-input').value;
        if (location) {
            searchRecyclingCenters(location, map);
        }
    });

    // Function to handle geolocation errors
    function handleLocationError(browserHasGeolocation) {
        alert(
            browserHasGeolocation
                ? "Error: The Geolocation service failed."
                : "Error: Your browser doesn't support geolocation."
        );
    }

    // Function to search recycling centers using Nominatim and Overpass API
    function searchRecyclingCenters(location, map) {
        // Geocode the location using Nominatim
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    const searchPos = [parseFloat(lat), parseFloat(lon)];
                    map.setView(searchPos, 13);
                    findRecyclingCenters(searchPos, map);
                } else {
                    alert('Location not found. Please try another search term.');
                }
            })
            .catch((error) => {
                console.error("Error fetching location: ", error);
            });
    }

    // Function to find recycling centers nearby using Overpass API
    function findRecyclingCenters(userPos, map) {
        const query = `
            [out:json];
            node(around:10000, ${userPos[0]}, ${userPos[1]})[amenity=recycling];
            out;
        `;

        fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query))
            .then(response => response.json())
            .then(data => {
                data.elements.forEach((element) => {
                    const position = [element.lat, element.lon];
                    const marker = L.marker(position).addTo(map);

                    marker.on('click', () => {
                        // Remove the previous polyline if it exists
                        if (currentPolyline) {
                            map.removeLayer(currentPolyline);
                        }

                        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userPos[1]},${userPos[0]};${position[1]},${position[0]}?geometries=geojson&access_token=pk.eyJ1IjoiYWJlbHNlbm8zMCIsImEiOiJjbTI4NDZocTIxaHpkMmtwdWp3NnkyenhpIn0.f9IxYIqIQhJdKmnD8p11XA`;

                        fetch(routeUrl)
                            .then(response => response.json())
                            .then(routeData => {
                                const coords = routeData.routes[0].geometry.coordinates;
                                const latLngs = coords.map(coord => [coord[1], coord[0]]);
                                const color = 'blue';
                                currentPolyline = L.polyline(latLngs, { color: color }).addTo(map);
                                const duration = routeData.routes[0].duration;
                                const estimatedTime = Math.round(duration / 60); // Convert to minutes

                                // Get the full address using Nominatim reverse geocoding
                                const reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${element.lat}&lon=${element.lon}&format=json`;
                                fetch(reverseGeocodeUrl)
                                    .then(response => response.json())
                                    .then(addressData => {
                                        const fullAddress = addressData.display_name;

                                        // Use Mapbox Static Images API to get an image of the recycling center
                                        const staticImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${element.lon},${element.lat},15,0/300x200?access_token=pk.eyJ1IjoiYWJlbHNlbm8zMCIsImEiOiJjbTI4NDZocTIxaHpkMmtwdWp3NnkyenhpIn0.f9IxYIqIQhJdKmnD8p11XA`;

                                        marker.bindPopup(
                                            `<b>${element.tags.name || "Recycling Center"}</b><br>
                                             Estimated driving time: ${estimatedTime} minutes<br>
                                             Address: ${fullAddress}<br>
                                             <img src="${staticImageUrl}" alt="Image of the location" style="width: 100%; height: auto;">`
                                        ).openPopup();
                                    })
                                    .catch((error) => {
                                        console.error("Error fetching address: ", error);
                                    });
                            })
                            .catch((error) => {
                                console.error("Error fetching route: ", error);
                            });
                    });
                });
            })
            .catch((error) => {
                console.error("Error fetching recycling centers: ", error);
            });
    }
}
