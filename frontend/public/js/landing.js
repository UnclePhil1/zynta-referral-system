document.addEventListener("DOMContentLoaded", () => {
    loadSampleUsers();
});

async function loadSampleUsers() {
    try {
        const response = await fetch('http://localhost:3000/api/sample-users');
        const users = await response.json();
        
        if (!response.ok) {
            throw new Error(users.error || 'Failed to load sample users');
        }

        renderSampleUsers(users);
    } catch (error) {
        console.error('Error loading sample users:', error);
        renderSampleUsers([
            {
                name: "Felix",
                points: 30,
                referralCode: "A1B2D2"
            },
            {
                name: "Ronald", 
                points: 40,
                referralCode: "D23F4G"
            },
            {
                name: "Alice",
                points: 0,
                referralCode: "A1B2C3"
            }
        ]);
    }
}

function renderSampleUsers(users) {
    const container = document.getElementById('sampleUsersGrid');
    
    // Sort by points descending and take top 3
    const topUsers = [...users]
        .sort((a, b) => b.points - a.points)
        .slice(0, 3);
    
    container.innerHTML = topUsers.map(user => `
        <div class="user-card">
            <div class="user-avatar">${user.name.charAt(0)}</div>
            <div class="user-info">
                <h3>${user.name}</h3>
                <p>Referrals: ${user.points / 10}</p>
                <p class="referral-code-small">Code: ${user.referralCode}</p>
            </div>
        </div>
    `).join('');
}