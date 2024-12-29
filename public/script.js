// Initialize the Map
const map = L.map('map-container').setView([17.6145, 121.723], 14);

// Add Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Initialize Heatmap Layer
const heat = L.heatLayer([], {
    radius: 25,
    blur: 15,
    gradient: {
        0.4: 'blue',
        0.65: 'yellow',
        1: 'red',
    },
}).addTo(map);

// Fetch Data from Backend and Populate Heatmap
fetch('http://localhost:5000/api/data')
    .then(response => response.json())
    .then(data => {
        // Transform data into the format expected by the heatmap layer
        const heatData = data.map(point => [point.lat, point.lng, point.emf / 100]);

        // Add data to the heatmap layer
        heat.setLatLngs(heatData);

        // Add Markers for Each Test Point
        data.forEach(point => {
            L.circleMarker([point.lat, point.lng], {
                color: point.emf > 80 ? 'red' : point.emf > 50 ? 'yellow' : 'blue',
                radius: 5,
            })
                .addTo(map)
                .bindPopup(`EMF: ${point.emf}, MF: ${point.mf || 'N/A'}, RF: ${point.rf || 'N/A'}`);
        });

        console.log('Heatmap and markers updated with fetched data.');
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Handle Form Submission
document.getElementById('dataForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const street = document.getElementById('street').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const emf = parseFloat(document.getElementById('emf').value);

    // Create new data object
    const newData = { street, lat: latitude, lng: longitude, emf, mf: null, rf: null };

    // Send the new data to the backend
    fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
    })
        .then(response => response.json())
        .then(addedData => {
            // Update the heatmap and markers with the new data
            heat.addLatLng([addedData.lat, addedData.lng, addedData.emf / 100]);

            L.circleMarker([addedData.lat, addedData.lng], {
                color: addedData.emf > 80 ? 'red' : addedData.emf > 50 ? 'yellow' : 'blue',
                radius: 5,
            })
                .addTo(map)
                .bindPopup(`Street: ${addedData.street}<br>EMF: ${addedData.emf}`);

            console.log('New data added to heatmap and markers:', addedData);
        })
        .catch(error => {
            console.error('Error adding new data:', error);
        });

    // Clear the form
    e.target.reset();
});