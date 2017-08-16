import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    common: {
      cancel: 'Cancel*',
      next: 'Next*',
      submit: 'Submit*',
      back: 'Back*',
      finish: 'Finish*',
      comment_description: 'Add some comments*',
      overview_card_budget: 'Budget*',
      overview_card_comment: 'Comment*',
      overview_card_created: 'Created*',
      overview_card_status: 'Status*',
      overview_card_organization: 'Assigned Organization*'
    },
    login: {
      tru_budget_description: 'A blockchain-based solution for budget expenditure*',
      environment: 'Environment*',
      test_env: 'Test*',
      production_env: 'Prod*',
      username: 'Username*',
      password: 'Password*',
      incorrect_username: 'Incorrect username*',
      incorrect_password: 'Incorrect password*',
      accenture_tag: 'Developed by Emerging Technologies & Innovation @ Accenture,*',
      login_button_title: 'Login*'
    },
    project: {
      add_new_project: 'Add new project*',
      project_name: 'Project Name*',
      project_budget: 'Project Budget*',
      project_comment: 'Project Comment*',
      project_roles: 'Project Roles*',
      project_title: 'Project title*',
      project_title_description: 'Name of the project*',
      project_budget_amount: 'Project budget amount*',
      project_budget_amount_description: 'Budget for the project*',
      project_currency: 'Currency*',
      project_comment: 'Project Comment*',
      project_budget_authority_role: 'Select budget authority role*',
      project_budget_authority_role_description: 'The authority enabled to modify the budget line of the project*',
      project_implementing_authority_role: 'Select implementation authority role*',
      project_implementing_authority_role_description: 'The authorities enabled to create and modify subprojects, define and execute workflow activities*',
      project_disbursement_authority_role: 'Select disbursement authority role*',
      project_disbursement_authority_role_description: 'The authorities enabled to approve financial transactions*',
      project_authority_organization_search: 'Search organizations*',

    },
    subproject: {
      subproject_title: 'Sub-Project title*',
      subproject_title_description: 'Name of the sub-project*',
      subproject_budget_amount: 'Subproject  budget amount*',
      subproject_budget_amount_description: 'Budget for the subproject*',
      subproject_comment: 'Subproject Comment*',
      subproject_assigned_organization: 'Assigned Organization*',
    },
    workflow: {
      workflow_title: 'Workflow title*',
      workflow_title_description: 'Name of the sub-project*',
      workflow_budget_amount: ' Workflow budget amount*',
      workflow_budget_amount_description: 'Budget amount for the workflow*',
      workflow_comment: 'Workflow Comment*',

    },
    navigation: {
      unread_notifications: 'Unread Notifications*',
      peers: 'Peers*',
      connected_peers: 'Connected Peers*',
      no_peers: 'No peers*',
      logout: 'Logout*',
      read_permission: 'Read*',
      write_permission: 'Write*',
      admin_permission: 'Admin*',
      selections: 'Selections*',
      options: 'Options*',
      rtUpdates: 'Real-Time Updates*',
      other_trustees: 'Other Trustees*',
      menu_item_projects: 'Projects*',
      menu_item_notifications: 'Notifications*',
      menu_item_network: 'Network*',
    }

  },
  it: {
    how: 'Come vuoi il tuo uovo oggi?*',
    boiledEgg: 'Uovo sodo*',
    softBoiledEgg: 'Uovo alla coque*',
    choice: 'Come scegliere luovo*'
  }
});

export default strings;
