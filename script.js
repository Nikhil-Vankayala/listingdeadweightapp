// Hardcoded user credentials (for demo purposes)
const users = [
    { userId: "nikhil.vankayala", password: "nikhil" }
];

function login() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    console.log('Login attempt:', { userId });

    const user = users.find(u => u.userId === userId && u.password === password);

    if (user) {
        console.log('Login successful');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('uploadSection').classList.remove('hidden');
    } else {
        console.log('Login failed');
        alert('Invalid credentials! Please use:\nUsername: nikhil.vankayala\nPassword: nikhil');
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

// Add this function to test API connectivity
async function testAPIConnection() {
    console.log('Testing API connection...');
    try {
        const response = await fetch('http://test.api.jumbotail.com:6666/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Origin': window.location.origin
            },
            mode: 'no-cors'
        });
        
        console.log('API Health Check Response:', response);
        return true; // If we get here, request was sent successfully
    } catch (error) {
        console.error('API Connection Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return false;
    }
}

// Add this function to update file name display
function updateFileDisplay(file) {
    const uploadArea = document.querySelector('.upload-area');
    const selectedFileDiv = document.getElementById('selectedFile');
    
    if (file) {
        selectedFileDiv.textContent = `Selected: ${file.name}`;
        uploadArea.classList.add('has-file');
    } else {
        selectedFileDiv.textContent = '';
        uploadArea.classList.remove('has-file');
    }
}

// Update file input change handler
document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    updateFileDisplay(file);
});

// Update drop handler
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    
    const file = e.dataTransfer.files[0];
    if (file.type === 'text/csv') {
        document.getElementById('csvFile').files = e.dataTransfer.files;
        updateFileDisplay(file);
    } else {
        alert('Please upload a CSV file!');
    }
});

// Fix the processing issue in processCSV function
async function processCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const statusContainer = document.getElementById('processingStatus');
    const progressBar = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');

    console.log('Starting CSV processing...', { fileName: file?.name });

    // Initialize status container
    statusContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = '#00A650';

    if (!file) {
        statusText.textContent = 'Please select a CSV file first!';
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            console.log('File read successfully');
            const csvData = event.target.result;
            const rows = csvData.split('\n').filter(row => row.trim());
            console.log('Total rows found:', rows.length);
            
            // Remove header row
            rows.shift();
            console.log('Processing rows after header:', rows.length);

            // Format all rows into the required structure
            const requestData = rows.map((row, index) => {
                const [listingId, weight] = row.split(',').map(item => item.trim());
                return {
                    listingId: listingId,
                    deadWeightInKg: Number(parseFloat(weight).toFixed(3))
                };
            });

            console.log('Making API call with data:', requestData);
            progressBar.style.width = '50%';

            const response = await fetch('http://test.api.jumbotail.com:6666/api/sku/listing/dead-weight/batch', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            progressBar.style.width = '100%';
            statusText.textContent = `Successfully processed ${requestData.length} records!`;
            
            // Clear file after successful processing
            fileInput.value = '';
            updateFileDisplay(null);

        } catch (error) {
            console.error('Error:', error);
            progressBar.style.backgroundColor = '#ff4444';
            statusText.textContent = error.message;
        }

        setTimeout(() => {
            statusContainer.classList.add('hidden');
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