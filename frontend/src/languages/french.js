const fr = {
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
    action: "Action",
    actions: "Actions",
    add_tag_text: "Ajouter un tag au projet",
    add: "Ajouter",
    added: "Ajouté",
    additional_data: "Données Supplémentaires",
    amount: "Montant",
    approver: "Approbateur",
    assign: "Allouer",
    assigned_budget: "Budget engagé",
    assigned: "Engagé",
    assignees: "Responsable(s)",
    back: "Retour",
    bank: "Banque",
    budget_distribution: "Affectation budgétaire",
    budget: "Budget",
    cancel: "Annuler",
    close: "Fermer",
    closed: "Fermé",
    comment_description: "Ajouter des commentaires",
    comment: "Commentaire",
    completion: "Achèvement",
    confirm: "Confirmer",
    create: "Créer",
    created: "Date de création",
    currency: "Devise",
    disbursed_budget: "Montants payés",
    disbursement: "Paiement prévus",
    disconnected: "Déconnecté",
    display_name: "Afficher un nom",
    delete: "Supprimer",
    done: "Terminé",
    download: "Télécharger",
    edit: "Modifier",
    edited: "Modifié",
    email: "Email",
    finish: "Terminer",
    global: "global",
    grant: "Accorder",
    hash: "Hachage",
    history_end: "Dernier évènement atteint",
    history: "Historique",
    workflowitem_history: "Historique des étapes de workflow",
    subproject_history: "Historique de la Composante",
    project_history: "Historique du Projet",
    id: "Identifiant",
    in_progress: "En cours d'exécution",
    in_review: "En cours d'examen",
    incorrect_password: "Mot de passe incorrect",
    incorrect_username: "Nom d'utilisateur incorrect",
    incorrect_username_or_password: "Identifiant de connexion ou mot de passe incorrect",
    invalid_tag: "Tag invalide",
    invalid_format: "Format non valide",
    link: "Lien",
    name: "compte utilisateur",
    next: "Suivant",
    no_budget: "Aucun budget trouvé",
    no_budget_project: "Pour ajouter un budget à votre projet, retournez à la page principale.",
    no_budget_subproject:
      "Pour ajouter un budget à votre composante, retournez à la page de présentation de la composante.",
    no_budget_distribution: "Impossible d'afficher la distribution si tous les éléments ne sont pas visibles",
    no_disabled_users: "Aucun utilisateur désactivé trouvé",
    no_groups: "Aucun groupe trouvé",
    no_groups_text: "Créez un nouveau groupe en appuyant sur la touche plus.",
    no_history: "Aucun évènement",
    no_items_text: "Vous pouvez en créer un en appuyant sur la touche « plus ».",
    no_documents: "Aucun document trouvé",
    no_documents_upload_text: "Vous pouvez en ajouter un en appuyant sur le bouton de téléchargement",
    no_documents_info_text: "Vous pouvez modifier l'étape de workflow pour ajouter des documents",
    no_nodes: "Aucune demande de nœuds supplémentaires n'a été trouvée",
    no_notifications: "Aucune notification trouvée",
    no_organizations: "Aucune demande de nouvelles organisations n'a été trouvée",
    no_permissions: "Vous n'êtes pas autorisé à effectuer cette action",
    no_resources: "Aucun champ n'a été ajouté à cette ressource",
    no_subprojects: "Aucun composante trouvé",
    no_users: "Aucun utilisateur trouvé",
    no_users_text: "Ajoutez un nouvel utilisateur en appuyant sur le touche plus.",
    no_workflow_items: "Aucune étape de workflow ",
    not_assigned_budget: "Budget non-engagé",
    not_assigned: "Non engagé",
    not_disbursed: "Non payé",
    not_ok: "Pas OK",
    ok: "Ok",
    not_projected: "Non estimé",
    open: "Ouvert",
    organization: "Organisation",
    password: "Mot de passe",
    permission: "Autorisation",
    project: "Projet",
    projected_budget_exists: "Le coût prévu existe déjà",
    projected_budget: "Coût prévu",
    redacted: "Expurgé",
    reset: "Réinitialiser",
    revoke: "Révoquer",
    reject: "Rejette",
    rejected: " Rejeté",
    search: "Chercher",
    show_permissions: "Afficher les autorisations",
    status: "Statut",
    submit: "Soumettre",
    subproject: "Composante",
    subprojects: "Composantes",
    switch_to_table: "Passer à la vue tableau",
    tag_already_exists: "Le tag existe déjà!",
    tag: "Tag",
    task_status: "Etat de la tâche",
    thumbnail: "Vignette",
    total_budget: "Coût total",
    type: "Type",
    update: "Mettre à jour",
    username: "Identifiant",
    view: "Vue",
    view_project_details: "Afficher les détails du projet",
    workflowitem: "Étape de workflow",
    dueDate: "Date d'échéance",
    dueDate_exceeded: "Date d'échéance dépassée",
    login_disabled: "L'identification de connexion est désactivée",
    login_data_error: "Le champ « Identifiant de connexion » ou « Mot de passe » ne peut pas être vide",
    login_proxy_error: "La connexion à l'API n'a pas pu être établie ! Veuillez vérifier les paramètres de proxy !",
    login_api_error: "L'API n'est pas accessible, veuillez vous assurer qu'elle est en cours d'exécution !",
    refresh_assignments: "Actualiser les affectations",
    tags: "Balises",
    all: "Tous",
    assignee: "Cessionnaire"
  },

  login: {
    environment: "Environnement",
    loading: "Chargement ...",
    login_button_title: "Connexion",
    production_env: "Prod",
    test_env: "Test",
    frontend_name: "TruBudget",
    frontend_description:
      "Une plateforme collaborative pour une gestion transparente et sécurisée des financements extérieurs.",
    user_not_found: "Your user account has not been found. Please contact the administrator."
  },

  project: {
    add_new_project: "Ajouter un nouveau projet",
    assignee: "propriétaire",
    project_budget_amount: "Montant du budget du projet",
    project_budget: "Budget du projet",
    project_close_info: "Au moins une composante n'est pas encore terminée",
    project_comment: "Commentaire sur le projet",
    project_currency: "Devise",
    project_details: "Tableau de bord",
    project_edit_title: "Modifier un projet",
    project_name: "Nom du projet",

    project_roles: "Rôles dans le projet",
    project_thumbnail: "Vignette",
    project_title_description: "Description du titre du projet",
    project_title: "Titre de projet",
    project_searchtext: "Recherche de projets"
  },

  subproject: {
    assignee: "Responsable par défaut",
    fixed_workflowitem_type: "Type de workflow fixe",
    subproject_add_title: "Ajouter une nouvelle composante",
    subproject_assigned_organization: "Organisation assignée",

    subproject_budget_amount: "Montant du budget de la composante",
    subproject_close_info: "Au moins une étape de workflow n'est pas encore fermée",
    subproject_close_not_allowed: "Vous n'êtes pas autorisé à fermer la composante",
    subproject_comment: "Commentaire sur la composante",
    subproject_completion_string: "{0} cal {1} van",
    subproject_currency: "Devise de la composante",
    subproject_edit_title: "Modifier la composante",

    subproject_preview: "Aperçu de la composante",
    subproject_select_button: "Sélectionnez",
    subproject_title_description: "Titre de la composante",
    subproject_title: "Composante",
    subproject_searchtext: "Recherche de composantes",
    subproject_any_workflowitem_type: "Autoriser les éléments de workflow à sélectionner un type général ou restreint",
    subproject_general_workflowitem_type: "Autoriser uniquement les éléments de workflow de type général",
    subproject_restricted_workflowitem_type:
      "Autoriser uniquement l'élément de flux de travail de type restreint. Lors de l'attribution d'un élément de flux de travail restreint, les autorisations sont automatiquement accordées et révoquées. Le cédant ne conservera que les autorisations d'affichage.",
    workflowitem_assignee: "Default assignee"
  },

  workflow: {
    add_item: "Creer une étape de workflow",
    add_tag_wfi_text: "Ajouter un tag sur l’étape de workflow",
    approval_required: "Approbation exigée",
    assignee: "Responsable",
    edit_item: "Modifier l'étape de workflow",
    exit_sort_mode:
      "Ce bouton est désormais désactivé. Quitter le mode de tri pour créer de nouveaux éléments de workflow",
    exchange_rate: "taux de change",
    search_text: "rechercher des éléments",
    workflow_budget_allocated: "Engagé",
    workflow_budget_disbursed: "payé",
    workflow_budget_na: "N/A",
    workflow_budget_status_allocated: "Engagé",
    workflow_budget_status_disbursed: "Payé",
    workflow_budget_status_na: "N/A",
    workflow_budget: "Montant du budget",
    workflow_comment: "Commentaire sur l’étape de workflow",
    workflow_disable_sort: "Enregistrer",
    workflow_document_changed: "Modifié",
    workflow_document_description: "Description du document",
    workflow_document_name: "Nom du document",
    workflow_document_not_available: "Document non disponible",
    workflow_document_validate: "Valider",
    workflow_document_validated: "Validé",
    workflow_document_validation_not_ok: "Document différent",
    workflow_document_validation_ok: "Document identique",
    workflow_documents: "Documents de l’étape de workflow",
    workflow_enable_sort: "Trier",
    workflow_fingerprint: "Empreinte digitale",
    workflow_name: "Nom de l’étape de workflow",
    workflow_next_step: "Prochaine étape",
    workflow_no_actions: "Pas d'action",
    workflow_no_documents: "Pas de document",
    workflow_none: "blub",
    workflow_permissions_title: "Définir les autorisations sur l'étape de workflow",
    workflow_redacted: "Expurgé",
    workflow_reject_reason: "Motif de rejet",
    workflow_selection: "Vous avez sélectionné {0} étapes de workflow ",
    workflow_submit_for_review: "Soumettre pour examen",
    workflow_table_title: "Liste des étapes",
    workflow_title_description: "Description du titre de l’étape de workflow",
    workflow_title: "Titre de l’étape de workflow",
    workflow_type_transaction: "Transaction",
    workflow_type_workflow: "Workflow",
    workflow_type: "Type du Workflow",
    workflow_upload_document: "Charger",
    workflowitem_details_documents: "Documents",
    workflowitem_details_history: "Historique",
    workflowitem_details_overview: "Sommaire",
    workflowitem_details: "Détails de l’étape du workflow",
    workflowitem_type_general: "Créer une étape de workflow de type général.",
    workflowitem_type_restricted:
      "Lors de l'attribution d'un workflow restreint, les autorisations sont automatiquement accordées et révoquées. Le cédant ne conservera que les autorisations de visualisation",
    workflowitem_type: "Type de l’étape de workflow"
  },

  workflowTemplate: {
    monitoring: "Surveillance ou exécution",
    tender: "Appel d'offres",
    payments: "Paiements"
  },

  snackbar: {
    update_succeed_message: "{0} modifiée",
    creation_succeed_message: "{0} créée",
    permissions_warning: "Aucune autorisation n'a été accordée pour {0}"
  },

  searchBar: {
    quick_search: "Recherche rapide"
  },

  users: {
    account_name: "Compte utilisateur",
    add_group: "Ajouter un groupe",
    add_user: "Ajouter un nouveau compte utilisateur",
    change_password_for: "Changer le mot de passe pour {0}",
    current_user_password: "Votre mot de passe",
    edit_group: "Éditer un groupe",
    edit_permissions_for: "Éditer les autorisations pour",
    group_created: "Groupe créé avec succès",
    groups: "Groupes",
    invalid_password: "Mot de passe invalide",
    new_group: "Nouveau groupe d'utilisateurs",
    new_user_password_confirmation: "Confirmer le nouveau mot de passe",
    new_user_password: "Nouveau mot de passe",
    new_user: "Nouvel utilisateur",
    no_password_match: "Les mots de passe ne correspondent pas",
    password_change_success: "Mot de passe changé avec succès",
    password_conditions_length: "Comporter au moins 8 caractères",
    password_conditions_letter: "Contenir au moins une lettre",
    password_conditions_number: "Contenir au moins un chiffre",
    password_conditions_preface: "Votre mot de passe doit:",
    privacy_notice:
      "Assurez-vous de ne pas fournir d'informations personnelles (nom, prénom(s), matricule, adresse email) en remplissant ce formulaire.\nEn cliquant sur \"SOUMETTRE\", vous nous autorisez à sauvegarder vos données de façon permanente et vous confirmez la réception de l'avis de confidentialité.",
    type_current_password: "Tapez le mot de passe actuel pour {0}",
    type_new_password: "Tapez le nouveau mot de passe pour {0}",
    user_created: "Utilisateur créé avec succès",
    username_invalid: "Nom d'utilisateur invalide",
    users: "Utilisateurs",
    selected_users: "utilisateurs sélectionnés",
    disabled_users: "Utilisateurs désactivés",
    disable_user: "Désactiver l'utilisateur",
    disable_userId: "Désactiver l'utilisateur {0}",
    disable_user_successfull: "L'utilisateur suivant a été désactivé: ",
    enable_user: "Restaurer l'utilisateur",
    enable_userId: "Restaurer l'utilisateur {0}",
    enable_userId_confirm: "Voulez-vous vraiment restaurez l'utilisateur {0}?",
    enable_user_successfull: "L'utilisateur suivant a été activé: ",
    no_assignments: "Aucune affectation",
    assigned_projects: "Projets affectés",
    assigned_subprojects: "Composantes affectées",
    assigned_workflowitems: "Étapes de worfklow affectées",
    assigned_message: "Avant d'être désactivé, cet utilisateur doit être désassigné des éléments suivants",
    not_assigned_message:
      "Cet utilisateur n'est affecté à aucun projet, composante et étape de workflow et peut être désactivé",
    hidden_assignments: "Encore expurgé {0}",
    account_name_error: "Le nom du compte ne peut pas être vide",
    login_id_errror: `L'ID de connexion ne peut pas être vide`,
    password_error: "Le mot de passe ne peut pas être vide",
    confirm_password_error: "Confirmer que le mot de passe ne peut pas être vide"
  },

  nodesDashboard: {
    access: "Accès",
    additional_organization_node: "Demandes de nœuds supplémentaires",
    address: "Adresse",
    approve: "Approuver",
    decline: "Refuser",
    network: "Réseau",
    new_organization: "Demandes de nouvelles organisations",
    nodes: "Noeuds",
    permissions: "Autorisations",
    declined_by: "Refusé par",
    connection_status: "Statut de connexion",
    last_seen: "Vu pour la dernière fois",
    admin_description:
      "Le nœud d'administration est le nœud initial du réseau et dispose d'autorisations supplémentaires 'mine' et 'admin'"
  },

  preview: {
    actions_done: "{0} de {1} actions realisées",
    assign_action_text: "Donner la responsabilité à {0}",
    grant_permission_action_text: "Autoriser {1} à {0}",
    not_possible_action: "Actions impossibles",
    possible_action: "Actions possibles",
    preview: "Aperçu",
    revoke_permission_action_text: "Revoquer {0} de {1}",
    overwrite: "écraser",
    overwrite_warning:
      "Avertissement: Cela réinitialise toutes les autorisations à la sélection actuelle. Si vous souhaitez ajouter ou supprimer uniquement certaines autorisations, vous devez plutôt accéder à la boîte de dialogue d'autorisation de chaque élément de flux de travail."
  },

  confirmation: {
    assign_permissions: "Attribuer des autorisations",
    additional_permissions_dialog_text:
      "Des actions supplémentaires doivent être exécutées pour que les utilisateurs puissent également afficher toutes les ressources requises.",
    confirmation_required: "Confirmation requise",
    execute_actions: "Exécuter des actions",
    failed_action_error:
      "Erreur: Échec de l’octroi d’{0} à {1}. Toutes les actions qui ont été exécutées après que l'erreur se soit produite, y compris les actions d'origine, sont annulées.",
    grant_and_assign: "Accorder & Assigner",
    list_permissions_required_text:
      "Assurez-vous que vous avez la liste des autorisations requises pour toutes les ressources impliquées",
    no_permission_warning:
      "Vous devez disposer des autorisations suivantes pour pouvoir exécuter toutes les actions demandées :",
    no_permission_help:
      "Les utilisateurs suivants sont autorisés à vous accorder des permissions sur les ressources nécessaires :",
    original_actions: "Vous avez demandé les actions suivantes:",
    permissions_required: "Autorisations requises",
    permissions_text: `{0} a besoin d'autorisations supplémentaires pour voir {1} "{2}".`,
    post_actions_dialog_text: "Après la création, les actions suivantes sont exécutées",
    project_close: "Fermer projet",
    project_close_text: "Vous êtes sûr de vouloir fermer ce projet?",
    subproject_close: "Fermer la composante",
    subproject_close_text: "Vous êtes sûr de vouloir fermer cette composante ?",
    user_group: "Utilisateur/Groupe",
    workflowitem_close: "Fermer l’étape de workflow ",
    workflowitem_close_text: "Êtes-vous sûr de vouloir fermer cette étape de workflow?",
    workflowitem_create: "créer des étapes de workflow",
    workflowitem_close_reject: "Rejet avec commentaire",
    workflowitem_close_accept: "Acceptez"
  },

  intents: {
    assign: "attribuer",
    close: "proche",
    createSubproject: "créer des composantes",
    createWorkflowitem: "créer des étapes de workflow",
    grantPermission: "accorder autorisations",
    listPermissions: "voir autorisations",
    reorderWorkflowitems: "réorganiser les étapes de workflow",
    revokePermission: "révoquer autorisations",
    update: "mise à jour",
    viewDetails: "voir les détails",
    viewHistory: "voir l’historique",
    list: "voir le résumé"
  },

  analytics: {
    assigned_budget_ratio: "Taux d’engagement (engagé/prévu)",
    available_unspent_budget: "Budget non dépensé disponible",
    converted_amount: "Montant converti",
    disbursed_budget_ratio: "Taux de paiement(payé/engagé)",
    insufficient_permissions_text:
      "Un ou plusieurs flux de travaux sont rédigés. Les analyses sont masquées car elles seraient falsifiées.",
    project_analytics: "Analyse du projet",
    projected_budget_ratio: "Taux d’estimation du budget(estimé/total)",
    projected_budgets_distribution: "Répartition du coût total",
    subproject_analytics: "Analyse de la composante",
    total_budget_distribution: "Répartition du coût total",
    total: "Total:"
  },

  navigation: {
    admin_permission: "Admin",
    backup: "Sauvegarder",
    connected_peers: "Pairs Connectés",
    disconnected_peers: "Pas de Pairs connectés",
    logout: "Déconnexion",
    main_site: "Principal",
    menu_item_export: "Exporter",
    menu_item_network: "Réseau",
    menu_item_notifications: "Notifications",
    menu_item_projects: "Projets",
    menu_item_users: "Utilisateurs",
    no_peers: "Pas de pairs",
    options: "Options",
    peers: "Pairs",
    projects_site: "Projets",
    restore: "Restaurer",
    rtUpdates: "Mises à jour en temps réel",
    selections: "Sélections",
    service_status: "État du service",
    unread_notifications: "Notifications non-lues",
    write_permission: "Écrire"
  },

  notification: {
    create_transaction: "Transaction {0} créé ",
    create_workflow: "Workflow {0} créé",
    done_transaction: "L'état de la transaction {0} est défini sur Terminé",
    done_workflow: "L'état du Workflow {0} est défini sur terminé",
    edit_transaction: "Transaction {0} actualisée",
    edit_workflow: "Workflow {0} actualisée",
    email_saved: "Email {0} enregistré",
    next_page: "Page suivante",
    no_permissions: "(Pas de permission pour voir plus de détails)",
    notification_subtitle: "Non lus",
    notification_table_all_read: "Tout lire",
    notification_table_by: "Par",
    notification_table_description: "Description",
    notification_table_project: "Projet",
    notification_table_role: "Rôle",
    notification_table_subproject: "Composante",
    notification_table_view: "Vue",
    notification_title: "Notifications",
    previous_page: "Page précédente",
    project_assign: "Projet {0} vous a été assigné",
    project_assigned: "Projet {0} vous a été assigné",
    project_close: "Projet {0} est terminé",
    project_closed: "Projet {0} est terminé",
    project_createSubproject: "Une nouvelle composante a été créée pour le projet. {0}",
    project_intent_grantPermission: "Les autorisations pour le projet {0} ont changé",
    project_intent_revokePermission: "Les autorisations pour le projet {0} ont changé",
    project_projected_budget_deleted: "Le coût prévu du projet {0} a été supprimé",
    project_projected_budget_updated: "Le coût prévu du projet {0} a été mis à jour",
    project_update: "Projet {0} a été actualisé",
    project_updated: "Projet {0} a été actualisé",
    read_all: "Tout Lire",
    review_transaction: "Vous êtes chargé d'examiner la transaction {0}",
    review_workflow: "Vous êtes assigné à examiner l’étape de workflow {0}",
    rows_per_page: "Lignes par page",
    save_email_error: "Impossible d'enregistrer l'email",
    subproject_assign: "Composante {0} vous a été assignée",
    subproject_assigned: "Composante {0} vous a été assignée",
    subproject_close: "Composante {0} a été fermée",
    subproject_closed: "Composante {0} a été fermée",
    subproject_createWorkflowitem: "Une nouvelle étape de workflow a été créée pour la composante {0}",
    subproject_intent_grantPermission: "Les autorisations pour la composante {0} ont changé",
    subproject_intent_revokePermission: "Les autorisations pour la composante {0} ont changé",
    subproject_projected_budget_deleted: "Le coût prévu du la composante {0} a été supprimé",
    subproject_projected_budget_updated: "Le coût prévu du la composante {0} a été mis à jour",
    subproject_reorderWorkflowitems: "Les étapes de workflow {0} ont été restauré",
    subproject_update: "Composante {0} a été actualisée",
    subproject_updated: "Composante {0} a été actualisée",
    workflowitem_assign: " L’étape de workflow {0} vous a été assignée",
    workflowitem_assigned: " L’étape de workflow {0} vous a été assignée",
    workflowitem_close: " L’étape de workflow {0} a été fermée",
    workflowitem_closed: " L’étape de workflow {0} a été fermée",
    workflowitem_intent_grantPermission: "Les autorisations sur l’étape de workflow {0} ont changées",
    workflowitem_intent_revokePermission: "Les autorisations sur l’étape de workflow {0} ont changées",
    workflowitem_update: " L’étape de workflow {0} a été actualisée",
    workflowitem_updated: " L’étape de workflow {0} a été actualisé",
    payload_error_message:
      "Oups! ... Ce n'est pas de votre faute - Une erreur de validation côté client s'est produite. Veuillez informer l'administrateur."
  },

  userProfile: {
    invalid_email_address: "Adresse email invalide"
  },

  history: {
    edit_currency: "La devise de l’étape de workflow {0} a changé pour {1} ",
    edit_documents: "Documents modifiés pour l’étape de workflow {0}",
    edit_status: "L'état de l’étape de workflow {0} a changé pour {1} ",
    edit_subproject: "Montant de {0} augmenté à {1}",
    edit_workflowName: "Nom de l’étape de workflow {0} modifié à {1} ",
    end_date: "Date de fin",
    event_type: "Action effectuée",
    first_sort: "Déplacé {0} au premier poste",
    project_assign: "{0} a assigné le projet {1} à {2}",
    project_close: "projet proche",
    project_create: "{0} a crée projet {1}",
    project_createSubproject: "{0} a crée la composante {1}",
    project_grantPermission_details: "{0} a modifié l'autorisation {1} à {2} de {3}",
    project_grantPermission: "{0} a accordé l'autorisation {1} à {2}",
    project_projected_budget_deleted: "{0} a supprimé le coût prévu de {1}",
    project_projected_budget_updated: "{0} a mis à jour le coût prévu de {1}",
    project_revokePermission_details: "{0} a révoqué l'autorisation  {1} à {2} de {3}",
    project_revokePermission: "{0} a révoquer l'autorisation {1} de {2}",
    project_update: "{0} a modifié le projet {1} ",
    publisher: "Auteur",
    sort: "Déplacé {0} après {1}",
    start_date: "Date de début",
    subproject_assign: "{0} a assigné la composante {1} à {2}",
    subproject_close: "{0} a terminé la composante {1}",
    subproject_create: "{0} a créé une composante {1}",
    subproject_createWorkflowitem: "{0} a crée l’étape de workflow {1}",
    subproject_grantPermission_details: "{0} a modifié l'autorisation {1} à {2} de {3}",
    subproject_grantPermission: "{0} a modifié l'autorisation {1} à {2}",
    subproject_reorderWorkflowitems: "{0} a changé l'ordre des workflows",
    subproject_revokePermission_details: "{0} a révoqué l'autorisation {1} à {3} de {2}",
    subproject_revokePermission: "{0} a révoqué l'autorisation {1} de {2}",
    subproject_update: "{0} a modifié la composante {1} ",
    to: "{0} à {1}",
    workflowitem_assign: "{0} a assigné l’étape de workflow {1} à {2}",
    workflowitem_close: "{0} a terminé l’étape de workflow {1}",
    workflowitem_grantPermission_details: "{0} a modifié l'autorisation {1} à {2} de {3}",
    workflowitem_grantPermission: "{0} a modifié l'autorisation {1} à {2} de {3}",
    workflowitem_revokePermission_details: "{0} a révoqué l'autorisation {1} à {3} de {2}",
    workflowitem_revokePermission: "{0} a révoqué l'autorisation {1} à {3} de {2}",
    workflowitem_update_docs: "{0} a ajouté des documents au workflow {1} ",
    workflowitem_delete_docs: "{0} a supprimé des documents du workflow {1} ",
    workflowitem_update: "{0} a modifié le workflow {1} ",
    workflowitem_update_amount: "{0} a modifié le workflow {1} budget dans {2}",
    workflowitem_document_validated: "{0} document d'élément de flux de travail validé nommé {1} dans {2} ",
    workflowitem_document_invalidated:
      "{0} a utilisé un document différent dans le workflowitem pour valider le document nommé avec {1} dans {2} "
  },

  permissions: {
    admin: "Autorisations d'administrateur",
    dialog_title: "Définir les autorisations pour {0}",
    global_createGroup: "Créer des groupes",
    global_createProject: "Créer des projets",
    global_createUser: "Créer des utilisateurs",
    global_disableUser: "Désactiver les utilisateurs",
    global_enableUser: "Activer les utilisateurs",
    global_grantPermission: "Attribuer des autorisations globales à autres",
    global_listPermissions: "Afficher toutes les autorisations globales",
    global_revokePermission: "Révoquer des autorisations globales à autres",
    network_list: "Afficher tous les nœuds connectés",
    network_voteForPermission: "Voter si un nœud peut joindre le réseau",
    project_assign: "Changer le responsable projet",
    project_close: "Fermer le projet",
    project_createSubproject: "Créer des composantes",
    project_intent_grantPermission: "Accorder des autorisations",
    project_intent_listPermissions: "Afficher les autorisations",
    project_intent_revokePermission: "Révoquer des permissions",
    project_update: "Modifier le projet",
    project_viewDetails: "Voir les détails du projet",
    project_list: "Voir le projet en aperçu",
    read_only: "Autorisations en lecture seule",
    subproject_assign: "Attribuer la composante",
    subproject_close: "Fermer la composante",
    subproject_createWorkflowitem: "Créer des étapes de workflow",
    subproject_intent_grantPermission: "Accorder des autorisations sur la composante",
    subproject_intent_listPermissions: "Afficher les autorisations sur la composante",
    subproject_intent_revokePermission: "Révoquer des autorisations sur la composante",
    subproject_reorderWorkflowitems: "Réorganiser les étapes de workflow",
    subproject_update: "Mettre à jour la composante",
    subproject_viewDetails: "Voir les détails de la composante",
    subproject_list: "Voir la vue d'ensemble de la composante",
    view: "Autorisations de lecture",
    workflowitem_assign: "Assigner l’étape de workflow",
    workflowitem_close: "Fermer l’étape de workflow",
    workflowitem_intent_grantPermission: "Accorder des autorisations sur l’étape de workflow",
    workflowitem_intent_listPermissions: "Afficher les autorisations sur l’étape de workflow",
    workflowitem_intent_revokePermission: "Révoquer des autorisations sur l’étape de workflow ",
    workflowitem_update: "Mettre à jour l’étape de workflow",
    workflowitem_view: "Voir l’étape de workflow",
    write: "Autorisations d'écriture"
  },

  eventTypes: {
    project_created: "Projet créé",
    project_updated: "Projet mis à jour",
    project_assigned: "Projet assigné",
    project_closed: "Projet clôturé",
    project_permission_granted: "Permission de projet accordée",
    project_permission_revoked: "Permission de projet révoquée",
    project_projected_budget_updated: "Budget du projet mis à jour",
    project_projected_budget_deleted: "Budget du projet clôturé",

    subproject_created: "Composante créée",
    subproject_updated: "Composante mise à jour",
    subproject_assigned: "Composante assignée",
    subproject_closed: "Composante clôturée",
    subproject_permission_granted: "Permissions accordées",
    subproject_permission_revoked: "Permissions révoquées",
    subproject_projected_budget_updated: "Budget de la composante mis à jour",
    subproject_projected_budget_deleted: "Budget de la composante clôturé",

    workflowitem_created: " Étape de workflow créée",
    workflowitem_document_validated: "Document workflowitem validé",
    workflowitem_updated: " Étape de workflow mise à jour",
    workflowitem_assigned: " Étape de workflow assignée",
    workflowitem_closed: " Étape de workflow fermée",
    workflowitem_permission_granted: "Permission de travail accordée",
    workflowitem_permission_revoked: "Permission de travail révoquée",
    workflowitems_reordered: " Étapes de workflow réorganisées"
  },

  status: {
    average: "moyenne",
    connection: "connexion",
    fast: "rapide",
    no_ping_available: "pas de ping disponible",
    not_connected: "pas connecté",
    ping: "Ping",
    service: "Service",
    slow: "lent",
    version: "Version",
    very_slow: "très lent",
    error: "erreur",
    warning: "avertissement",
    done: "fait",
    toBeDone: "A faire"
  },

  language: {
    english: "Anglais",
    french: "Français",
    german: "Allemand",
    portuguese: "Portugues",
    georgian: "Géorgien"
  }
};

export default fr;
