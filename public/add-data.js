// Handle Form Submission
document.getElementById('dataForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const emf = parseFloat(document.getElementById('emf').value);
    const mf = parseFloat(document.getElementById('mf').value) || null; // Optional field
    const rf = parseFloat(document.getElementById('rf').value) || null; // Optional field

    // Create new data object
    const newData = { lat: latitude, lng: longitude, emf, mf, rf };

    // Show confirmation dialog
    const confirmAdd = confirm('Do you want to add this data?');

    if (confirmAdd) {
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
                alert('Data added successfully!');
                console.log('New data added:', addedData);
                e.target.reset(); // Reset the form fields
            })
            .catch(error => {
                console.error('Error adding new data:', error);
                alert('Failed to add data. Please try again.');
            });
    } else {
        alert('Data addition cancelled.');
    }
});