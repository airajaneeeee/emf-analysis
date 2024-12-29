// Handle Search
const searchButton = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const searchResult = document.getElementById('searchResult');
const editForm = document.getElementById('editForm');
const editFormContainer = document.getElementById('editFormContainer');

searchButton.addEventListener('click', () => {
    const query = searchBar.value.trim();

    if (!query) {
        alert('Please enter a latitude or longitude to search.');
        return;
    }

    fetch('http://localhost:5000/api/data')
        .then(response => response.json())
        .then(data => {
            const results = data.filter(point =>
                point.lat.toString().includes(query) || point.lng.toString().includes(query)
            );

            searchResult.innerHTML = ''; // Clear previous results

            if (results.length === 0) {
                searchResult.innerHTML = '<p>No matching data found.</p>';
                return;
            }

            results.forEach(point => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('card', 'mb-3', 'p-3');
                resultDiv.innerHTML = `
                    <p>
                        <strong>Latitude:</strong> ${point.lat} <br>
                        <strong>Longitude:</strong> ${point.lng} <br>
                        <strong>EMF:</strong> ${point.emf} <br>
                        <strong>MF:</strong> ${point.mf || 'N/A'} <br>
                        <strong>RF:</strong> ${point.rf || 'N/A'} <br>
                        <button class="btn btn-warning editBtn" data-id="${point._id}">Edit</button>
                    </p>
                `;
                searchResult.appendChild(resultDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Error fetching data. Please try again.');
        });
});

// Handle Edit Button Clicks using Event Delegation
searchResult.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('editBtn')) {
        const id = e.target.dataset.id;
        console.log('Edit button clicked, Data ID:', id);

        fetch(`http://localhost:5000/api/data/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(point => {
                if (!point) {
                    alert('No data found for the selected ID.');
                    return;
                }

                // Populate the form fields
                document.getElementById('latitude').value = point.lat;
                document.getElementById('longitude').value = point.lng;
                document.getElementById('emf').value = point.emf;
                document.getElementById('mf').value = point.mf || '';
                document.getElementById('rf').value = point.rf || '';

                // Set the ID on the form and display it
                editForm.dataset.id = id;
                editFormContainer.style.display = 'block';
                editFormContainer.scrollIntoView({ behavior: 'smooth' });
                console.log('Form displayed successfully');
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch data. Please try again.');
            });
    }
});

// Handle Form Submission for Updating Data
editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = editForm.dataset.id;
    const updatedData = {
        lat: parseFloat(document.getElementById('latitude').value),
        lng: parseFloat(document.getElementById('longitude').value),
        emf: parseFloat(document.getElementById('emf').value),
        mf: parseFloat(document.getElementById('mf').value) || null,
        rf: parseFloat(document.getElementById('rf').value) || null,
    };

    fetch(`http://localhost:5000/api/data/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update data');
            }
            return response.json();
        })
        .then(updatedPoint => {
            alert('Data updated successfully!');
            console.log('Updated data:', updatedPoint);

            // Reload the page or update the UI
            window.location.reload();
        })
        .catch(error => {
            console.error('Error updating data:', error);
            alert('Failed to update data. Please try again.');
        });
});
