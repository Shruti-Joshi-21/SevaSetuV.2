// JavaScript Example: Reading Entities
// Filterable fields: user_email, user_name, user_role, task_id, task_name, check_in_time, check_out_time, latitude, longitude, address, face_image_url, face_match_confidence, location_accuracy, distance_from_task, status, rejection_reason, approved_by, verification_flags, device_info
async function fetchAttendanceRecordEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/AttendanceRecord`, {
        headers: {
            'api_key': '6961daf2a4ca4eb290a6779bf283fa07', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: user_email, user_name, user_role, task_id, task_name, check_in_time, check_out_time, latitude, longitude, address, face_image_url, face_match_confidence, location_accuracy, distance_from_task, status, rejection_reason, approved_by, verification_flags, device_info
async function updateAttendanceRecordEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/AttendanceRecord/${entityId}`, {
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