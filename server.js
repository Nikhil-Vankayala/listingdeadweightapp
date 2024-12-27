// On your API server (test.api.jumbotail.com:6666)
app.use((req, res, next) => {
    // Allow requests from any origin
    res.header('Access-Control-Allow-Origin', '*');
    
    // Allow specific methods
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
    
    // Allow specific headers
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
}); 