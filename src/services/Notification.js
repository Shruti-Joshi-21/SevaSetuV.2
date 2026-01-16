// JavaScript Example: Reading Entities
// Filterable fields: user_email, title, message, type, is_read, action_url, related_id
async function fetchNotificationEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/Notification`, {
        headers: {
            'api_key': '6961daf2a4ca4eb290a6779bf283fa07', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: user_email, title, message, type, is_read, action_url, related_id
async function updateNotificationEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/Notification/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': '6961daf2a4ca4eb290a6779bf283fa07', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}