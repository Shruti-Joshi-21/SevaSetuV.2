// JavaScript Example: Reading Entities
// Filterable fields: user_email, full_name, user_role, phone, profile_image_url, face_data_urls, onboarding_completed, department, office_location, office_latitude, office_longitude, skills, emergency_contact, total_hours_contributed, tasks_completed, is_active, last_active
async function fetchUserProfileEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/UserProfile`, {
        headers: {
            'api_key': '6961daf2a4ca4eb290a6779bf283fa07', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: user_email, full_name, user_role, phone, profile_image_url, face_data_urls, onboarding_completed, department, office_location, office_latitude, office_longitude, skills, emergency_contact, total_hours_contributed, tasks_completed, is_active, last_active
async function updateUserProfileEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/UserProfile/${entityId}`, {
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