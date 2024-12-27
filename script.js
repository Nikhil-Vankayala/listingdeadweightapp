// Hardcoded user credentials (for demo purposes)
const users = [
    { userId: "user1", password: "pass1" },
    { userId: "user2", password: "pass2" },
    { userId: "nikhil.vankayala", password: "nikhil" },
    { userId: "alok.singh", password: "alokji" }
];

function login() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.userId === userId && u.password === password);

    if (user) {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
    } else {
        alert('Invalid credentials!');
    }
}

function logout() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('userId').value = '';
    document.getElementById('password').value = '';
}

function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const csvData = event.target.result;
        const rows = csvData.split('\n').filter(row => row.trim());
        
        // Remove header row
        rows.shift();

        const statusContainer = document.getElementById('processingStatus');
        const progressBar = document.querySelector('.progress');
        const statusText = document.getElementById('statusText');
        
        statusContainer.classList.remove('hidden');

        try {
            // Format all rows into the required structure
            const requestData = rows.map(row => {
                const [listingId, weight] = row.split(',').map(item => item.trim());
                return {
                    listingId: listingId,
                    deadWeightInKg: Number(parseFloat(weight).toFixed(3))  // Ensure 3 decimal places
                };
            });

            // Make the API call with all records
            const response = await fetch('https://shipmentgateway.prod.jumbotail.com/api/sku/listing/dead-weight/batch', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuaWtoaWwudmFua2F5YWxhQGp1bWJvdGFpbC5jb20iLCJST0xFUyI6WyJTRUxMRVJfSjI0X1JPTEUiLCJBTExfUkVTT1VSQ0VfREVYVEVSIiwiU0VMTEVSX1BSSUNFX1NUT0NLX1VQREFURSIsIlNFTExFUl9PUFNfUk9MRSIsIkdUTV9BUkVBX1NBTEVTX01BTkFHRVIiLCJESVNUUklCVVRPUiIsIlNFTExFUl9GQ19NQU5BR0VSIiwiU0VMTEVSX0FDQ09VTlRfRVhFQ1VUSVZFIiwiU0VMTEVSIiwiU0VMTEVSX0RJU1RfU0FMRVNfTUFOQUdFUiJdLCJpc3MiOiJKdW1ib3RhaWwiLCJpYXQiOjE3MzUxODEzODd9.AwqgJDz1OT64GysGByEWj5BtPAQIVdpEM3J1idRO3ms'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            // Update progress bar to 100%
            progressBar.style.width = '100%';
            statusText.textContent = `Successfully processed ${requestData.length} records!`;

        } catch (error) {
            console.error('Error:', error);
            statusText.textContent = `Error: ${error.message}`;
            progressBar.style.backgroundColor = '#ff4444';
        }

        setTimeout(() => {
            statusContainer.classList.add('hidden');
            fileInput.value = '';
        }, 3000);
    };

    reader.readAsText(file);
}

// Add drag and drop functionality
const uploadArea = document.querySelector('.upload-area');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ff6b6b';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    
    const file = e.dataTransfer.files[0];
    if (file.type === 'text/csv') {
        document.getElementById('csvFile').files = e.dataTransfer.files;
    } else {
        alert('Please upload a CSV file!');
    }
}); 