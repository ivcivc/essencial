# Prompt para Desenvolvimento de Aplicação Web/Mobile: Sistema de Gestão para Clínica de Saúde Integrativa "Essencial"

## 1. Título do Projeto:
Sistema de Gestão Integrada para Clínica de Saúde Integrativa "Essencial" (Plataformas Web e Mobile)

## 2. Introdução e Contexto:
A "Essencial" é uma clínica de saúde integrativa focada no cuidado completo do indivíduo (corpo, mente e espírito), oferecendo atendimento personalizado e adaptado às necessidades de cada paciente. O objetivo deste projeto é desenvolver uma aplicação web/mobile abrangente para otimizar a gestão da clínica, melhorar a experiência do paciente e facilitar a coordenação entre os profissionais parceiros.

**Principais Serviços Oferecidos pela Clínica:**
Estética integrativa, Medicina funcional e integrativa, Nutricionista integrativa, Acupuntura, Psicologia integrativa, Terapia injetável, Massagem terapêutica, Ventosaterapia, Drenagem Linfática, Terapia capilar, Ozonioterapia, Desparasitação, Reestruturação intestinal.

## 3. Objetivo Principal da Aplicação:
Desenvolver uma plataforma centralizada, intuitiva e eficiente para gerenciar todos os aspectos operacionais e financeiros da clínica "Essencial", incluindo cadastro de pacientes, agendamentos, gestão de profissionais parceiros, controle de salas, serviços, produtos, estoque e finanças.

## 4. Plataformas Alvo:
* **Aplicação Web:** Para uso administrativo e pela equipe da clínica (recepcionistas, gestores, profissionais). Deve ser responsiva para acesso em desktops e tablets.
* **Aplicação Mobile (Opcional/Fases Futuras, mas considerar arquitetura):** Poderia ser para pacientes (agendamentos, lembretes) e/ou para profissionais parceiros (visualizar agenda, registrar evolução). Inicialmente, a aplicação web responsiva pode suprir a necessidade mobile para a equipe.

## 5. Módulos e Funcionalidades Detalhadas:

### 5.1. Módulo de Gestão de Pacientes:
* **Cadastro Completo:**
    * **Campos:** Nome completo, CPF, data de nascimento, telefone fixo, WhatsApp, e-mail, endereço completo (CEP com busca automática, rua, número, complemento, bairro, cidade, estado).
    * **Campos adicionais:** Como conheceu a clínica, indicações, observações gerais.
* **Prontuário Eletrônico Unificado:**
    * Visualização centralizada de todos os atendimentos, procedimentos realizados, exames anexados, e evolução dos tratamentos por paciente.
    * Histórico cronológico de interações e tratamentos.
    * Permissões de acesso ao prontuário por profissional (respeitando a LGPD).
* **Anexos:** Capacidade de anexar documentos e imagens ao prontuário do paciente (exames, termos de consentimento, fotos de evolução "antes e depois" para estética).
* **Busca e Filtros:** Pesquisa avançada de pacientes por nome, CPF, telefone.

### 5.2. Módulo de Gestão de Salas:
* **Cadastro de Salas:**
    * **Campos:** Nome da sala (ex: "Sala Acolher", "Consultório 1"), descrição/observações (ex: "Equipada para acupuntura e massagem", "Ideal para consultas médicas").
    * Recursos da sala (opcional, ex: maca, ar condicionado, pia).
* **Visualização de Ocupação:** Integrado ao módulo de agendamento para visualizar disponibilidade.

### 5.3. Módulo de Gestão de Parceiros (Profissionais):
* **Cadastro de Parceiros:**
    * **Campos:** Nome completo, CPF/CNPJ, telefone de contato, e-mail, especialidade(s) principal(is).
    * Endereço (se aplicável).
    * Dados bancários para repasses.
* **Configuração de Disponibilidade:**
    * Interface visual para definir dias de atendimento (Segunda a Domingo).
    * Horários de início e fim para cada dia da semana (com possibilidade de intervalos).
    * Bloqueio de datas/horários específicos (férias, imprevistos).
    * ***Requisito Crítico:*** *Acesso facilitado e claro desta informação para a equipe de atendimento durante o agendamento.*
* **Associação de Serviços:**
    * Selecionar quais serviços da clínica o parceiro está habilitado e oferece.
    * Definir valores específicos por serviço/parceiro, se necessário (para casos de porcentagem).
* **Tipos de Parceria e Lógica Financeira:**
    * **Sublocação:**
        * Registrar valor da sublocação e dia de vencimento do pagamento à clínica.
        * Sistema deve gerar lembrete/registro no contas a receber da clínica.
        * Paciente paga diretamente ao parceiro; a clínica não intermedia o pagamento do paciente.
    * **Porcentagem:**
        * Registrar o valor fixo a ser pago pela clínica ao parceiro por cada serviço prestado.
        * Paciente paga à clínica.
        * Sistema deve calcular o valor a ser repassado ao parceiro e lançar no contas a pagar da clínica após o atendimento.
    * **Porcentagem com Produto do Parceiro:**
        * Parceiro utiliza espaço da clínica e seus próprios produtos.
        * Paciente paga diretamente ao parceiro.
        * Parceiro informa à clínica o valor do serviço e o lucro obtido.
        * Sistema deve permitir o registro desse lucro e calcular o percentual (pré-combinado) a ser repassado pelo parceiro à clínica, lançando no contas a receber da clínica.

### 5.4. Módulo de Gestão de Produtos e Serviços & Controle de Estoque:
* **Cadastro de Serviços:**
    * **Campos:** Nome do serviço (ex: Acupuntura, Massagem Terapêutica, Botox), descrição, duração estimada, valor padrão (pode ser sobrescrito por regras de parceria).
    * Diferenciação clara para que apenas serviços sejam selecionáveis no agendamento pelo paciente.
    * Status do serviço (ativo/pausado temporariamente).
    * Vincular quais profissionais (parceiros) estão habilitados a realizar cada serviço.
    * Possibilidade de agrupar serviços em pacotes (opcional).
* **Cadastro de Produtos:**
    * **Campos:** Nome do produto (ex: Luvas descartáveis, Agulhas de acupuntura, Óleo de massagem), descrição, unidade de medida (unidade, caixa, ml), fornecedor.
    * Estes são insumos utilizados nos tratamentos, não vendidos diretamente, mas cujo custo pode ser embutido no serviço.
* **Controle de Estoque de Produtos:**
    * Registro de entrada (compra) e saída (uso em atendimento) de produtos.
    * Saldo atual em estoque.
    * Nível de estoque mínimo para alerta de reposição.
    * Histórico de movimentação de estoque.
    * Baixa automática de produtos vinculados a um serviço ao registrar o atendimento (opcional, com configuração).

### 5.5. Módulo de Agendamento e Atendimento:
* **Interface de Agendamento:**
    * Calendário visual (diário, semanal, mensal) com filtros por profissional, sala, tipo de serviço.
    * Visualização alternativa por salas (timeline de ocupação das salas).
    * ***Requisito Crítico:*** *Exibição clara e imediata da disponibilidade dos profissionais (conforme cadastro no módulo de parceiros) para evitar erros de marcação.*
    * Indicação de horários ocupados e livres.
* **Funcionalidades de Agendamento:**
    * Marcar nova consulta (selecionar paciente, serviço, profissional, sala – se aplicável, data, hora).
    * Identificar se é consulta nova ou retorno.
    * Desmarcar/Cancelar agendamento (com registro de motivo, se possível).
    * Remarcar agendamento.
    * Lista de espera para horários/profissionais concorridos (opcional).
* **Lembretes Automáticos:**
    * Configuração para envio de lembretes aos pacientes via WhatsApp, sms e/ou e-mail (X horas/dias antes da consulta).
    * Confirmação de presença (opcional, com resposta do paciente atualizando o status do agendamento).
* **Registro de Atendimento (Check-in/Checkout):**
    * Marcar presença do paciente (check-in).
    * Registrar observações do atendimento.
    * Permitir o fechamento/pagamento do atendimento.
    * Integração com o módulo financeiro para lançamento automático da receita (quando o paciente paga à clínica) e das comissões/repasses (para parceiros).

### 5.6. Módulo Financeiro:
* **Gestão de Contas:**
    * Cadastro de contas bancárias e caixa interno da clínica.
    * **Campos:** Nome da conta, banco, agência, número da conta, saldo inicial.
    * ***Requisito Crítico para Saldo Inicial:*** *O sistema deve permitir que o saldo inicial de uma conta seja ajustado dinamicamente com base na data do primeiro lançamento. Ex: se o primeiro lançamento de uma conta nova é em 10/04/2025, o saldo inicial informado deve ser considerado para essa data. Se um lançamento é editado para uma data anterior a todos os outros existentes, o saldo inicial deve "mover-se" para essa nova data mais antiga.*
* **Lançamentos Financeiros:**
    * Registro de Contas a Pagar e Contas a Receber.
    * **Campos:** Data de vencimento, data de pagamento/recebimento, descrição, valor, conta associada, paciente/fornecedor/parceiro associado, status (pendente, pago, vencido).
    * Permitir lançamentos retroativos e futuros, com recálculo automático dos saldos subsequentes da conta.
* **Classificação de Lançamentos:**
    * Categorias de receitas (ex: Consulta Medicina, Sessão Acupuntura, Venda Produto X).
    * Categorias de despesas (ex: Aluguel, Marketing, Materiais de consumo, Repasse Parceiro).
    * Centros de custo/lucro (opcional, ex: por tipo de serviço, por parceiro).
    * Talvez uma configuração da categoria para parceiros e sublocação. Isso para o moment do acerto de contas o lançamento conheça em qual conta deve lançar automaticamente.
* **Acerto com Parceiros:**
    * Geração automática de lançamentos no contas a pagar (para parceiros tipo "Porcentagem") ou contas a receber (para parceiros tipo "Sublocação" ou "Porcentagem com produto do parceiro") com base nos atendimentos registrados e no tipo de parceria.
    * Relatório de repasses a serem feitos/recebidos por parceiro.
* **Gestão de Pagamentos:**
    * Formas de pagamento (Dinheiro, Cartão de Crédito/Débito, PIX, Boleto).
    * Registro de pagamentos parciais.
    * Conciliação bancária (opcional, importação de extrato OFX/CNAB).
* **Recálculo de Saldos:**
    * Sempre que um lançamento for adicionado, editado, excluído, revertido ou cancelado, os saldos da conta afetada e os saldos futuros devem ser recalculados automaticamente.
* **Relatórios Financeiros Básicos:**
    * Fluxo de Caixa (diário, semanal, mensal).
    * Demonstrativo de Resultados do Exercício (DRE) simplificado.
    * Contas a pagar/receber por período.

## 6. Requisitos Não Funcionais:

* **Usabilidade e Experiência do Usuário (UX):** Interface intuitiva, limpa, de fácil aprendizado e uso, especialmente para recepcionistas e profissionais durante o agendamento e atendimento.
* **Segurança:**
    * Controle de acesso baseado em perfis de usuário (Administrador, Recepcionista, Profissional).
    * Conformidade com a LGPD (Lei Geral de Proteção de Dados) para dados de pacientes.
    * Backup regular dos dados.
    * Logs de auditoria para ações críticas.
* **Performance:** Sistema ágil, com tempos de resposta rápidos, mesmo com aumento no volume de dados.
* **Escalabilidade:** Arquitetura que permita crescimento futuro da clínica, adição de novos usuários, módulos e funcionalidades.
* **Responsividade:** Aplicação web deve ser acessível e funcional em diferentes tamanhos de tela (desktops, tablets).
* **Notificações:** Sistema de notificações internas (ex: novo agendamento para profissional) e externas (lembretes para pacientes).

## 7. Perfis de Usuário (Níveis de Acesso):

* **Administrador:** Acesso total a todas as funcionalidades e configurações do sistema.
* **Recepcionista/Atendente:** Acesso aos módulos de Pacientes (cadastro, visualização), Agendamento (completo), Salas, Parceiros (consulta de disponibilidade e serviços), Financeiro (lançamento de pagamentos de pacientes, fechamento de caixa diário).
* **Profissional Parceiro:** Acesso à sua própria agenda, visualização dos seus pacientes agendados, registro de evolução em prontuários (dos seus pacientes), visualização dos seus relatórios de atendimento/repasses. Acesso restrito a informações financeiras da clínica.
* **(Opcional) Gestor Financeiro:** Acesso completo ao módulo financeiro e relatórios.

## 8. Considerações Adicionais (Opcional / Desejável):

* **Relatórios Gerenciais:** Relatórios de produtividade por profissional, serviços mais procurados, taxa de ocupação de salas, ticket médio por paciente, etc.
* **Integrações Futuras:**
    * Gateway de pagamento online para pacientes.
    * API do WhatsApp Business para envio automatizado de mensagens.
    * Emissão de Nota Fiscal de Serviço Eletrônica (NFS-e).
* **Dashboard Inicial:** Com indicadores chave para cada perfil de usuário ao logar.

## 9. Entregáveis Esperados (Exemplos):
* Aplicação Web funcional e hospedada.
* (Se aplicável) Aplicação Mobile publicada nas lojas (Google Play, Apple App Store).
* Código fonte completo e documentado.
* Documentação técnica e do usuário.
* Sessões de treinamento para a equipe da clínica.
* Plano de suporte e manutenção pós-implantação.

## 10. Tecnologias Sugeridas (Opcional - a ser definido com a equipe de desenvolvimento):
* **Frontend: Modelo já instalado na pasta /frontend. Um modelo da Domiex em react 19. Usar apenas os componentes disponíveis. Consultar a documentação da domiex e ou o projeto completo do tema na pasta /template-domiex. Nesse projeto tem todos os exemplos de telas e recursos.
* **Backend: AdonisJs 6. Usar os recursos desse framework
* **Banco de Dados: MySql 8.0

## 11. Critérios Chave de Sucesso:
* Adoção bem-sucedida pela equipe da clínica.
* Redução de erros de agendamento.
* Otimização do tempo da equipe administrativa.
* Precisão e facilidade no controle financeiro e repasses a parceiros.
* Melhoria na organização dos prontuários e acompanhamento dos pacientes.
* Satisfação geral dos usuários (equipe e, indiretamente, pacientes).