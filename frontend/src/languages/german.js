const de = {
  format: {
    currencyPositon: "%v %s",
    numberFormat: {
      decimal: ",",
      thousand: ".",
      precision: 2
    },
    dateFormat: "DD/MM/YYYY",
    datePlaceholder: "dd/mm/yyyy",
    // numberRegex describes values with "," as decimal separator (matches e.g. 1000; 1.000; 1000,00; 1.000,00)    numberRegex: /^([0-9]{1,3}.([0-9]{3}.)*[0-9]{3}|[0-9]+)(,[0-9]+)?$/
    numberRegex: /^([0-9]{1,3}.([0-9]{3}.)*[0-9]{3}|[0-9]+)(,[0-9]+)?$/
  },
  common: {
    action: "Action",
    actions: "Actions",
    add: "Hinzufügen",
    added: "Hinzugefügt",
    additional_data: "Zusätzliche Daten",
    amount: "Betrag",
    approver: "Genehmiger",
    assign: "Zuweisen",
    assigned: "Zugewiesen",
    assigned_budget: "Zugewiesenes Budget",
    assignees: "Verantwortliche",
    back: "Zurück",
    bank: "Bank",
    budget: "Budget",
    budget_distribution: "Budget Verteilung",
    no_budget_distribution: "Verteilung kann nicht angezeigt werden, da nicht alle Elemente sichtbar sind",
    no_disabled_users: "Keine deaktivierten Benutzer gefunden",
    cancel: "Abbrechen",
    close: "Schließen",
    closed: "Geschlossen",
    comment: "Kommentar",
    comment_description: "Schreibe Kommentare",
    completion: "Fertigstellung",
    confirm: "Bestätigen",
    create: "Erstellen",
    created: "Erstellt",
    currency: "Währung",
    disbursed_budget: "Ausgezahltes Budget",
    disbursement: "Auszahlung",
    disconnected: "Offline",
    display_name: "Anzeige-Name",
    done: "Fertig",
    download: "Download",
    edit: "Ändern",
    edited: "Geändert",
    email: "E-Mail",
    finish: "Fertig",
    global: "Global",
    grant: "Erteilen",
    hash: "Hash",
    history: "Historie",
    workflowitem_history: "Workflowitem Historie",
    subproject_history: "Subprojekt Historie",
    project_history: "Projekt Historie",
    in_progress: "In Arbeit",
    in_review: "In Review",
    incorrect_password: "Falsches Passwort",
    incorrect_username: "Unbekannte Login-ID",
    incorrect_username_or_password: "Ungültige Login-ID oder falsches Passwort",
    next: "Weiter",
    no_budget: "Kein Budget gefunden",
    no_budget_project: "Um ein Budget für Ihr Projekt hinzuzufügen, gehen Sie zurück zur Hauptseite.",
    no_budget_subproject:
      "Um ein Budget für Ihr Subprojekt hinzuzufügen, gehen Sie zurück zur Übersichtsseite Ihrer Subprojekte.",
    no_groups: "Keine Gruppen gefunden",
    no_groups_text: "Erstellen Sie eine neue Gruppe, indem Sie auf das Plus drücken.",
    no_items_text: "Sie können einen neuen Eintrag erstellen, indem Sie auf das Plus drücken.",
    no_documents: "Keine Dokumente gefunden",
    no_documents_upload_text: "Sie können einen hinzufügen, indem Sie auf den Upload Button klicken",
    no_documents_info_text: "Sie können das Workflow-Item bearbeiten, um Dokumente hinzuzufügen",
    no_nodes: "Keine Anfragen für zusätzliche Nodes gefunden",
    no_notifications: "Keine Benachrichtigungen gefunden",
    no_organizations: "Keine Anfragen für neue Organisationen gefunden",
    no_resources: "Keine Daten zu ausgewählter Ressource hinzugefügt",
    no_subprojects: "Keine Subprojects gefunden",
    no_users: "Keine Users gefunden",
    no_users_text: "Fügen Sie neue Users hinzu, indem Sie auf das Plus drücken.",
    no_workflow_items: "Keine Workflow-Items gefunden",
    not_assigned: "Nicht zugewiesen",
    not_assigned_budget: "Not Assigned Budget",
    not_projected: "Nicht projiziert",
    not_disbursed: "Nicht ausgezahlt",
    not_ok: "Nicht Ok",
    ok: "Ok",
    open: "Offen",
    organization: "Organisation",
    password: "Passwort",
    permission: "Berechtigung",
    project: "Project",
    projected_budget: "Planbudget",
    projected_budget_exists: "Planbudget existiert bereits",
    redacted: "Redigiert",
    reset: "Zurücksetzen",
    revoke: "Widerrufen",
    reject: " Ablehnen",
    rejected: "Abgelehnt",
    search: "Suche",
    show_permissions: "Zeige Berechtigungen",
    status: "Status",
    submit: "Fertig",
    subproject: "Subproject",
    subprojects: "Subprojects",
    tag: "Tag",
    add_tag_text: "Tag zum Projekt hinzufügen",
    tag_already_exists: "Tag existiert bereits!",
    invalid_tag: "Ungültiger Tag",
    invalid_format: "Ungültiges Format",
    task_status: "Task status",
    total_budget: "Gesamtes Budget",
    thumbnail: "Thumbnail",
    type: "Typ",
    update: "Update",
    username: "Login-ID",
    id: "ID",
    name: "Name",
    view: "Ansicht",
    workflowitem: "Workflowitem",
    history_end: "Keine weiteren Ereignisse",
    no_history: "Keine Ereignisse",
    dueDate: "Fälligkeitsdatum",
    dueDate_exceeded: "Fälligkeitsdatum überschritten",
    login_disabled: "Login-ID ist deaktiviert",
    login_data_error: "Login-ID oder Passwort kann nicht leer sein",
    refresh_assignments: "Zuordnungen aktualisieren",
    tags: "Tags",
    all: "Alle",
    assignee: "Verantwortlicher"
  },

  login: {
    environment: "Umgebung",
    loading: "Laden ...",
    login_button_title: "Login",
    production_env: "Prod",
    test_env: "Test",
    frontend_name: "TruBudget",
    frontend_description: "Eine Blockchain-basierte Lösung für Budget Management"
  },

  project: {
    add_new_project: "Neues Project hinzufügen",
    assignee: "Verantwortlicher",
    project_budget: "Budget",
    project_budget_amount: "Project Budget Anzahl",
    project_close_info: "Mindestens ein Subproject wurde noch nicht geschlossen.",
    project_comment: "Kommentar",
    project_currency: "Währung",
    project_details: "Details",
    project_edit_title: "Project ändern",
    project_name: "Name",
    project_roles: "Roles",
    project_thumbnail: "Thumbnail",
    project_title: "Projekt Titel",
    project_title_description: "Name des Projekts",
    project_searchtext: "Projekte durchsuchen"
  },

  subproject: {
    assignee: "Verantwortlicher",
    fixed_workflowitem_type: "Fester Workflowitem Typ",
    subproject_add_title: "Neues Subprojekt",
    subproject_assigned_organization: "Verantwortliche Organisation",
    subproject_budget_amount: "Subprojekt Budget",
    subproject_comment: "Subprojekt Kommentar",
    subproject_completion_string: "{0} von {1} erledigt",
    subproject_currency: "Subprojekt Währung",
    subproject_preview: "Subprojekt Vorschau",
    subproject_close_info: "Mindestens ein Workflowitem wurde noch nicht geschlossen",
    subproject_close_not_allowed: "Sie haben keine Berechtigung das Projekt zu schließen",
    subproject_edit_title: "Subprojekt ändern",
    subproject_select_button: "Auswählen",
    subproject_title: "Subprojekt Titel",
    subproject_title_description: "Name of the Subprojekt",
    subproject_searchtext: "Subprojekte durchsuchen",
    subproject_any_workflowitem_type: "Workflowitems erlauben, allgemeinen oder eingeschränkten Typ auszuwählen",
    subproject_general_workflowitem_type: "Nur Workflow-Elemente vom Typ 'general' zulassen",
    subproject_restricted_workflowitem_type:
      "Nur Workflow-Elemente vom Typ 'eingeschränkt' zulassen. Bei Zuweisung eines eingeschränkten Workflow-Items an einen anderen User werden Berechtigungen automatisch erteilt und entzogen. Der Zuweisende behält nur die Anzeigerechte.",
    workflowitem_assignee: "Vorausgewählter Verantwortlicher"
  },

  workflow: {
    assignee: "Verantwortlicher",
    add_item: "Workflowitem erstellen",
    approval_required: "Bestätigung benötigt",
    edit_item: "Workflowitem ändern",
    exchange_rate: "Wechselkurs",
    workflow_budget: "Budgetbetrag",
    workflow_budget_allocated: "Zugeteilt",
    workflow_budget_disbursed: "ausgezahlt",
    workflow_budget_na: "Nicht anwendbar",
    workflow_budget_status_allocated: "Zugeteilt",
    workflow_budget_status_disbursed: "Ausgezahlt",
    workflow_budget_status_na: "N/A",
    workflow_comment: "Workflow Kommentar",
    workflow_disable_sort: "Speichern",
    workflow_document_changed: "Geändert",
    workflow_document_description: "Name des Dokuments",
    workflow_document_name: "Dokumentenname",
    workflow_document_validate: "Validieren",
    workflow_document_validated: "Validiert",
    workflow_document_validation_ok: "Identisches Dokument",
    workflow_document_validation_not_ok: "Unterschiedliches Dokument",
    workflow_documents: "Dokumente",
    workflow_enable_sort: "Sortieren",
    workflow_fingerprint: "Fingerabdruck",
    workflow_document_not_available: "Dokument ist nicht verfügbar",
    workflow_name: "Name",
    workflow_next_step: "Weiter",
    workflow_no_actions: "Keine Action benötigt",
    workflow_no_documents: "Keine Dokumente",
    workflow_none: "Keine",
    workflow_permissions_title: "Setze Berechtigungen für das Workflowitem",
    workflow_redacted: "Redigiert",
    workflow_selection: "Du hast {0} workflows ausgewählt",
    workflow_submit_for_review: "Zum Review freigeben",
    workflow_table_title: "Workflowitems",
    workflow_title: "Workflow Titel",
    workflow_title_description: "Name des Workflowitems",
    workflow_type: "Typ",
    workflow_type_transaction: "Transaktion",
    workflow_type_workflow: "Workflow",
    workflow_upload_document: "Upload",
    workflowitem_details: "Prozessschrittdetails",
    workflowitem_details_documents: "Dokumente",
    workflowitem_details_history: "Historie",
    workflowitem_details_overview: "Übersicht",
    workflowitem_type: "Workflowitem Typ",
    workflowitem_type_general: "Legen Sie ein Workflow-Item vom Typ 'general' an.",
    workflowitem_type_restricted:
      "Bei Zuweisung eines eingeschränkten Workflow-Items an einen anderen User werden Berechtigungen automatisch erteilt und entzogen. Der Zuweisende behält nur die Anzeigerechte.",
    workflow_reject_reason: "Ablehnungsgrund"
  },

  snackbar: {
    update_succeed_message: "{0} erfolgreich geändert",
    creation_succeed_message: "{0} erfolgreich erstellt",
    permissions_warning: "Noch keine Berechtigungen für {0} gesetzt"
  },

  searchBar: {
    quick_search: "Schnellsuche"
  },

  users: {
    account_name: "Accountname",
    new_user: "Neuer Benutzer",
    user_created: "Benutzer wurde erstellt",
    users: "Benutzer",
    new_group: "Neue Benutzergruppe",
    groups: "Benutzergruppe",
    add_user: "Benutzer hinzufügen",
    group_created: "Benutzergruppe wurde erstellt",
    add_group: "Benutzergruppe",
    edit_group: "Benutzergruppe ändern",
    edit_permissions_for: "Ändere Berechtigungen für",
    current_user_password: "Ihr Passwort",
    new_user_password: "Neues Passwort",
    new_user_password_confirmation: "Bestätigen Sie das neue Password",
    no_password_match: "Passwörter stimmen nicht überein",
    invalid_password: "Passwort ungültig",
    change_password_for: "Passwortänderung für {0}",
    password_change_success: "Passwort wurde erfolgreich geändert",
    type_current_password: "Geben Sie das Passwort für {0} ein",
    type_new_password: "Geben Sie das neue Passwort für {0} ein",
    username_invalid: "Login-ID ungültig",
    password_conditions_preface: "Das Passwort muss:",
    password_conditions_length: "Mindestens 8 Zeichen lang sein",
    password_conditions_letter: "Mindestens einen Buchstaben enthalten",
    password_conditions_number: "Mindestens eine Zahl enthalten",
    privacy_notice:
      "Bitte stellen Sie sicher, dass Sie keine persönlichen Informationen angeben. Durch Klicken auf Fertig werden Ihre Daten dauerhaft gespeichert und hiermit der Erhalt des Datenschutzhinweises bestätigt.",
    selected_users: "ausgewählte Benutzer",
    disabled_users: "Deaktivierte Benutzer",
    disable_user: "Benutzer deaktivieren",
    disable_userId: "Benutzer {0} deaktivieren",
    disable_user_successfull: "Folgender Benutzer wurde deaktiviert: ",
    enable_user: "Benutzer wiederherstellen",
    enable_userId: "Benutzer {0} aktivieren",
    enable_userId_confirm: "Möchten Sie den Benutzer {0} wirklich wiederherstellen?",
    enable_user_successfull: "Folgender Benutzer wurde wiederhergestellt: ",
    no_assignments: "Keine Zuweisungen",
    assigned_projects: "Zugewiesene Projekte",
    assigned_subprojects: "Zugewiesene Subrojekte",
    assigned_workflowitems: "Zugewiesene Workflowitems",
    assigned_message:
      "Vor dem Deaktivieren muss für diesen Benutzer die Zuordnung zu folgenden Elementen aufgehoben werden",
    not_assigned_message:
      "Dieser Benutzer ist keinem Projekt, Subprojekt und Workflowitem zugeordnet und kann deaktiviert werden.",
    hidden_assignments: "Weitere ausgeblendete {0}"
  },
  userProfile: {
    invalid_email_address: "Ungültige E-Mail Adresse"
  },

  nodesDashboard: {
    access: "Zugriff",
    additional_organization_node: "Anfragen für zusätzliche Nodes",
    address: "Zugriff",
    approve: "Genehmigen",
    decline: "Ablehnen",
    network: "Netzwerk",
    new_organization: "Anfragen für neue Organisationen",
    nodes: "Knotenepunkte (Nodes)",
    permissions: "Berechtigungen",
    declined_by: "Abgelehnt von",
    connection_status: "Verbindungsstatus",
    last_seen: "Zuletzt gesehen",
    admin_description:
      "Der Administratorknoten ist der Anfangsknoten des Netzwerks und verfügt über zusätzliche 'Mine' und 'Admin' Berechtigungen."
  },

  preview: {
    actions_done: "{0} von {1} Actions fertig",
    assign_action_text: "Zuweisen von {0}",
    grant_permission_action_text: "Erteilung von {0} zu {1}",
    not_possible_action: "Nicht ausführbare Actions",
    possible_action: "Ausführbare Actions",
    preview: "Vorschau",
    revoke_permission_action_text: "Zurückziehen von {0} für {1}"
  },

  confirmation: {
    assign_permissions: "Berechtigungen zuweisen",
    additional_permissions_dialog_text:
      "Zusätzliche Aktionen müssen ausgeführt werden, um sicherzustellen, dass Benutzer auch alle erforderlichen Ressourcen anzeigen können.",
    confirmation_required: "Bestätigung notwendig",
    execute_actions: "Aktionen ausführen",
    failed_action_error:
      "Fehler: Das Gewähren von {0} an {1} ist fehlgeschlagen. Alle Aktionen, die nach dem Auftreten des Fehlers ausgeführt worden wären, einschließlich der ursprünglichen Aktionen, werden abgebrochen.",
    grant_and_assign: "Gewähren & Zuweisen",
    list_permissions_required_text:
      "Stellen Sie sicher, dass Sie Leseberechtigungen für Berechtigungen der beteiligten Ressourcen besitzen",
    no_permission_warning: "Sie benötigen folgende Berechtigungen, um alle angeforderten Aktionen ausführen zu können:",
    no_permission_help:
      "Folgende Benutzer sind berechtigt, Ihnen Berechtigungen für die benötigten Ressourcen zu geben:",
    original_actions: "Sie haben folgende Aktionen angefordert:",
    permissions_required: "Berechtigungen erforderlich",
    permissions_text: `{0} benötigt zusätzliche Berechtigungen um {1} "{2}" sehen zu können.`,
    post_actions_dialog_text: "Nach Erstellung des Workflowitems werden folgende Aktionen ausgeführt",
    project_close: "Projekt schließen",
    project_close_text: "Sind Sie sicher, dass Sie dieses Projekt schließen wollen?",
    subproject_close: "Subprojekt schließen",
    subproject_close_text: "Sind Sie sicher, dass Sie dieses Subprojekt schließen wollen?",
    user_group: "Benutzer/Gruppe",
    workflowitem_close: "Workflowitem schließen",
    workflowitem_close_text: "Sind Sie sicher, dass Sie dieses Workflow-Item schließen wollen?",
    workflowitem_create: "Erstelle Workflowitem",
    workflowitem_close_reject: "Mit Bemerkung ablehnen",
    workflowitem_close_accept: "Ablehnen"
  },

  intents: {
    assign: "zuweisen",
    close: "schließen",
    createSubproject: "Subprojekte anzeigen",
    createWorkflowitem: "Workflowitems erstellen",
    grantPermission: "Berechtigungen vergeben",
    listPermissions: "Berechtigungen anzeigen",
    reorderWorkflowitems: "Workflowitem neu anordnen",
    revokePermission: "Berechtigungen entziehen",
    update: "aktualisieren",
    viewDetails: "Details anzeigen",
    viewHistory: "Historie anzeigen",
    list: "Zusammenfassung anzeigen"
  },

  analytics: {
    assigned_budget_ratio: "Zugewiesene Budgetquote",
    available_unspent_budget: "Verfügbares Budget",
    converted_amount: "Umgerechneter Betrag",
    disbursed_budget_ratio: "Ausgezahlte Budgetquote",
    insufficient_permissions_text:
      "Ein oder mehrere Workflowitems sind zensiert. Die Analysen werden ausgeblendet, weil sie verfälscht würden.",
    project_analytics: "Projekt Analyse",
    projected_budget_ratio: "Projizierte Budgetquote",
    projected_budgets_distribution: "Verteilung des geplanten Budgets",
    subproject_analytics: "Subprojekt Analyse",
    total_budget_distribution: "Gesamte Budget Verteilung",
    total: "Gesamt:"
  },

  navigation: {
    admin_permission: "Admin",
    backup: "Backup",
    connected_peers: "Peers verbunden",
    disconnected_peers: "Keine Peers verbunden",
    logout: "Logout",
    main_site: "Main",
    menu_item_export: "Exportieren",
    menu_item_network: "Network",
    menu_item_notifications: "Benachrichtigungen",
    menu_item_projects: "Projekte",
    menu_item_users: "Benutzer",
    no_peers: "Keine Peers",
    options: "Optionen",
    peers: "Peers",
    projects_site: "Projects",
    restore: "Wiederherstellen",
    rtUpdates: "Real-Time Updates",
    selections: "Auswahl",
    service_status: "Service Status",
    unread_notifications: "Ungelesene Benachrichtigungen",
    write_permission: "Write"
  },

  notification: {
    next_page: "Nächste Seite",
    previous_page: "Vorherige Seite",
    rows_per_page: "Einträge pro Seite",
    create_transaction: "Transaktion {0} erstellt",
    create_workflow: "Workflow {0} erstellt",
    done_transaction: "Status der Transaktion {0} auf Erledigt gesetzt",
    done_workflow: "Status des Workflows {0} auf Erledigt gesetzt",
    edit_transaction: "Transaktion {0} wurde angepasst",
    edit_workflow: "Workflowitem {0} wurde angepasst",
    email_saved: "E-Mail {0} gespeichert",
    no_permissions: "(Keine Berechtigungen, um weitere Details zu sehen)",
    notification_subtitle: "Ungelesen",
    notification_table_all_read: "Alle gelesen",
    notification_table_by: "Von",
    notification_table_description: "Beschreibung",
    notification_table_project: "Projekt",
    notification_table_role: "Rolle",
    notification_table_subproject: "Subprojekt",
    notification_table_view: "Ansicht",
    notification_title: "Benachrichtigungen",
    project_assign: "Projekt {0} wurde Ihnen zugewiesen",
    project_assigned: "Projekt {0} wurde Ihnen zugewiesen",
    project_close: "Projekt {0} schließen",
    project_closed: "Projekt {0} wurde geschlossen",
    project_createSubproject: "Für Projekt {0} wurde ein neues Subprojekt erstellt",
    project_intent_grantPermission: "Die Berechtigungen für Projekt {0} wurden geändert",
    project_intent_revokePermission: "Die Berechtigungen für das Projekt {0} wurden geändert",
    project_projected_budget_deleted: "Geplantes Budget von Projekt {0} wurde entfernt",
    project_projected_budget_updated: "Geplantes Budget von Projekt {0} wurde aktualisiert",
    project_update: "Projekt {0} wurde aktualisiert",
    project_updated: "Projekt {0} wurde aktualisiert",
    read_all: "Alles lesen",
    review_transaction: "Sie sind beauftragt, den Vorgang {0} zu überprüfen",
    review_workflow: "Sie sind beauftragt, den Workflow {0} zu überprüfen",
    save_email_error: "E-Mail konnte nicht gespeichert werden",
    subproject_assign: "Subprojekt {0} wurde Ihnen zugewiesen",
    subproject_assigned: "Subprojekt {0} wurde Ihnen zugewiesen",
    subproject_close: "Subprojekt {0} schließen",
    subproject_closed: "Subprojekt {0} wurde geschlossen",
    subproject_createWorkflowitem: "Für Subprojekt {0} wurde ein neues Workflowitem erstellt",
    subproject_intent_grantPermission: "Die Berechtigungen für Subprojekt {0} wurden geändert",
    subproject_intent_revokePermission: "Die Berechtigungen für das Subprojekt {0} wurden geändert",
    subproject_projected_budget_deleted: "Geplantes Budget von Subprojekt {0} wurde entfernt",
    subproject_projected_budget_updated: "Geplantes Budget von Subprojekt {0} wurde aktualisiert",
    subproject_reorderWorkflowitems: "Die Workflowitems des Subprojekts {0} wurden neu geordnet",
    subproject_update: "Subprojekt {0} aktualisieren",
    subproject_updated: "Subprojekt {0} wurde aktualisiert",
    workflowitem_assign: "Workflowitem {0} wurde Ihnen zugewiesen",
    workflowitem_assigned: "Workflowitem {0} wurde Ihnen zugewiesen",
    workflowitem_close: "Workflowitem {0} wurde geschlossen",
    workflowitem_closed: "Workflowitem {0} wurde geschlossen",
    workflowitem_intent_grantPermission: "Die Berechtigungen für Workflowitem {0} wurden geändert",
    workflowitem_intent_revokePermission: "Die Berechtigungen für Workflowitem {0} wurden geändert",
    workflowitem_update: "Workflowitem {0} wurde aktualisiert",
    workflowitem_updated: "Workflowitem {0} wurde aktualisiert",
    payload_error_message:
      "Ups! ... Es ist nicht deine Schuld - Ein clientseitiger Validierungsfehler ist aufgetreten. Bitte informieren Sie den Administrator."
  },

  history: {
    edit_currency: "Die Währung des Workflowitems {0} wurde zu {1} geändert ",
    edit_documents: "Dokumente für Workflowitem {0} geändert",
    edit_status: "Status von Workflowitem {0} wurde auf {1} geändert",
    edit_subproject: "Betrag von {0} erhöht auf {1}",
    edit_workflowName: "Name von Workflow-Eintrag {0} geändert in {1} ",
    event_type: "Ereignistyp",
    first_sort: "Hat {0} an die erste Stelle verschoben",
    project_grantPermission_details: "{0} gab Rechte {1} an {2} für {3}",
    project_grantPermission: "{0} erteilte Rechte {1} an {2}",
    project_projected_budget_deleted: "{0} löschte das geplante Budget von {1}",
    project_projected_budget_updated: "{0} veränderte das geplante Budget von {1}",
    project_revokePermission_details: "{0} entzog Rechte {1} von {2} für {3}",
    project_revokePermission: "{0} entzog Rechte {1} von {2}",
    subproject_grantPermission_details: "{0} erteilte die Erlaubnis {1} an {2} auf {3}",
    subproject_grantPermission: "{0} gewährt die Erlaubnis {1} für {2}",
    subproject_revokePermission_details: "{0} widerrief die Erlaubnis {1} von {3} von {2}",
    workflowitem_grantPermission_details: "{0} gewährte die Erlaubnis {1} für {2} auf {3}",
    workflowitem_grantPermission: "{0} gewährt die Erlaubnis {1} an {2} für {3}",
    workflowitem_revokePermission_details: "{0} widerrief die Erlaubnis {1} für {2} am {3}",
    workflowitem_revokePermission: "{0} widerrief die Erlaubnis {1} von {3} von {2}",
    workflowitem_update_docs: "{0} fügte Dokumente zu Workflowitem {1} hinzu",
    workflowitem_update: "{0} veränderte Workflowitem {1} ",
    workflowitem_update_amount: "{0} veränderte Workflowitem {1} Budget in {2} ",
    workflowitem_document_validated: "{0} validiertes Workflowitem-Dokument mit dem Namen {1} in {2} ",
    workflowitem_document_invalidated:
      "{0} hat ein anderes Dokument im Workflowitem verwendet, um das mit benannte Dokument zu validieren {1} in {2} ",
    end_date: "Enddatum",
    publisher: "Herausgeber",
    sort: "Verschoben {0} nach {1}",
    start_date: "Start-Datum",
    project_create: "{0} hat Projekt {1} erstellt",
    project_update: "{0} verändertes Projekt {1} ",
    project_assign: "{0} hat Projekt {1} an {2} zugewiesen",
    project_close: "Schließe Projekt",
    project_createSubproject: "{0} erstellt Unterprojekt {1}",
    subproject_revokePermission: "{0} widerrief die Erlaubnis {1} von {2}",
    subproject_update: "{0} veränderte Subprojekt {1} ",
    to: "{0} bis {1}",
    workflowitem_assign: "{0} zugewiesenes Workflowitem {1} an {2}",
    workflowitem_close: "{0} geschlossenes Workflowitem {1}",
    subproject_assign: "{0} zugewiesenes Projekt {1} zu {2}",
    subproject_close: "{0} schloss Unterprojekt {1}",
    subproject_create: "{0} erstellte Subprojekt {1}",
    subproject_createWorkflowitem: "{0} erstellte Workflowitem {1}",
    subproject_reorderWorkflowitems: "{0} changed the workflowitem ordering"
  },

  permissions: {
    admin: "Admin-Berechtigungen",
    dialog_title: "Setze Berechtigungen für {0}",
    global_createGroup: "Gruppen erstellen",
    global_createProject: "Projekte erstellen",
    global_createUser: "Benutzer erstellen",
    global_disableUser: "Benutzer deaktivieren",
    global_enableUser: "Benutzer aktivieren",
    global_grantPermission: "Globale Berechtigungen für andere erteilen",
    global_listPermissions: "Alle globalen Berechtigungen auflisten",
    global_revokePermission: "Globale Berechtigungen für andere widerrufen",
    network_list: "Liste aller angeschlossenen Knoten",
    network_voteForPermission: "Abstimmen, ob ein Knoten dem Netzwerk beitreten soll",
    project_assign: "Projekt an andere zuweisen",
    project_close: "Projekt schließen",
    project_createSubproject: "Unterprojekte erstellen",
    project_intent_grantPermission: "Berechtigungen erteilen",
    project_intent_listPermissions: "Berechtigungen anzeigen",
    project_intent_revokePermission: "Berechtigungen widerrufen",
    project_update: "Projekt aktualisieren",
    project_viewDetails: "Projektdetails anzeigen",
    project_list: "Projekt in der Übersicht anzeigen",
    read_only: "Nur Lesezugriff",
    subproject_assign: "Subprojekt zuweisen",
    subproject_close: "Subprojekt schließen",
    subproject_createWorkflowitem: "Workflowitems erstellen",
    subproject_intent_grantPermission: "Subprojekt-Berechtigungen erteilen",
    subproject_intent_listPermissions: "Subprojekt-Berechtigungen anzeigen",
    subproject_intent_revokePermission: "Subprojekt-Berechtigungen widerrufen",
    subproject_reorderWorkflowitems: "Workflow-Elemente neu bestellen",
    subproject_update: "Subprojekt aktualisieren",
    subproject_viewDetails: "Details des Subprojekts anzeigen",
    subproject_list: "Subprojektübersicht anzeigen",
    view: "Ansichtsberechtigungen",
    workflowitem_assign: "Workflowitem zuweisen",
    workflowitem_close: "Workflowitem schließen",
    workflowitem_intent_grantPermission: "Workflowitem-Erlaubnis erteilen",
    workflowitem_intent_listPermissions: "Workflowitem-Berechtigungen anzeigen",
    workflowitem_intent_revokePermission: "Workflowitem-Erlaubnis widerrufen",
    workflowitem_update: "Workflow-Eintrag aktualisieren",
    workflowitem_view: "Workflow-Eintrag anzeigen",
    write: "Schreibberechtigungen"
  },

  eventTypes: {
    project_created: "Projekt erstellt",
    project_updated: "Projekt aktualisiert",
    project_assigned: "Projekt zugewiesen",
    project_closed: "Projekt abgeschlossen",
    project_permission_granted: "Projektgenehmigung erteilt",
    project_permission_revoked: "Projekterlaubnis widerrufen",
    project_projected_budget_updated: "Projektbudget aktualisiert",
    project_projected_budget_deleted: "Projekt-Budget abgeschlossen",
    subproject_created: "Subprojekt angelegt",
    subproject_updated: "Subprojekt aktualisiert",
    subproject_assigned: "Subprojekt zugeordnet",
    subproject_closed: "Subprojekt abgeschlossen",
    subproject_permission_granted: "Subprojektgenehmigung erteilt",
    subproject_permission_revoked: "Subprojekt-Erlaubnis widerrufen",
    subproject_projected_budget_updated: "Subprojekt-Budget aktualisiert",
    subproject_projected_budget_deleted: "Subprojekt-Budget geschlossen",
    workflowitem_created: "Workflowitem erzeugt",
    workflowitem_document_validated: "Workflowitem-Dokument validiert",
    workflowitem_updated: "Workflowitem aktualisiert",
    workflowitem_assigned: "Workflowitem zugeordnet",
    workflowitem_closed: "Workflowitem geschlossen",
    workflowitem_permission_granted: "Workflowitem-Erlaubnis erteilt",
    workflowitem_permission_revoked: "Workflowitem-Erlaubnis widerrufen",
    workflowitems_reordered: "Workflow-Einträge neu angeordnet"
  },

  status: {
    average: "normal",
    connection: "Verbindung",
    fast: "schnell",
    no_ping_available: "kein ping möglich",
    not_connected: "nicht verbunden",
    ping: "Ping",
    service: "Service",
    slow: "langsam",
    version: "Version",
    very_slow: "sehr langsam",
    error: "Fehler",
    warning: "Warnung",
    done: "Fertig",
    toBeDone: "Ist noch offen"
  },

  language: {
    english: "Englisch",
    french: "Französisch",
    german: "Deutsch",
    portuguese: "Portugiesisch",
    georgian: "Georgisch"
  }
};

export default de;
