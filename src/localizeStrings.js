import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    common: {
      cancel: 'Cancel',
      next: 'Next',
      submit: 'Submit',
      back: 'Back',

    },
    login: {
      tru_budget_description: 'A blockchain-based solution for budget expenditure',
      environment: 'Environment',
      test_env: 'Test',
      production_env: 'Prod',
      username: 'Username',
      password: 'Password',
      incorrect_username: 'Incorrect username',
      incorrect_password: 'Incorrect password',
      accenture_tag: 'Developed by Emerging Technologies & Innovation @ Accenture,'
    },
    project: {
      add_new_project: 'Add new project',
      project_name: 'Project Name',
      project_budget: 'Project Budget',
      project_comment: 'Project Comment',
      project_roles: 'Project Roles',
      project_title: 'Project title',
      project_title_description: 'Name of the project',
    },
    subproject: {
      subproject_title: 'Sub-Project title',
      subproject_title_description: 'Name of the sub-project',
    },
    workflow: {
      workflow_title: 'Workflow title',
      workflow_title_description: 'Name of the sub-project',
    },
    navigation: {
      unread_notifications: "Unread Notifications*",
      peers: "Peers*",
      connected_peers: "Connected Peers*",
      no_peers: "No peers*",
      logout: "Logout*",
      read_permission: "Read*",
      write_permission: "Write*",
      admin_permission: "Admin*",
      selections: "Selections*",
      options: "Options*",
      rtUpdates: "Real-Time Updates*",
      other_trustees: "Other Trustees*",
      menu_item_projects: "Projects*",
      menu_item_notifications: "Notifications*",
      menu_item_network: "Network*",
    }

  },
  it: {
    how: 'Come vuoi il tuo uovo oggi?',
    boiledEgg: 'Uovo sodo',
    softBoiledEgg: 'Uovo alla coque',
    choice: 'Come scegliere luovo'
  }
});

export default strings;
