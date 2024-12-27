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

function showError(message) {
    const popup = document.getElementById('errorPopup');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    popup.classList.remove('hidden');
}

function closePopup() {
    document.getElementById('errorPopup').classList.add('hidden');
}

function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const statusContainer = document.getElementById('processingStatus');
    const progressBar = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');

    debugger; // This will pause execution here

    console.log('Starting CSV processing...', { fileName: file?.name });

    // Initialize status container
    statusContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = '#00A650'; // Reset to default color

    if (!file) {
        statusText.textContent = 'Please select a CSV file first!';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        debugger; // This will pause after file is read
        console.log('File read successfully');
        const csvData = event.target.result;
        const rows = csvData.split('\n').filter(row => row.trim());
        console.log('Total rows found:', rows.length);
        
        // Remove header row
        rows.shift();
        console.log('Processing rows after header:', rows.length);

        try {
            // Validate CSV format
            if (rows.length === 0) {
                console.log('Error: Empty CSV file');
                statusText.textContent = 'CSV file is empty. Please add some records.';
                return;
            }

            // Format all rows into the required structure
            console.log('Starting data formatting...');
            const requestData = rows.map((row, index) => {
                console.log(`Processing row ${index + 1}:`, row);
                const [listingId, weight] = row.split(',').map(item => item.trim());
                
                if (!listingId || !weight) {
                    console.log(`Invalid data in row ${index + 1}`, { listingId, weight });
                    statusText.textContent = `Invalid data in row ${index + 1}. Both listingId and weight are required.`;
                    return null;
                }

                if (isNaN(weight)) {
                    console.log(`Invalid weight in row ${index + 1}`, { weight });
                    statusText.textContent = `Invalid weight in row ${index + 1}. Weight must be a number.`;
                    return null;
                }

                return {
                    listingId: listingId,
                    deadWeightInKg: Number(parseFloat(weight).toFixed(3))
                };
            }).filter(item => item !== null);

            console.log('Formatted data:', requestData);

            if (requestData.length === 0) {
                console.log('No valid records found');
                statusText.textContent = 'No valid records found in CSV.';
                return;
            }

            // Show processing status
            statusText.textContent = 'Processing...';
            progressBar.style.width = '50%';

            console.log('Making API call with data:', requestData);
            debugger; // This will pause before making the API call
            const response = await fetch('https://shipmentgateway.prod.jumbotail.com/api/sku/listing/dead-weight/batch', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuaWtoaWwudmFua2F5YWxhQGp1bWJvdGFpbC5jb20iLCJST0xFUyI6WyJTRUxMRVJfSjI0X1JPTEUiLCJBTExfUkVTT1VSQ0VfREVYVEVSIiwiU0VMTEVSX1BSSUNFX1NUT0NLX1VQREFURSIsIlNFTExFUl9PUFNfUk9MRSIsIkdUTV9BUkVBX1NBTEVTX01BTkFHRVIiLCJESVNUUklCVVRPUiIsIlNFTExFUl9GQ19NQU5BR0VSIiwiU0VMTEVSX0FDQ09VTlRfRVhFQ1VUSVZFIiwiU0VMTEVSIiwiU0VMTEVSX0RJU1RfU0FMRVNfTUFOQUdFUiJdLCJpc3MiOiJKdW1ib3RhaWwiLCJpYXQiOjE3MzUzMDU1Mzd9.-dPAWc8S3urLyoZE1coLw2-0KEYYriE-TTGaRCmY5JM'
                },
                body: JSON.stringify(requestData)
            });

            debugger; // This will pause after API response
            console.log('API response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('API error:', errorData);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            progressBar.style.width = '100%';
            statusText.textContent = `Successfully processed ${requestData.length} records!`;

        } catch (error) {
            console.error('Error details:', error);
            showError(`API Error: ${error.message}`);
            progressBar.style.backgroundColor = '#ff4444';
            statusText.textContent = 'API call failed. Check popup for details.';
        }

        setTimeout(() => {
            statusContainer.classList.add('hidden');
            fileInput.value = '';
        }, 3000);
    };

    reader.onerror = function(error) {
        console.error('File reading error:', error);
        statusText.textContent = 'Error reading the CSV file. Please try again.';
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