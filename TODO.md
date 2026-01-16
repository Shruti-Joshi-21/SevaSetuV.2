# Fix Role-Based Redirection

## Tasks
- [ ] Fix role parameter mapping in Home.jsx to match roleDashboardMap keys
- [ ] Update Login.jsx useEffects to store selected role in localStorage and redirect accordingly
- [ ] Ensure no hard-coded redirects and role context is preserved

## Information Gathered
- Home.jsx has role cards with login buttons that navigate to /login?role=roleParam
- roleParam is generated as role.toLowerCase().replace(' ', ''), causing mismatches (e.g., "administrator" vs "admin", "teamlead" vs "team lead")
- Login.jsx uses roleDashboardMap for redirection but relies on userProfile.user_role instead of selected role
- ProtectedRoute uses localStorage.getItem('userRole') for role checking
- Dummy authentication is used, so selected role should be stored and used for redirection

## Plan
1. In Home.jsx, create roleKeyMap to map display roles to correct keys and update handleLogin
2. In Login.jsx, modify useEffects to store selected role in localStorage and use it for redirection
3. Ensure redirection uses roleDashboardMap without hard-coding

## Dependent Files
- src/pages/Home.jsx
- src/pages/Login.jsx

## Followup Steps
- [x] Test login flow for each role to ensure correct redirection
- [x] Verify ProtectedRoute works with stored role
