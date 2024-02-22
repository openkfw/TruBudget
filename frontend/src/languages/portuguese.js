const pt = {
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
    action: "Ação",
    actions: "Ações",
    add_tag_text: "Adicionar tag ao projeto",
    add: "Adicionar",
    added: "Adicionado",
    additional_data: "Dados Adicionais",
    amount: "Valor",
    approver: "Aprovador",
    assign: "Atribuir",
    assigned_budget: "Orçamento atribuído",
    assigned: "Atribuído",
    assignees: "Responsável",
    back: "Voltar",
    bank: "Banco",
    budget_distribution: "Distribuição do orçamento",
    budget: "Orçamento",
    cancel: "Cancelar",
    close: "Fechar",
    closed: "Fechado",
    comment_description: "Adicione comentário",
    comment: "Comentário",
    completion: "Conclusão",
    confirm: "Confirme",
    create: "Criar",
    created: "Data de criação",
    currency: "Moeda",
    disbursed_budget: "Custo pago",
    disbursement: "Pagamentos programados",
    disconnected: "Desligada",
    display_name: "Mostrar nome",
    done: "Finalizar",
    download: "Download",
    edit: "Editar",
    edited: "Editado",
    email: "Email",
    finish: "Finalizar",
    global: "global",
    grant: "Conceder",
    hash: "Hash",
    history_end: "Fim do histórico",
    history: "Histórico",
    workflowitem_history: "História do item de workflow",
    subproject_history: "História do subprojeto",
    project_history: "História do projeto",
    id: "Id",
    in_progress: "Em andamento",
    in_review: "Em revisão",
    incorrect_password: "Senha incorreta",
    incorrect_username: "Id do usuário incorreto",
    incorrect_username_or_password: "ID ou palavra-passe de início de sessão incorrecta",
    invalid_tag: "Tag inválida",
    invalid_format: "Formato inválido",
    link: "Link",
    name: "Nome ou descrição do usuário",
    next: "Próximo",
    no_budget: "Nenhum orçamento encontrado",
    no_budget_project: "Para adicionar um orçamento para seu projeto, navegue de volta à página principal.",
    no_budget_subproject:
      "Para adicionar um orçamento para o seu subprojecto, volte à página de síntese do subprojecto.",
    no_budget_distribution: "Não é possível exibir a distribuição, se nem todos os itens estiverem visíveis",
    no_disabled_users: "Nenhum usuário desativado encontrado",
    no_groups: "Nenhum grupo encontrado",
    no_groups_text: "Crie um novo grupo pressionando o botão mais.",
    no_history: "Sem histórico",
    no_items_text: "Você pode criar um, pressionando o botão mais.",
    no_documents: "Nenhum documento encontrado",
    no_documents_upload_text: "Você pode adicionar um pressionando o botão de upload",
    no_documents_info_text: "Você pode editar o item de workflow de trabalho para adicionar documentos",
    no_nodes: "Nenhum pedido de nós aditonais encontrado",
    no_notifications: "Nenhuma notificação encontrada",
    no_organizations: "Nenhum pedido de novas organizações foi encontrado",
    no_permissions: "Você não tem permissão para realizar esta ação",
    no_resources: "Nenhum campo foi adicionado a este recurso",
    no_subprojects: "Nenhum subprojetos encontrado",
    no_users: "Nenhum usuário encontrado",
    no_users_text: "Adicione um novo usuário pressionando o botão mais.",
    no_workflow_items: "Nenhum itens de workflow encontrado",
    not_assigned_budget: "Orçamento não atribuído",
    not_assigned: "Não atribuído",
    not_disbursed: "Não pago",
    not_ok: "Não OK",
    off: "Desligado",
    on: "Ligado",
    ok: "Ok",
    not_projected: "Não projetado",
    open: "Aberto",
    organization: "Organização",
    password: "Senha",
    permission: "Permissão",
    project: "Projeto",
    projected_budget_exists: "O orçamento projetado já existe",
    projected_budget: "Orçamento projetado",
    redacted: "Redigido",
    reset: "Redefinir",
    revoke: "Revogar",
    reject: "Rejeitar",
    rejected: "Rejeitado",
    search: "Procurar",
    show_permissions: "Mostrar permissões",
    status: "Status",
    submit: "Enviar",
    subproject: "Subprojeto",
    subprojects: "Subprojetos",
    switch_to_table: "Mudar para visualização de tabela",
    tag_already_exists: "Tag já existe!",
    tag: "Tag",
    task_status: "Status da tarefa",
    thumbnail: "Miniatura",
    total_budget: "Orçamento total",
    type: "Tipo",
    update: "Atualizar",
    username: "Id do usuário",
    view: "Visualizar",
    view_project_details: "Visualizar detalhes do projeto",
    workflowitem: "Item de workflow",
    dueDate: "Data de vencimento",
    dueDate_exceeded: "Data de vencimento excedida",
    login_disabled: "O ID de login está desativado",
    login_data_error: "O campo de identidade ou senha de login não pode estar vazio",
    login_proxy_error: "A conexão com a API não pôde ser estabelecida! Verifique as configurações de proxy!",
    login_api_error: "A API não está acessível, certifique-se de que está em execução!",
    refresh_assignments: "Atualizar atribuições",
    tags: "Etiquetas",
    all: "Tudo",
    assignee: "Responsável"
  },

  users: {
    account_name: "Nome ou descrição do usuário",
    add_group: "Criar novo grupo",
    add_user: "Criar novo usuário",
    change_password_for: "Mudar senha para {0}",
    current_user_password: "Sua Senha",
    edit_group: "Editar grupo",
    edit_permissions_for: "Editar permissões para",
    group_created: "Grupo de usuários criado com sucesso",
    groups: "Grupos",
    invalid_password: "Sehna inválida",
    new_group: "Novo grupo de usuários",
    new_user_password_confirmation: "Confirme a Nova Senha",
    new_user_password: "Nova Senha",
    new_user: "Novo usuário",
    no_password_match: "Senhas não combinam",
    password_change_success: "Senha mudada com sucesso",
    password_conditions_length: "Ter no mínimo 8 caracteres",
    password_conditions_letter: "Conter pelo menos uma letra",
    password_conditions_number: "Conter pelo menos um número",
    password_conditions_preface: "Sua senha deve:",
    privacy_notice:
      "Por favor, certifique-se de não fornecer qualquer informação pessoal. Ao clicar em ENVIAR, os seus dados são guardados permanentemente e confirma a recepção da declaração de privacidade.",
    type_current_password: "Digite a senha atual para o {0}",
    type_new_password: "Digite a nova senha para o {0}",
    user_created: "Usuário criado com sucesso",
    username_invalid: "Nome de usuário Inválido",
    users: "Usuários",
    selected_users: "usuários selecionados",
    disabled_users: "Utilizadores desactivados",
    disable_user: "Desactivar utilizador",
    disable_userId: "Desativar usuário {0}",
    disable_user_successfull: "O seguinte utilizador foi desactivado: ",
    enable_user: "Restaurar utilizador",
    enable_userId: "Restaurar usuário {0}",
    enable_userId_confirm: "Você realmente deseja habilitar o usuário {0}?",
    enable_user_successfull: "O seguinte utilizador foi activado: ",
    no_assignments: "Sem atribuições",
    assigned_projects: "Projetos atribuídos",
    assigned_subprojects: "Assigned subprojects",
    assigned_workflowitems: "Assigned workflowitems",
    assigned_message: "Antes de desabilitar, este usuário deve ser desatribuído nos seguintes elementos",
    not_assigned_message:
      "Este usuário não está atribuído a nenhum projeto, subprojeto e item de fluxo de trabalho e pode ser desativado",
    hidden_assignments: "Mais redigido {0}"
  },

  userProfile: {
    invalid_email_address: "Endereço de email inválido"
  },

  nodesDashboard: {
    access: "Acesso",
    additional_organization_node: "Pedidos de nós adicionais",
    address: "Endereço",
    approve: "Aprovar",
    decline: "declínio",
    network: "Rede",
    new_organization: "Pedidos de novas organizações",
    nodes: "Nós",
    permissions: "Permissões",
    declined_by: "Recusado por",
    connection_status: "Status da conexão",
    last_seen: "Visto pela última vez",
    admin_description: "O nó admin é o nó inicial da rede e tem permissões adicionais 'mine' e 'admin'"
  },

  login: {
    environment: "Ambiente",
    loading: "Carregando ...",
    login_button_title: "Login",
    production_env: "Produção",
    test_env: "Teste",
    frontend_name: "TruBudget",
    frontend_description: "Uma solução baseada em blockchain para monitoramento de despesas orçamentárias",
    user_not_found: "Your user account has not been found. Please contact the administrator."
  },

  project: {
    add_new_project: "Criar novo projeto",
    assignee: "Proprietário",
    project_budget_amount: "Valor do orçamento do projeto",
    project_budget: "Orçamento",
    project_close_info: "Pelo menos um subprojeto permanece aberto",
    project_comment: "Comentário",
    project_currency: "Moeda",
    project_details: "Detalhes",
    project_edit_title: "Editar projeto",
    project_name: "Nome",

    project_roles: "Papéis",
    project_thumbnail: "Miniatura",
    project_title_description: "Descrição do projeto",
    project_title: "Nome do projeto",
    project_searchtext: "Pesquisar projectos"
  },

  subproject: {
    assignee: "Proprietário",
    fixed_workflowitem_type: "Tipo de item de fluxo de trabalho fixo",
    subproject_add_title: "Criar novo subprojeto",
    subproject_assigned_organization: "Organização responsável",

    subproject_budget_amount: "Valor do orçamento do subprojeto",
    subproject_close_info: "Pelo menos um item do fluxo de trabalho ainda não foi fechado",
    subproject_close_not_allowed: "Você não tem permissão para fechar o subprojeto",
    subproject_comment: "Comentário do subprojeto",
    subproject_completion_string: "{0} de {1} finalizado",
    subproject_currency: "Moeda do subprojeto",
    subproject_edit_title: "Editar subprojeto",

    subproject_preview: "Pré-visualização de subprojeto",
    subproject_select_button: "Selecionar",
    subproject_title_description: "Descrição do subprojeto",
    subproject_title: "Nome do subprojeto",
    subproject_searchtext: "Subprojetos de pesquisa",
    subproject_any_workflowitem_type: "Permitir que itens de fluxo de trabalho selecionem o tipo geral ou restrito",
    subproject_general_workflowitem_type: "Permitir apenas itens de fluxo de trabalho do tipo geral",
    subproject_restricted_workflowitem_type:
      "Permitir apenas item de fluxo de trabalho do tipo restrito. Ao atribuir um item de fluxo de trabalho restrito, as permissões são concedidas e revogadas automaticamente. O atribuidor manterá apenas as permissões de visualização.",
    workflowitem_assignee: "Cessionário padrão"
  },

  workflow: {
    add_item: "Criar item de workflow",
    add_tag_wfi_text: "Adicionar tag a item de workflow",
    approval_required: "Aprovação necessária",
    assignee: "Responsável",
    edit_item: "Editar item de workflow",
    exit_sort_mode:
      "Este botão agora está desativado. Saia do modo de classificação para criar novos itens de fluxo de trabalho",
    exchange_rate: "Taxa de câmbio",
    search_text: "Buscar",
    workflow_budget_allocated: "Alocado",
    workflow_budget_disbursed: "pago",
    workflow_budget_na: "Não se aplica",
    workflow_budget_status_allocated: "Atribuído",
    workflow_budget_status_disbursed: "Pago",
    workflow_budget_status_na: "N/A",
    workflow_budget: "Montante do orçamento",
    workflow_comment: "Comentário do item de workflow",
    workflow_disable_sort: "Salvar",
    workflow_document_changed: "Alterado",
    workflow_document_description: "Digite um nome para o documento",
    workflow_document_name: "Nome do documento",
    workflow_document_not_available: "Documento não disponível",
    workflow_document_validate: "Validar",
    workflow_document_validated: "Validado",
    workflow_document_validation_not_ok: "Documento diferente",
    workflow_document_validation_ok: "Documento idêntico",
    workflow_documents: "Documentos",
    workflow_enable_sort: "Ordenar",
    workflow_fingerprint: "Miniatura",
    workflow_name: "Nome",
    workflow_next_step: "Próxima etapa",
    workflow_no_actions: "Nenhuma ação necessária",
    workflow_no_documents: "Não há documentos",
    workflow_none: "Nenhum",
    workflow_permissions_title: "Configurar permissões para item de workflow",
    workflow_redacted: "Editado por privacidade",
    workflow_reject_reason: "Rejeitar a razão",
    workflow_selection: "Você selecionaou {0} itens de workflows",
    workflow_submit_for_review: "Enviar para revisão",
    workflow_table_title: "Lista de itens de workflow",
    workflow_title_description: "Descrição do item de workflow",
    workflow_title: "Nome do item de workflow",
    workflow_type_transaction: "Transação",
    workflow_type_workflow: "Workflow",
    workflow_type: "Categoria",
    workflow_upload_document: "Autenticar",
    workflowitem_details_documents: "Documentos",
    workflowitem_details_history: "Histórico",
    workflowitem_details_overview: "Visão geral",
    workflowitem_details: "Detalhes do item de workflow",
    workflowitem_type_general: "Criar un item de workflow do tipo general.",
    workflowitem_type_restricted:
      "Ao atribuir um fluxo de trabalho restrito, as permissões são automaticamente concedidas e revogadas. O cedente manterá apenas as permissões de visualização.",
    workflowitem_type: "Categoria do item de workflow"
  },

  workflowTemplate: {
    monitoring: "Monitoramento/Execução",
    tender: "Concurso",
    payments: "Pagamentos"
  },

  snackbar: {
    update_succeed_message: "Modificado com sucesso {0}",
    creation_succeed_message: "{0} criado com sucesso",
    permissions_warning: "Nenhuma permissão alocada para {0}"
  },

  searchBar: {
    quick_search: "Pesquisa rápida"
  },

  preview: {
    actions_done: "{0} de {1} ações realizadas",
    assign_action_text: "Atribuir {0}",
    grant_permission_action_text: "Conceder {0} para {1}",
    not_possible_action: "Não há ações possíveis",
    possible_action: "Ações possíveis",
    preview: "Pré-visualização",
    revoke_permission_action_text: "Revogar {0} de {1}",
    overwrite: "sobrescrever",
    overwrite_warning:
      "Aviso: Isso redefine todas as permissões para a seleção atual. Se você deseja adicionar ou remover apenas algumas permissões, você deve ir para a caixa de diálogo de permissão de cada item de fluxo de trabalho."
  },

  confirmation: {
    assign_permissions: "Atribuir permissões",
    additional_permissions_dialog_text:
      "Ações adicionais devem ser executadas para garantir que os usuários também possam visualizar todos os recursos necessários.",
    confirmation_required: "Confirmação necessária",
    execute_actions: "Executar ações",
    failed_action_error:
      "Erro: concedeu {0} a {1} falhou. Todas as ações que teriam sido executadas após o erro, incluindo as ações originais, foram canceladas.",
    grant_and_assign: "Grant & Assign",
    list_permissions_required_text:
      "Verifique se você tem permissões de lista necessárias para todos os recursos envolvidos",
    no_permission_warning: "Necessita das seguintes permissões para executar todas as acções solicitadas:",
    no_permission_help:
      "Os Utilizadores seguintes estão autorizados a conceder-lhe permissões sobre os Recursos necessários:",
    original_actions: "Solicitou as seguintes acções:",
    permissions_required: "Permissões necessárias",
    permissions_text: `{0} precisa de permissões adicionais para visualizar {1} "{2}".`,
    post_actions_dialog_text: "Tem certeza de que deseja criar o workflowitem",
    project_close: "Fechar projecto",
    project_close_text: "Tem a certeza de que quer encerrar este projecto?",
    subproject_close: "Fechar subprojecto",
    subproject_close_text: "Tem a certeza de que quer encerrar este subprojecto?",
    user_group: "Usuários/Grupo",
    workflowitem_close: "Fechar item de workflow",
    workflowitem_close_text: "Tem a certeza de que quer encerrar este item do fluxo de trabalho?",
    workflowitem_create: "Criar item de fluxo de trabalho",
    workflowitem_close_accept: "Aceitar",
    workflowitem_close_reject: "Rejeitar com comentários"
  },

  intents: {
    assign: "atribuir",
    close: "fechar",
    createSubproject: "criar subprojetos",
    createWorkflowitem: "criar items de workflow",
    grantPermission: "conceder permissões",
    listPermissions: "ver permissões",
    reorderWorkflowitems: "reordenar  items de workflow",
    revokePermission: "revogar permission",
    update: "atualizar",
    viewDetails: "ver detalhes",
    viewHistory: "ver história",
    list: "ver resumo"
  },

  analytics: {
    assigned_budget_ratio: "% do Orçamento Atribuído",
    available_unspent_budget: "Orçamento Disponível",
    converted_amount: "Valor convertido",
    disbursed_budget_ratio: "Taxa de pagamento (pago / alocado)",
    insufficient_permissions_text:
      "Um ou mais itens do fluxo de trabalho são editados. As análises são ocultas porque seriam falsificadas.",
    project_analytics: "Dashboard do Projeto",
    projected_budget_ratio: "% do Orçamento Projetado",
    projected_budgets_distribution: "Distribuição dos orçamentos projetados",
    subproject_analytics: "Dashboard do Subprojeto",
    total_budget_distribution: "Distribuição do Orçamento Total",
    total: "Total:"
  },

  navigation: {
    admin_permission: "Admin",
    backup: "Backup",
    connected_peers: "Pares conectados",
    disconnected_peers: "Sem pares conectados",
    logout: "Logout",
    main_site: "Principal",
    menu_item_export: "Exportar",
    menu_item_network: "Rede",
    menu_item_notifications: "Notificações",
    menu_item_projects: "Projetos",
    menu_item_users: "Usuários",
    no_peers: "Desconectado",
    options: "Opções",
    peers: "Nós",
    projects_site: "Projetos",
    restore: "Restore",
    rtUpdates: "Atualizações em tempo real",
    selections: "Menu",
    service_status: "Status do serviço",
    unread_notifications: "Notificações não lidas",
    write_permission: "Escrita"
  },

  notification: {
    next_page: "Próximo site",
    previous_page: "Site anterior",
    rows_per_page: "Linhas por página",
    create_transaction: "Transação {0} criada ",
    create_workflow: "Item de workflow {0} criado ",
    done_transaction: "Status da transação {0} alterado para Finalizado",
    done_workflow: "Status do item de workflow {0} alterado para Finalizado",
    edit_transaction: "Transação {0} foi adaptada ",
    edit_workflow: "Item de workflow {0} foi adaptado ",
    email_saved: "Email {0} salvo",
    no_permissions: "(Sem permissão para visualizar mais detalhes)",
    notification_subtitle: "Não lidas",
    notification_table_all_read: "Todas lidas",
    notification_table_by: "Por",
    notification_table_description: "Descrição",
    notification_table_project: "Projetos",
    notification_table_role: "Papel",
    notification_table_subproject: "Subprojetos",
    notification_table_view: "Ler",
    notification_title: "Notificações",
    project_assign: "Projeto {0} foi atribuído a você",
    project_assigned: "Projeto {0} foi atribuído a você",
    project_close: "Projeto {0} foi fechado",
    project_closed: "Projeto {0} foi fechado",
    project_createSubproject: "Um novo subprojeto foi criado para o projeto {0}",
    project_intent_grantPermission: "As permissões para o projeto {0} foram alteradas",
    project_intent_revokePermission: "As permissões para o projeto {0} foram alteradas",
    project_projected_budget_deleted: "Orçamento projetado para o projeto {0} foi excluído",
    project_projected_budget_updated: "Orçamento projetado para o projeto {0} foi atualizado",
    project_update: "Projeto {0} foi atualizado",
    project_updated: "Projeto {0} foi atualizado",
    read_all: "Marcar todas como lidas",
    review_transaction: "Você foi solicitado a revisar a transação {0}",
    review_workflow: "Você foi solicitado a revisar o item de workflow {0}",
    save_email_error: "Não foi possível salvar o email",
    subproject_assign: "Subprojeto {0} foi atribuído a você",
    subproject_assigned: "Subprojeto {0} foi atribuído a você",
    subproject_close: "Subprojeto {0} foi fechado",
    subproject_closed: "Subprojeto {0} foi fechado",
    subproject_createWorkflowitem: "Um novo item de workflow foi criado para o subprojeto {0}",
    subproject_intent_grantPermission: "As permissões para o subprojeto {0} foram alteradas",
    subproject_intent_revokePermission: "As permissões para o subprojeto {0} foram alteradas",
    subproject_projected_budget_deleted: "Orçamento projetado do subprojeto {0} foi excluído",
    subproject_projected_budget_updated: "Orçamento projetado do subprojeto {0} foi atualizado",
    subproject_reorderWorkflowitems: "Os items de workflow do subprojeto {0} foram reordenados",
    subproject_update: "Subprojeto {0} foi atualizado",
    subproject_updated: "Subprojeto {0} foi atualizado",
    workflowitem_assign: "Item de workflow {0} foi atribuído a você",
    workflowitem_assigned: "Item de workflow {0} foi atribuído a você",
    workflowitem_close: "Item de Workflow {0} foi fechado",
    workflowitem_closed: "Item de Workflow {0} foi fechado",
    workflowitem_intent_grantPermission: "As permissões para o item de workflow {0} foram alteradas",
    workflowitem_intent_revokePermission: "As permissões para o item de workflow {0} foram alteradas",
    workflowitem_update: "Item de Workflow {0} foi atualizado",
    workflowitem_updated: "Item de Workflow {0} foi atualizado",
    payload_error_message:
      "Ops! ... Não é sua culpa - Ocorreu um erro de validação do lado do cliente. Informe o administrador."
  },

  history: {
    edit_currency: "Moeda do workflow {0} mudou para {1} ",
    edit_documents: "Documentos alterados para workflow {0}",
    edit_status: "Status do workflow {0} mudou para {1}",
    edit_subproject: "Valor de {0} subiu para {1}",
    edit_workflowName: "Nome do item de workflow {0} mudou para {1} ",
    end_date: "data final",
    event_type: "Event Typ",
    first_sort: "{0} foi movido para a primeira posição",
    project_assign: "{0} atribuiu projeto {1} para {2}",
    project_close: "Projeto fechado",
    project_create: "{0} criou projeto {1}",
    project_createSubproject: "{0} criou subprojeto {1}",
    project_grantPermission_details: "{0} concedeu permissão {1} para {2} para {3}",
    project_grantPermission: "{0} concedeu permissão {1} para {2}",
    project_projected_budget_deleted: "{0} excluiu o orçamento projetado para {1}",
    project_projected_budget_updated: "{0} atualizou o orçamento projetado para {1}",
    project_revokePermission_details: "{0} revogou permissão {1} em {3} de {2}",
    project_revokePermission: "{0} revogou permissão {1} de {2}",
    project_update: "{0} modificou o projeto {1} ",
    publisher: "Editor",
    sort: "{0} foi movido após {1}",
    start_date: "Data de início",
    subproject_assign: "{0} atribuiu subprojeto {1} para {2}",
    subproject_close: "{0} fechou subprojeto {1}",
    subproject_create: "{0} criou subprojeto {1}",
    subproject_createWorkflowitem: "{0} criou item de workflow {1}",
    subproject_grantPermission_details: "{0} concedeu permissão {1} para {2} em {3}",
    subproject_grantPermission: "{0} concedeu permissão {1} para {2}",
    subproject_reorderWorkflowitems: "{0} alterou a ordem dos items de workflow",
    subproject_revokePermission_details: "{0} revogou permissão {1} em {3} de {2}",
    subproject_revokePermission: "{0} revougou permissão {1} de {2}",
    subproject_update: "{0} modificou o subprojeto {1} ",
    to: "{0} para {1}",
    workflowitem_assign: "{0} atribuiu item de workflow {1} para {2}",
    workflowitem_close: "{0} fechou item de workflow {1}",
    workflowitem_grantPermission_details: "{0} concedeu permissão {1} para {2} em {3}",
    workflowitem_grantPermission: "{0} concedeu permissão {1} para {2} em {3}",
    workflowitem_revokePermission_details: "{0} revogou permissão {1} em {3} de {2}",
    workflowitem_revokePermission: "{0} revogou permissão {1} em {3} de {2}",
    workflowitem_update_docs: "{0} adicionou documentos ao item de workflow {1} ",
    workflowitem_update: "{0} modificou o item de workflow {1} ",
    workflowitem_update_amount: "{0} modificou o item de workflow {1} despesas dentro {2} ",
    workflowitem_document_validated: "{0} documento de item de fluxo de trabalho validado denominado {1} em {2} ",
    workflowitem_document_invalidated:
      "{0} usado documento diferente no item de fluxo de trabalho para validar o documento nomeado com {1} em {2} "
  },

  permissions: {
    admin: "Permissões Admin",
    dialog_title: "Definir permissões para {0}",
    global_createGroup: "Criar grupos",
    global_createProject: "Criar projetos",
    global_createUser: "Criar usuários",
    global_disableUser: "Desativar usuários",
    global_enableUser: "Habilitar usuários",
    global_grantPermission: "Conceder permissões globais para outros",
    global_listPermissions: "Listar todas as permissões globais",
    global_revokePermission: "Revogar permissões globais para outros",
    network_list: "Listar todos os nós conectados",
    network_voteForPermission: "Votar se um nó pode aderir à rede",
    project_assign: "Atribuir projeto a outros",
    project_close: "Fechar projeto",
    project_createSubproject: "Criar subprojetos",
    project_intent_grantPermission: "Conceder permissões do projeto",
    project_intent_listPermissions: "Visualizar permissões do projeto",
    project_intent_revokePermission: "Revogar permissões do projeto",
    project_update: "Atualizar projeto",
    project_viewDetails: "Visualizar detalhes do projeto",
    project_list: "Visualizar dados gerais do projeto",
    read_only: "Permissões somente leitura",
    subproject_assign: "Atribuir subprojeto a outros",
    subproject_close: "Fechar subprojeto",
    subproject_createWorkflowitem: "Criar item de workflow",
    subproject_intent_grantPermission: "Conceder permissões do subprojeto",
    subproject_intent_listPermissions: "Visualizar permissões do subprojeto",
    subproject_intent_revokePermission: "Revogar permissões do subprojeto",
    subproject_reorderWorkflowitems: "Reordenar items de workflow",
    subproject_update: "Atualizar subprojeto",
    subproject_viewDetails: "Visualizar detalhes do subprojeto",
    subproject_list: "Visualizar dados gerais do subprojeto",
    view: "Permissões de leitura",
    workflowitem_assign: "Atribuir item de workflow a outros",
    workflowitem_close: "Fechar item de workflow",
    workflowitem_intent_grantPermission: "Conceder permissões do item de workflow",
    workflowitem_intent_listPermissions: "Visualizar permissões do item de workflow",
    workflowitem_intent_revokePermission: "Revogar permissões do item de workflow",
    workflowitem_update: "Atualizar item de worflow",
    workflowitem_view: "Visualizar item de workflow",
    write: "Permissões de escrita"
  },

  eventTypes: {
    project_created: "Projecto criado",
    project_updated: "Projecto actualizado",
    project_assigned: "Projecto atribuído",
    project_closed: "Projecto encerrado",
    project_permission_granted: "Permissao concedida ao projecto",
    project_permission_revoked: "Autorização de projecto revogada",
    project_projected_budget_updated: "Orçamento do projecto actualizado",
    project_projected_budget_deleted: "Orçamento do projecto encerrado",

    subproject_created: "Subprojecto criado",
    subproject_updated: "Subprojecto actualizado",
    subproject_assigned: "Subprojecto atribuído",
    subproject_closed: "Subprojecto encerrado",
    subproject_permission_granted: "Autorização concedida ao subprojecto",
    subproject_permission_revoked: "Autorização de subprojecto revogada",
    subproject_projected_budget_updated: "Orçamento do subprojecto actualizado",
    subproject_projected_budget_deleted: "Orçamento do subprojecto encerrado",

    workflowitem_created: "Workflowitem criado",
    workflowitem_document_validated: "Documento de item de fluxo de trabalho validado",
    workflowitem_updated: "Workflowitem actualizado",
    workflowitem_assigned: "Workflowitem assigned",
    workflowitem_closed: "Workflowitem encerrado",
    workflowitem_permission_granted: "Workflowitem permisision granted",
    workflowitem_permission_revoked: "Workflowitem permission revoked",
    workflowitems_reordered: "Reordenação dos fluxos de trabalho"
  },

  status: {
    average: "média",
    connection: "conexão",
    fast: "velozes",
    no_ping_available: "nenhum ping disponível",
    not_connected: "não conectado",
    ping: "Ping",
    service: "Service",
    slow: "lento",
    version: "versão",
    very_slow: "muito lento",
    error: "Erro",
    warning: "Advertência",
    done: "feito",
    toBeDone: "A fazer"
  },

  language: {
    english: "English",
    french: "Français",
    german: "Deutsch",
    portuguese: "Português",
    georgian: "Georgiano"
  }
};

export default pt;
