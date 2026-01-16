export const base44 = {
  auth: {
    me: async () => ({ email: 'volunteer@example.com', full_name: 'John Doe' }),
    login: async (email, password) => {
      // Mock login - always succeeds
      return { email, full_name: 'John Doe' };
    },
    logout: () => {},
  },
  entities: {
    UserProfile: {
      filter: async ({ user_email }) => [{
        id: 1,
        user_email: user_email || 'volunteer@example.com',
        user_role: 'volunteer',
        total_hours_contributed: 25,
        tasks_completed: 5
      }],
      list: async () => [{
        id: 1,
        user_email: 'volunteer@example.com',
        user_role: 'volunteer',
        total_hours_contributed: 25,
        tasks_completed: 5
      }],
    },
    Task: {
      filter: async ({ status }) => [
        {
          id: 1,
          title: 'Tree Planting Drive',
          description: 'Plant 100 trees in the local park',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_volunteers: ['volunteer@example.com'],
          location: 'Central Park'
        },
        {
          id: 2,
          title: 'Beach Cleanup',
          description: 'Clean up plastic waste from the beach',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_volunteers: ['volunteer@example.com'],
          location: 'Sunny Beach'
        }
      ],
      list: async () => [],
    },
    AttendanceRecord: {
      filter: async ({ user_email }) => [
        {
          id: 1,
          user_email: user_email || 'volunteer@example.com',
          check_in_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'present',
          face_match_confidence: 95.5
        },
        {
          id: 2,
          user_email: user_email || 'volunteer@example.com',
          check_in_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'present',
          face_match_confidence: 98.2
        }
      ],
      list: async () => [],
    },
    LeaveRequest: {
      filter: async () => [],
      list: async () => [],
    },
    FieldReport: {
      filter: async () => [],
      list: async () => [],
    },
    ReportTemplate: {
      filter: async () => [],
      list: async () => [],
    },
    Notification: {
      filter: async () => [],
      list: async () => [],
    },
    AuditLog: {
      filter: async () => [],
      list: async () => [],
    },
  },
};
