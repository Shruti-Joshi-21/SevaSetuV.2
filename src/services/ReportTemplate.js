// JavaScript Example: Reading Entities
// Filterable fields: name, description, fields, is_active
async function fetchReportTemplateEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/ReportTemplate`, {
        headers: {
            'api_key': '6961daf2a4ca4eb290a6779bf283fa07', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: name, description, fields, is_active
async function updateReportTemplateEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/6967da1cb60f21632741c091/entities/ReportTemplate/${entityId}`, {
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