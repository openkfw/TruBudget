const ka = {
  format: {
    currencyPositon: "%v %s",
    numberFormat: {
      decimal: ",",
      thousand: ".",
      precision: 2
    },
    dateFormat: "DD/MM/YYYY",
    datePlaceholder: "dd/mm/yyyy",
    // numberRegex describes values with "," as decimal separator (matches e.g. 1000; 1.000; 1000,00; 1.000,00)
    numberRegex: /^-?([0-9]{1,3}.([0-9]{3}.)*[0-9]{3}|[0-9]+)(,[0-9]+)?$/
  },
  common: {
    action: "ქმედება",
    actions: "ქმედებები",
    add_tag_text: "დაამატე თაგი პროექტს",
    add: "დამატება",
    added: "დამატებულია",
    additional_data: "დამატებითი ინფორმაცია",
    amount: "რაოდენობა",
    approver: "Approver",
    assign: "assign",
    assigned_budget: "გამოყოფილი ბიუჯეტი",
    assigned: "Assigned",
    assignees: "Assignee(s)",
    back: "უკან დაბრუნება",
    bank: "ბანკი",
    budget_distribution: "ბიუჯეტის განაწილება",
    budget: "ბიუჯეტი",
    cancel: "გაუქმება",
    close: "დახურვა",
    closed: "დახურულია",
    comment_description: "კომენტარის დამატება",
    comment: "კომენტარი",
    completion: "დასრულება",
    confirm: "დადასტურება",
    create: "შექმნა",
    created: "შექმნილია",
    currency: "ვალუტა",
    disbursed_budget: "გადახდილი ღირებულება",
    disbursement: "დაგეგმილი გადახდები",
    disconnected: "offline",
    display_name: "სახელის ჩვენება",
    delete: "წაშლა",
    done: "შესრულებულია",
    download: "ჩამოტვირთვა",
    edit: "რედაქტირება",
    edited: "რედაქტირებულია",
    email: "Email",
    finish: "დასრულება",
    global: "გლობალური",
    grant: "მინიჭება",
    hash: "ჰაში",
    history_end: "Last event reached",
    history: "ისტორია",
    workflowitem_history: "Workflowitem ისტორია",
    subproject_history: "ქვეპროექტი ისტორია",
    project_history: "პროექტი ისტორია",
    id: "Id",
    in_progress: "მიმდინარეობს დამუშავება",
    in_review: "განხილვის პროცესშია",
    incorrect_password: "პაროლი არასწორია",
    incorrect_username: "მომხმარებლის სახელი არასწორია",
    incorrect_username_or_password: "არასწორი შესვლის პირადობა ან პაროლი",
    invalid_tag: "თაგი არასწორია",
    invalid_format: "არასწორი ფორმატი",
    link: "Ბმული",
    name: "სახელი",
    next: "შემდეგ",
    no_budget: "ბიუჯეტი ვერ მოიძებნა",
    no_budget_project: "თქვენი პროექტის ბიუჯეტის დასამატებლად გადადით მთავარ გვერდზე.",
    no_budget_subproject: "თქვენი ქვეპროექტისთვის ბიუჯეტის დასამატებლად გადადით უკან ქვეპროექტის მიმოხილვის გვერდზე.",
    no_budget_distribution: "ბიუჯეტის განაწილება შეუძლებელია თუ ყველა ელემენტი არ ჩანს",
    no_disabled_users: "დეაქტივირებული მომხმარებელი ვერ მოიძებნა",
    no_groups: "ჯგუფები არ მოიძებნა",
    no_groups_text: "შექმენით ახალი ჯგუფი plus ღილაკის დაჭერით.",
    no_history: "არანაირი მოვლენა",
    no_items_text: "თქვენ შეგიძლიათ შექმნათ პლიუსის ღილაკის დაჭერით.",
    no_documents: "დოკუმენტები არ მოიძებნა",
    no_documents_upload_text: "თქვენ შეგიძლიათ დაამატოთ ერთი ატვირთვის ღილაკზე დაჭერით",
    no_documents_info_text: "თქვენ შეგიძლიათ შეცვალოთ სამუშაო ნაკრები დოკუმენტების დასამატებლად",
    no_nodes: "დამატებითი კვანძების მოთხოვნა ვერ მოიძებნა",
    no_notifications: "შეტყობინებები ვერ მოიძებნა",
    no_organizations: "ახალი ორგანიზაციების მოთხოვნა ვერ მოიძებნა",
    no_permissions: "თქვენ არ გაქვთ ამ მოქმედების შესრულების ნებართვა",
    no_resources: "არცერთი ველი არ დაემატა ამ რესურსს",
    no_subprojects: "ქვეპროექტი ვერ მოიძებნა",
    no_users: "მომხმარებლები ვერ მოიძებნა",
    no_users_text: "დაამატეთ ახალი მომხმარებელი, ღილაკის დამატების ღილაკის დაჭერით.",
    no_workflow_items: "სამუშაო პროცესის ელემენტები ვერ მოიძებნა",
    not_assigned_budget: "ბიუჯეტი რომელიც განაწილებული არ არის",
    not_assigned: "არ არის გამოყოფილი",
    not_disbursed: "გადაუხდელი",
    not_ok: "Not OK",
    off: "გამორთული",
    on: "ჩართული",
    ok: "კარგი",
    not_projected: "არ არის დაგეგმილი",
    open: "Open",
    organization: "ორგანიზაცია",
    password: "პაროლი",
    permission: "ნებართვა",
    project: "პროექტი",
    projected_budget_exists: "დაგეგმილი ბიუჯეტი არსებობს",
    projected_budget: "დაგეგმიილ ბიუჯეტი",
    redacted: "Redacted",
    reset: "გადატვირთვა",
    revoke: "გაუქმება",
    reject: "Უარყოს",
    rejected: "უარყოფილი",
    search: "ძიება",
    show_permissions: "მაჩვენე ნებართვები",
    status: "სტატუსი",
    submit: "გაგზავნა",
    subproject: "ქვეპროექტი",
    subprojects: "ქვეპროექტები",
    switch_to_table: "ცხრილის ხედზე გადართვა",
    tag_already_exists: "თაგი უკვე არსებობს!",
    tag: "თაგი",
    task_status: "დავალების სტატუსი",
    thumbnail: "Thumbnail",
    total_budget: "მთლიანი ბიუჯეტი",
    type: "ტიპი",
    update: "განახლება",
    username: "მომხმარებლის სახელი",
    view: "ხილვა",
    view_project_details: "იხილეთ პროექტის დეტალები",
    workflowitem: "Workflowitem",
    dueDate: "თარიღით",
    dueDate_exceeded: "დასრულდა თარიღი",
    login_disabled: "შესვლის იდენტიფიკაცია გამორთულია",
    login_data_error: "შესვლა პირადობის ან პაროლის ველი ვერ იქნება ცარიელი",
    login_proxy_error: "API-სთან კავშირი ვერ დამყარდა! გთხოვთ, შეამოწმოთ პროქსის პარამეტრები!",
    login_api_error: "API მიუწვდომელია, გთხოვთ, დარწმუნდეთ, რომ ის მუშაობს!",
    refresh_assignments: "დავალებების განახლება",
    tags: "ტეგები",
    all: "ყველა",
    assignee: "დავალებული"
  },

  users: {
    account_name: "ანგარიშის სახელი",
    add_group: "ჯგუფის დამატება",
    add_user: "მომხმარებლის დამატება",
    change_password_for: "პაროლის შეცვლა {0}",
    current_user_password: "შენი პაროლი",
    edit_group: "ჯგუფის რედაქტირება",
    edit_permissions_for: "ნებართვის რედაქტირება",
    group_created: "ჯგუფი წარმატებით შექმნილია",
    groups: "ჯგუფები",
    invalid_password: "პაროლი არასწორია",
    new_group: "ახალი ჯგუფი",
    new_user_password_confirmation: "დაადასტურე ახალი პაროლი",
    new_user_password: "ახალი პაროლი",
    new_user: "ახალი მომხმარებელი",
    no_password_match: "პაროლები არ შეესაბამება ერთმანეთს",
    password_change_success: "პაროლი წარმატებით შეიცვალა",
    password_conditions_length: "მინიმუმ 8 სიმბოლოს უნდა შეიცავდეს",
    password_conditions_letter: "მინიმუმ ერთ ასოს უნდა შეიცავდეს",
    password_conditions_number: "მინიმუმ ერთ ციფრს უნდა შეიცავდეს",
    password_conditions_preface: "შენი პაროლი:",
    privacy_notice:
      "გთხოვთ, დარწმუნდეთ, რომ არ მოგაწვდით პერსონალურ ინფორმაციას. გაგზავნა ის დაჭერით თქვენი მონაცემები სამუდამოდ შეინახება და დაადასტურეთ კონფიდენციალურობის შესახებ შეტყობინების მიღების შესახებ.",
    type_current_password: "აკრიფეთ ახლანდელი პაროლი {0}",
    type_new_password: "აკრიფეთ ახალი პარული {0}",
    user_created: "მომხმარებელი წარმატებით შეიქმნა",
    username_invalid: "არასწორი პაროლი",
    users: "მომხმარებლები",
    selected_users: "შერჩეული მომხმარებლები",
    disabled_users: "დეაქტივირებული მომხმარებლები",
    disable_user: "მომხმარებლის გამორთვა",
    disable_userId: "მომხმარებლის გამორთვა {0}",
    disable_user_successfull: "შემდეგი მომხმარებელი გამორთულია: ",
    enable_user: "მომხმარებლის აღდგენა",
    enable_userId: "მომხმარებლის აღდგენა {0}",
    enable_userId_confirm: "ნამდვილად გსურთ ჩართოთ მომხმარებელი {0}?",
    enable_user_successfull: "შემდეგი მომხმარებელი ჩართულია: ",
    no_assignments: "დავალებები არ არის",
    assigned_projects: "მიცემული პროექტები",
    assigned_subprojects: "მინიჭებული ქვეპროექტები",
    assigned_workflowitems: "დაენიშნა სამუშაოები",
    assigned_message: "გამორთვამდე ეს მომხმარებელი უნდა დაეკისროს შემდეგ ელემენტებს",
    not_assigned_message:
      "ამ მომხმარებელს არ ენიჭება რაიმე პროექტი, ქვეპროექტი და სამუშაო წრე და შეიძლება გამორთული იყოს",
    hidden_assignments: "შემდგომი რედაქტირება {0}",
    account_name_error: "ანგარიშის სახელი არ შეიძლება იყოს ცარიელი",
    login_id_error: "შესვლის ID არ შეიძლება იყოს ცარიელი",
    password_error: "პაროლი არ შეიძლება იყოს ცარიელი",
    confirm_password_error: "დაადასტურეთ, რომ პაროლი არ შეიძლება იყოს ცარიელი",
    account_name_conditions_preface: "თქვენი ანგარიშის სახელი უნდა:",
    account_name_conditions_forbidden: "არ შეიცავს სპეციალურ სიმბოლოებს",
    account_name_conditions_solution: `ამის ნაცვლად გამოიყენეთ "-", "_" ან სივრცე`,
    account_name_conditions_length: "იყოს მინიმუმ 4 სიმბოლო",
    login_id_no_root: `შესვლის ID არ შეიძლება იყოს "root"`,
    login_id_conditions_preface: "თქვენი შესვლის ID უნდა:",
    login_id_conditions_length: "იყოს მინიმუმ 4 სიმბოლო",
    login_id_conditions_forbidden: "არ შეიცავს სივრცეებს ​​ან სპეციალურ სიმბოლოებს",
    login_id_conditions_solution: `ამის ნაცვლად გამოიყენეთ "-", "_" ან camelCase`
  },

  userProfile: {
    invalid_email_address: "ელექტრონული მისამართი"
  },

  nodesDashboard: {
    access: "წვდომა",
    additional_organization_node: "მოთხოვნები დამატებითი კვანძებისთვის",
    address: "მისამართი",
    approve: "დადასტურება",
    decline: "ვარდნა",
    network: "ქსელი",
    new_organization: "მოთხოვნები ახალი ორგანიზაციებისთვის",
    nodes: "Nodes",
    permissions: "ნებართვები",
    declined_by: "უარი თქვა",
    connection_status: "კავშირის სტატუსი",
    last_seen: "ბოლო ნახვა",
    admin_description:
      "ადმინისტრატორის კვანძი არის ქსელის საწყისი კვანძი და აქვს დამატებითი 'ჩემი' და 'ადმინისტრატორის' ნებართვები",
    add_organization: "დაამატეთ ახალი ორგანიზაცია",
    organization_error: "ორგანიზაცია არ შეიძლება იყოს ცარიელი",
    organization_node_error: "კვანძი არ შეიძლება იყოს ცარიელი",
    organization_node: "კვანძი"
  },

  login: {
    environment: "Environment",
    loading: "იტვირთება ...",
    login_button_title: "შესვლა",
    production_env: "Prod",
    test_env: "ტესტი",
    frontend_name: "TruBudget",
    frontend_description: "ბლოკჩეინზე დაფუძნებული ბიუჯეტის განკარგვის სისტემა",
    user_not_found: "Your user account has not been found. Please contact the administrator."
  },

  project: {
    add_new_project: "ახალი პროექტის დამატება",
    assignee: "მფლობელი",
    project_budget_amount: "პროექტის ბიუჯეტი",
    project_budget: "ბიუჯეტი",
    project_close_info: "მინიმუმ ერთი ქვეპროექტი არ არის დახურული.",
    project_comment: "კომენტარი",
    project_currency: "პროექტის ვალუტა",
    project_details: "დეტალები",
    project_edit_title: "პროექტის ცვლილება",
    project_name: "სახელი",

    project_roles: "ფუნქციები",
    project_thumbnail: "Thumbnail",
    project_title_description: "პროექტის სახელწოდება",
    project_title: "პროექტის სათაური",
    project_searchtext: "პროექტების ძებნა"
  },

  subproject: {
    assignee: "მფლობელი",
    fixed_workflowitem_type: "ფიქსირებული სამუშაო ნაკადის ტიპი",
    subproject_add_title: "ახალი ქვეპროექტის დამატება",
    subproject_assigned_organization: "Assigned organization",

    subproject_budget_amount: "ქვეპროექტისთვის გათვალისწინებული ბიუჯეტი",
    subproject_close_info: "workflowitem-ი დახურული არ არის",
    subproject_close_not_allowed: "თქვენ არ გაქვთ უფლებამოსილება დახუროთ ქვეპროექტი",
    subproject_comment: "ქვეპროექტის კომენტარი",
    subproject_completion_string: "{0} of {1} done",
    subproject_currency: "ქვეპროექტის ვალუტა",
    subproject_edit_title: "ქვეპროექტის რედაქტირება",

    subproject_preview: "Subproject preview",
    subproject_select_button: "არჩევა",
    subproject_title_description: "ქვეპროექტის სახელწოდება",
    subproject_title: "ქვეპროექტის სათაური",
    subproject_searchtext: "ქვეპროექტების ძებნა",
    subproject_any_workflowitem_type: "სამუშაო ფურცლების დაშვება ზოგადი ან შეზღუდული ტიპის არჩევისთვის",
    subproject_general_workflowitem_type: "დაუშვით მხოლოდ workflowitem ტიპის ზოგადი",
    subproject_restricted_workflowitem_type:
      "მხოლოდ ტიპის workflowitem- ის აკრძალვა შეზღუდულია. შეზღუდული workflowitem- ის მინიჭებისას, ნებართვები ავტომატურად გაიცემა და გაუქმდება. შემკვეთი მხოლოდ ნახვის ნებართვებს ინახავს.",
    workflowitem_assignee: "ნაგულისხმევი მიმღები",
    organization_info: "Organization",
    total_budget_info: "Total budget"
  },

  workflow: {
    add_item: "Workflowitem-ის შექმნა",
    add_tag_wfi_text: "ტეგის დამატება",
    approval_required: "აუცილებელია დადასტურება",
    assignee: "პასუხისმგებელი",
    search_text: "საძიებო ნივთები",
    edit_item: "Workflowitem-ის რედაქტირება",
    exit_sort_mode:
      "ეს ღილაკი ახლა გამორთულია. დალაგების რეჟიმიდან გამოდით სამუშაო პროცესის ახალი ელემენტების შესაქმნელად",
    exchange_rate: "გაცვლითი კურსი",
    workflow_budget_allocated: "გამოყოფილი",
    workflow_budget_disbursed: "გადახდილი",
    workflow_budget_na: "Not applicable",
    workflow_budget_status_allocated: "Assigned",
    workflow_budget_status_disbursed: "გადახდილი",
    workflow_budget_status_na: "N/A",
    workflow_budget: "ბიუჯეტის თანხა",
    workflow_comment: "Workflowitem-ის კომენტარი",
    workflow_disable_sort: "დამახსოვრება",
    workflow_document_changed: "შეცვლილია",
    workflow_document_description: "დოკუმენტის სახელწოდების დამატება",
    workflow_document_name: "დოკუმენტის სახელწოდება",
    workflow_document_not_available: "დოკუმენტი მიუწვდომელია",
    workflow_document_validate: "დამტკიცება",
    workflow_document_validated: "დამტკიცებულია",
    workflow_document_validation_not_ok: "განსხვავებული დოკუმენტი",
    workflow_document_validation_ok: "იდენტურია დოკუმენტი",
    workflow_documents: "დოკუმენტები",
    workflow_enable_sort: "Sort",
    workflow_fingerprint: "Fingerprint",
    workflow_name: "დასახელება",
    workflow_next_step: "შემდეგი ნაბიჯი",
    workflow_no_actions: "ქმედების განხორციელება არ არის საჭირო",
    workflow_no_documents: "არ შეიცავს დოკუმენტებს",
    workflow_none: "None",
    workflow_permissions_title: "Workflowitem-თან დაკავშირებით უფლებამოსილების მინიჭება",
    workflow_redacted: "Redacted",
    workflow_reject_reason: "უარყავი მიზეზი",
    workflow_selection: "{0} Workflowitem-ები არჩეულია",
    workflow_submit_for_review: "განსახილველად გადაგზავნა",
    workflow_table_title: "Workflowitem-ები",
    workflow_title_description: "Workflowitem-ის სახელწოდება",
    workflow_title: "Workflowitem-ის სათაური",
    workflow_type_transaction: "ტრანზაქცია",
    workflow_type_workflow: "Workflowitem-ი",
    workflow_type: "Type",
    workflow_upload_document: "ატვირთვა",
    workflowitem_details_documents: "დოკუმენტები",
    workflowitem_details_history: "ისტორია",
    workflowitem_details_overview: "მიმოხილვა",
    workflowitem_details: "Workflowitem-ის დეტალები",
    workflowitem_type_general: "ზოგადი ტიპის სამუშაო ნაწილის შექმნა.",
    workflowitem_type_restricted:
      "შეზღუდული სამუშაო ნაკადის გადაცემისას ნებართვები ავტომატურად გაიცემა და გაუქმებულია. დავალება მხოლოდ შეინარჩუნებს ხედის ნებართვას.",
    workflowitem_type: "Workflowitem ტიპი"
  },

  workflowTemplate: {
    monitoring: "მონიტორინგი/აღსრულება",
    tender: "ჯილდო",
    payments: "გადახდები"
  },

  snackbar: {
    update_succeed_message: "წარმატებით შეცვლილია {0}",
    creation_succeed_message: "წარმატებით შეიქმნა {0}",
    permissions_warning: "{0} - სთვის გამოყოფილი არ არის უფლებები"
  },

  searchBar: {
    quick_search: "სწრაფი ძებნა"
  },

  preview: {
    actions_done: "{0} from {1} actions done",
    assign_action_text: "assign {0}",
    grant_permission_action_text: "grant {0} to {1}",
    not_possible_action: "ქმედების შესრულება შეუძლებელია",
    possible_action: "შესაძლებელი ქმედებები",
    preview: "Preview",
    revoke_permission_action_text: "გააუქმეთ {0} {1}-ისგან",
    overwrite: "გადაწერა",
    overwrite_warning:
      "გაფრთხილება: ეს აღადგენს ყველა ნებართვას მიმდინარე არჩევანს. თუ გსურთ დაამატოთ ან წაშალოთ მხოლოდ ზოგიერთი ნებართვა, თქვენ უნდა გადახვიდეთ თითოეული სამუშაო ნაკადის ნებართვის დიალოგში."
  },

  confirmation: {
    assign_permissions: "მიანიჭეთ ნებართვები",
    additional_permissions_dialog_text:
      "Additional actions must be executed to ensure users are also able to view all required resources.",
    confirmation_required: "საჭიროა დადასტურება",
    execute_actions: "ქმედებების განხორციელება",
    failed_action_error:
      "Error: Grant {0} to {1} failed. All actions that would have been executed after the error occured including the original actions are cancelled.",
    grant_and_assign: "Grant & Assign",
    list_permissions_required_text: "Make sure you have required list Permissions for all resources involved",
    no_permission_warning: "თქვენ გჭირდებათ შემდეგი ნებართვები ყველა მოთხოვნილი მოქმედების შესასრულებლად:",
    no_permission_help: "შემდეგ მომხმარებლებს უფლება აქვთ მოგაწოდონ ნებართვები საჭირო რესურსებზე:",
    original_actions: "თქვენ მოითხოვეთ შემდეგი ქმედებები:",
    permissions_required: "აუცილებელია ნებართვა",
    permissions_text: `{0} ესაჭიროება დამატებითი ნებართვა რათა იხილოს {1} "{2}".`,
    post_actions_dialog_text: "შექმნის შემდეგ შესრულებულია შემდეგი მოქმედებები",
    project_close: "პროექტის დახურვა",
    project_close_text: "დარწმუნებული ხართ, გსურთ ამ პროექტის დახურვა?",
    subproject_close: "ქვეპროექტის დახურვა",
    subproject_close_text: "დარწმუნებული ხართ, გსურთ ამ ქვეპროექტის დახურვა?",
    user_group: "მომხმარებელი/ჯგუფი",
    workflowitem_close: "სამუშაო ნაკადის დახურვა",
    workflowitem_close_text: "დარწმუნებული ხართ, გინდა რომ დახურო ეს სამუშაო გრაფიკი?",
    workflowitem_create: "სამუშაო პროცესის შექმნა",
    workflowitem_close_reject: "უარი თქვით კომენტარით",
    workflowitem_close_accept: "მიღება"
  },

  intents: {
    assign: "მინიჭება",
    close: "დახურვა",
    createSubproject: "ქვეპროექტის შექმნა",
    createWorkflowitem: "Workflowitem-ის შექმნა",
    grantPermission: "უფლებამოსილების მინიჭება",
    listPermissions: "უფლებამოსილების ნახვა",
    reorderWorkflowitems: "Workflowitem-ების რიგითობის შეცვლა",
    revokePermission: "ნებართვის გაუქმება",
    update: "განახლება",
    viewDetails: "დეტალების ნახვა ",
    viewHistory: "ისტორიის ნახვა",
    list: "დასკვნის ნახვა"
  },

  analytics: {
    assigned_budget_ratio: "Assigned Budget Ratio",
    available_unspent_budget: "არსებული გაუხარჯავი ბიუჯეტი",
    converted_amount: "კონვერტირებული ოდენობა",
    disbursed_budget_ratio: "გადახდის პროცენტი (გადახდილი / გამოყოფილი)",
    insufficient_permissions_text:
      "One or more workflowitem are redacted. The analytics are hidden because they would be falsified.",
    project_analytics: "პროექტის ანალიტიკა",
    projected_budget_ratio: "Projected Budget Ratio",
    projected_budgets_distribution: "დაგეგმილი ბიუჯეტის განაწილება",
    subproject_analytics: "ქვეპროექტების ანალიტიკა",
    total_budget_distribution: "მთლიანი ბიუჯეტის განაწილება",
    total: "სულ:"
  },

  navigation: {
    admin_permission: "ადმინისტრატორი",
    backup: "სარეზერვო",
    connected_peers: "Peers connected",
    disconnected_peers: "No Peers connected",
    logout: "გამოსვლა",
    main_site: "მთავარი",
    menu_item_export: "ექსპორტირება",
    menu_item_network: "ქსელი",
    menu_item_notifications: "შეტყობინებები",
    menu_item_projects: "პროექტები",
    menu_item_users: "მომხმარებლები",
    no_peers: "No peers",
    options: "პარამეტრები",
    peers: "Peers",
    projects_site: "პროექტები",
    restore: "აღდგენა",
    rtUpdates: "რეალურ დროში განახლებები",
    selections: "შერჩევა",
    service_status: "მომსახურების სტატუსი",
    unread_notifications: "წაუკითხავი შეტყობინებები",
    write_permission: "Write"
  },

  notification: {
    next_page: "შემდეგი გვერდი",
    previous_page: "წინა გვერდი",
    rows_per_page: "სტრიქონები თითო გვერდზე",
    create_transaction: "ტრანზაქცია {0} შექმნილია ",
    create_workflow: "Workflowitem-ი {0} შექმნილია",
    done_transaction: " ტრანზაქციის {0} სტატუსი შეიცვალა და დასრულებულია",
    done_workflow: "Workflowitem-ის {0} სტატუსი შეიცვალა და დასრულებულია",
    edit_transaction: "ტრანზაქცია {0} რედაქტირებულია",
    edit_workflow: "Workflowitem-ი {0} რედაქტირებულია",
    email_saved: "Email {0} შენახული",
    no_permissions: "(დამატებითი დეტალების სანახავად არ ფლობთ ნებართვას)",
    notification_subtitle: "არ არის წაკითხული",
    notification_table_all_read: "ყველა წაკითხულია",
    notification_table_by: "By",
    notification_table_description: "აღწერილობა",
    notification_table_project: "პროექტი",
    notification_table_role: "როლი",
    notification_table_subproject: "ქვეპროექტი",
    notification_table_view: "ხილვა",
    notification_title: "შეტყობინებები",
    project_assign: "Project {0} was assigned to you",
    project_assigned: "Project {0} was assigned to you",
    project_close: "Project {0} was closed",
    project_closed: "Project {0} was closed",
    project_createSubproject: "პროექტისთვის {0} შეიქმნა ახალი ქვეპროექტი ",
    project_intent_grantPermission: "პროექტის {0} ნებართვები შეცვლილია",
    project_intent_revokePermission: "პროექტის {0} ნებართვები შეცვლილია",
    project_projected_budget_deleted: "პროექტის {0} ბიუჯეტი წაშლილია",
    project_projected_budget_updated: "პროექტის {0} ბიუჯეტი განახლებულია",
    project_update: "პროექტი {0} განახლებულია",
    project_updated: "პროექტი {0} განახლებულია",
    read_all: "წაიკითხეთ ყველა",
    review_transaction: "ტრანზაქცია {0} გადმოგეგზავნათ განსახილველად",
    review_workflow: "Workflowitem-ი {0} გადმოგეგზავნათ განსახილველად",
    save_email_error: "Email შენახვა ვერ მოხერხდა",
    subproject_assign: "ქვეპროექტი {0} გადმოგეგზავნათ განსახილველად",
    subproject_assigned: "ქვეპროექტი {0} გადმოგეგზავნათ განსახილველად",
    subproject_close: "ქვეპროექტი {0} დაიხურა",
    subproject_closed: "ქვეპროექტი {0} დაიხურა",
    subproject_createWorkflowitem: "ქვეპროექტისთვის {0} ახალი workflowitem-ი შეიქმნა",
    subproject_intent_grantPermission: "ქვეპროექტისთვის {0} ნებართვები შეიცვალა",
    subproject_intent_revokePermission: "ქვეპროექტისთვის {0} ნებართვები შეიცვალა",
    subproject_projected_budget_deleted: "ქვეპროექტისთის {0} დაგეგმილი ბიუჯეტი წაშლილია",
    subproject_projected_budget_updated: "ქვეპროექტისთის {0} დაგეგმილი ბიუჯეტი განახლებულია",
    subproject_reorderWorkflowitems: "ქვეპროექტის {0} workflowitem-ების რიგითობა შეცვლილია",
    subproject_update: "ქვეპროექტი {0} განახლებულია",
    subproject_updated: "ქვეპროექტი {0} განახლებულია",
    workflowitem_assign: "Workflowitem-ი {0} გადმოგეგზავნათ განსახილველად",
    workflowitem_assigned: "Workflowitem-ი {0} გადმოგეგზავნათ განსახილველად",
    workflowitem_close: "Workflowitem-ი {0} დახურულია",
    workflowitem_closed: "Workflowitem-ი {0} დახურულია",
    workflowitem_intent_grantPermission: "Workflowitem-ის {0} ნებართები შეცვლილია",
    workflowitem_intent_revokePermission: "Workflowitem-ის {0} ნებართები შეცვლილია",
    workflowitem_update: "Workflowitem-ი {0} განახლებულია",
    workflowitem_updated: "Workflowitem-ი {0} განახლებულია",
    payload_error_message:
      "უი! ... ეს არ არის თქვენი ბრალი - მოხდა კლიენტის მხრიდან ვალიდაციის შეცდომა. გთხოვთ, აცნობოთ ადმინისტრატორს."
  },

  history: {
    edit_currency: "Workflowitem-ის {0} ვალუტა შეიცვალა და გახდა {1} ",
    edit_documents: "Workflowitem-ისთვის {0} შეიცვალა დოკუმენტები ",
    edit_status: "Workflowitem-ის {0} სტატუსი შეიცვალა და გახდა {1}",
    edit_subproject: "თანხა გაიზარდა {0}-დან {1}-მდე",
    edit_workflowName: "Workflowitem-ის {0} სახელწოდება შეიცვალა და გახდა {1} ",
    end_date: "დასრულების თარიღი",
    event_type: "ღონისძიების ტიპი",
    first_sort: "გადავიდა პირველ {0} პოზიციაზე",
    project_assign: "{0} განსახილველად გადაუგზავნა {2}-ს პროექტი {1}",
    project_close: "{0} დახურა პროექტი {1}",
    project_create: "{0} შექმნა პროექტი {1}",
    project_createSubproject: "{0} შექმნა ქვეპროექტი {1}",
    project_grantPermission_details: "{0} მიანიჭა {2}-სა და {3}-ს ნებართვა {1}",
    project_grantPermission: "{0} მიანიჭა {2}-ს ნებართვა {1}",
    project_projected_budget_deleted: "{0} deleted the projected budget of {1}",
    project_projected_budget_updated: "{0} updated the projected budget of {1}",
    project_revokePermission_details: "{0} გაუუქმა {2}-სა და {3}-ს ნებართვა {1}",
    project_revokePermission: "{0} გააუქმა {2}-ზე გაცემული ნებართვა {1}",
    project_update: "{0} შეცვალა პროექტი {1} ",
    publisher: "გამომცემელი",
    sort: "Moved {0} after {1}",
    start_date: "დაწყების თარიღი",
    subproject_assign: "{0} ქვეპროექტი {1} {2}-ს განსახილველად გადაუგზავნა",
    subproject_close: "{0} დახურა ქვეპროექტი {1}",
    subproject_create: "{0} შექმნა ქვეპროექტი {1}",
    subproject_createWorkflowitem: "{0} შექმნა workflowitem-ი {1}",
    subproject_grantPermission_details: "{0} მიანიჭა ნებართვა {1} {2}-სა და {3}-ს",
    subproject_grantPermission: "{0} მიანიჭა ნებართვა {1} {2}-ს",
    subproject_reorderWorkflowitems: "{0} changed the workflowitem ordering from {1}",
    subproject_revokePermission_details: "{0} გაუუქმა {2}-სა და {3}-ს ნებართვა {1}",
    subproject_revokePermission: "{0} გააუქმა {2}-ს ნებართვა {1} ",
    subproject_update: "{0} შეცვალა ქვეპროექტი {1} ",
    to: "{0} to {1}",
    workflowitem_assign: "{0} მიანიჭა {2}-ს workflowitem-ი {1}",
    workflowitem_close: "{0} დახურა workflowitem-ი {1}",
    workflowitem_grantPermission_details: "{0} მიანიჭა {2}-სა და {3}-ს ნებართვა {1}",
    workflowitem_grantPermission: "{0} მიანიჭა {2}-ს ნებართვა {1}",
    workflowitem_revokePermission_details: "{0} გაუუქმა {2}-სა და {3}-ს ნებართვა {1}",
    workflowitem_revokePermission: "{0} გაუუქმა {2}-ს ნებართვა {1}",
    workflowitem_update_docs: "{0} დაამატა დოკუმენტები workflowitem-ს {1} ",
    workflowitem_delete_docs: "{0} წაშლილი დოკუმენტები სამუშაო პროცესიდან {1}",
    workflowitem_update: "{0} შეცვალა workflowitem-ი {1} ",
    workflowitem_update_amount: "{0} შეცვალა workflowitem-ი {1} ბიუჯეტი წელს {2}",
    workflowitem_document_validated: "{0} დადასტურებულია workflowitem სისტემაში მითითებული დოკუმენტ {1} ი {2} ",
    workflowitem_document_invalidated:
      "{0} გამოყენებული სამუშაო ნაკადის ერთეული დოკუმენტი, რომელსაც სხვადასხვა დოკუმენტი აქვს დასახელებული {1} ი {2} "
  },

  permissions: {
    admin: "ადმინისტრატორის უფლებამოსილებები",
    dialog_title: "{0}-თვის ნებართვების მინიჭება",
    global_createGroup: "შექმენით ჯგუფები",
    global_createProject: "შექმენით პროექტები",
    global_createUser: "შექმენით მომხმარებლები",
    global_disableUser: "გამორთეთ მომხმარებლები",
    global_enableUser: "ჩართეთ მომხმარებლები",
    global_grantPermission: "მიანიჭეთ გენერალური ნებართვა სხვებს",
    global_listPermissions: "გენერალური ნებართვების ჩამონათვალი",
    global_revokePermission: "გენერალური ნებართვების სხვებისთვის გაუქმება",
    network_list: "დაკავშირებული node-ების ჩამონათვალი",
    network_voteForPermission: "მიეცით ხმა თუ გსურთ რომ node შეუერთდეს ქსელს",
    project_assign: "გადაუგზავნეთ პროექტი სხვებს განსახილველად",
    project_close: " დახურეთ პროექტი",
    project_createSubproject: "დახურეთ ქვეპროექტი",
    project_intent_grantPermission: "მიანიჭეთ ნებართვა",
    project_intent_listPermissions: " იხილეთ ნებართვები",
    project_intent_revokePermission: " გააუქმეთ ნებართვა",
    project_update: "განაახლეთ პროექტი",
    project_viewDetails: "იხილეთ პროექტის დეტალები",
    project_list: "იხილეთ პროექტის მიმოხილვა",
    read_only: "მხოლოდ წაკითხვის ნებართვა",
    subproject_assign: "გადაუგზავნეთ ქვეპროექტი სხვებს განსახილველად",
    subproject_close: "დახურეთ ქვეპროექტი",
    subproject_createWorkflowitem: "შექმენით workflowitem-ები",
    subproject_intent_grantPermission: "მიანიჭეთ workflowitem-ების ნებართვები",
    subproject_intent_listPermissions: "იხილეთ ქვეპროექტების ნებართვები",
    subproject_intent_revokePermission: "გააუქმეთ ქვეპროექტების ნებართვები",
    subproject_reorderWorkflowitems: "გადააჯგუფეთ workflowitem-ები",
    subproject_update: "განაახლეთ ქვეპროექტი",
    subproject_viewDetails: "იხილეთ ქვეპროექტის დეტალები",
    subproject_list: "იხილეთ ქვეპროექტის მიმოხილვა",
    view: "View permissions",
    workflowitem_assign: "გადაუგზავნეთ სხვებს workflowitem-ი განსახილველად",
    workflowitem_close: "დახურეთ workflowitem-ი",
    workflowitem_intent_grantPermission: "მიანიჭეთ workflowitem-ის ნებართვები",
    workflowitem_intent_listPermissions: "იხილეთ workflowitem-ის ნებართვები",
    workflowitem_intent_revokePermission: "გააუქმეთ workflowitem-ის ნებართვები",
    workflowitem_update: "განაახლეთ workflowitem-ები",
    workflowitem_view: "იხილეთ workflowitem-ები",
    write: "გაეცით ნებართვები"
  },

  eventTypes: {
    project_created: "პროექტი შეიქმნა",
    project_updated: "პროექტი განახლებულია",
    project_assigned: "პროექტი დაინიშნა",
    project_closed: "პროექტი დახურულია",
    project_permission_granted: "პროექტის ნებართვა გაიცემა",
    project_permission_revoked: "გაუქმდა პროექტის ნებართვა",
    project_projected_budget_updated: "განახლდა პროექტის ბიუჯეტი",
    project_projected_budget_deleted: "პროექტის ბიუჯეტი დახურულია",

    subproject_created: "შეიქმნა ქვეპროექტი",
    subproject_updated: "განახლებულია ქვეპროექტი",
    subproject_assigned: "ქვეპროექტი დაინიშნა",
    subproject_closed: "ქვეპროექტი დახურულია",
    subproject_permission_granted: "ნებადართულია ქვეპროექტის ნებართვა",
    subproject_permission_revoked: "გაუქმდა დაპროექტების ნებართვა",
    subproject_projected_budget_updated: "პროექტის ბიუჯეტი განახლებულია",
    subproject_projected_budget_deleted: "დაიხურა პროექტის ბიუჯეტი",

    workflowitem_created: "შეიქმნა სამუშაო ნაკადის ელემენტი",
    workflowitem_document_validated: "Workflowitem დოკუმენტი დადასტურებულია",
    workflowitem_updated: "Workflowitem განახლებულია",
    workflowitem_assigned: "სამუშაო გრაფიკი დაევალა",
    workflowitem_closed: "Workflowitem დახურულია",
    workflowitem_permission_granted: "მიენიჭა workflowitem ნებართვა",
    workflowitem_permission_revoked: "სამუშაო პროცესის ნებართვა გაუქმებულია",
    workflowitems_reordered: "Workflowitems გადაკეთდა"
  },

  status: {
    average: "საშუალო",
    connection: "კავშირი",
    fast: "სწრაფი",
    no_ping_available: "პინგი არ არის ხელმისაწვდომი",
    not_connected: "არ არის დაკავშირებული",
    ping: "პინგ",
    service: "მომსახურება",
    slow: "ნელი",
    version: "ვერსია",
    very_slow: "ძალიან ნელი",
    error: "შეცდომა",
    warning: "გაფრთხილება",
    done: "შესრულებულია",
    toBeDone: "უნდა გაკეთდეს"
  },

  language: {
    english: "ინგლისური",
    french: "ფრანგული",
    german: "გერმანული",
    portuguese: "პორტუგალიური",
    georgian: "ქართული ენა"
  }
};

export default ka;
