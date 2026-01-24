console.log('=== ADMIN FRONTEND DEBUG ===');

// Check if logged in
const token = localStorage.getItem('admin_token');
const user = localStorage.getItem('admin_user');

console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
console.log('User:', user ? JSON.parse(user) : 'NOT FOUND');

if (!token) {
    console.error('❌ NOT LOGGED IN - Please login first at /login');
} else {
    console.log('✅ Token found, testing API...');

    // Test API call
    fetch('http://localhost:8080/api/games/GAME-001/content', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            console.log('Response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Word pairs count:', data.length);
            console.log('Data:', data);
        })
        .catch(err => {
            console.error('API Error:', err);
        });
}
