# Documentação Detalhada - Sistema de Agendamentos

## Sumário
1. [Introdução](#introducao)
2. [Visão Geral das Funcionalidades](#visao-geral)
3. [Regras de Negócio](#regras-de-negocio)
4. [Configuração das Regras de Movimentação](#configuracao-regras)
5. [Fluxo de Movimentação de Agendamentos](#fluxo-movimentacao)
6. [Mensagens de Feedback e Erros](#feedback-erros)
7. [Dicas para Administradores](#dicas-admin)
8. [Observações Técnicas para Desenvolvedores](#observacoes-dev)
9. [FAQ](#faq)

---

## 1. <a name="introducao"></a>Introdução
Esta documentação detalha o funcionamento, regras e fluxos do sistema de agendamentos da Clínica Essencial, incluindo as novas regras configuráveis de movimentação, exemplos de uso e orientações para administradores e desenvolvedores.

---

## 2. <a name="visao-geral"></a>Visão Geral das Funcionalidades
- Calendário com drag & drop
- Agenda por horários e salas
- Lista de agendamentos com filtros
- Formulários inteligentes de criação e edição
- Sistema de validação centralizado
- Feedback visual padronizado
- Configuração de regras de movimentação por administradores

**Print:**
![Dashboard de Agendamentos](./prints/dashboard-agendamentos.png)

---

## 3. <a name="regras-de-negocio"></a>Regras de Negócio
- **Movimentação de agendamentos:**
  - Só é permitida conforme regras definidas pelo administrador.
  - Movimentação para datas passadas exige confirmação.
  - Não é permitido mover para horários indisponíveis do parceiro.
  - Regras para agendamentos concluídos/cancelados são configuráveis.
- **Validações:**
  - Conflitos de horário são detectados automaticamente.
  - Mensagens detalhadas orientam o usuário em cada situação.

**Exemplo de mensagem:**
> "Não é possível mover para este horário: o parceiro não está disponível."

---

## 4. <a name="configuracao-regras"></a>Configuração das Regras de Movimentação
- Acesse o menu de configurações (apenas administradores).
- Ative ou desative as opções:
  - Permitir mover agendamentos concluídos
  - Permitir mover agendamentos cancelados
- As regras são salvas automaticamente e aplicadas em todo o sistema.

**Print:**
![Tela de Configuração de Regras](./prints/configuracao-regras.png)

---

## 5. <a name="fluxo-movimentacao"></a>Fluxo de Movimentação de Agendamentos
1. Usuário arrasta o agendamento para nova data/horário.
2. O sistema valida as regras configuradas e disponibilidade do parceiro.
3. Se necessário, exibe modal de confirmação ou erro.
4. Ao confirmar, o agendamento é movido e feedback é exibido.

**Prints:**
- ![Drag & Drop no Calendário](./prints/drag-drop-calendario.png)
- ![Modal de Confirmação](./prints/modal-confirmacao.png)
- ![Mensagem de Erro](./prints/modal-erro.png)

---

## 6. <a name="feedback-erros"></a>Mensagens de Feedback e Erros
- Todas as mensagens são exibidas via `ModalFeedback`.
- Erros do backend são mostrados de forma clara ao usuário.
- Exemplos:
  - "Não é possível mover agendamentos concluídos."
  - "Horário não disponível para o parceiro."
  - "Movimentação para o passado requer confirmação."

---

## 7. <a name="dicas-admin"></a>Dicas para Administradores
- Utilize a tela de configurações para ajustar as regras conforme a política da clínica.
- Oriente a equipe sobre as mensagens de feedback e fluxos de confirmação.
- Revise periodicamente as regras para garantir aderência às necessidades do negócio.

---

## 8. <a name="observacoes-dev"></a>Observações Técnicas para Desenvolvedores
- As validações de movimentação estão centralizadas no hook `useValidacaoAgendamento` (`src/hooks`).
- O feedback ao usuário utiliza o componente `ModalFeedback`.
- As regras são persistidas via API `/api/configuracoes/agendamentos`.
- Para expandir regras, adicione no hook e ajuste o backend conforme necessário.

---

## 9. <a name="faq"></a>FAQ
- **Como adicionar novas regras de movimentação?**
  - Atualize o hook de validação e a tela de configurações.
- **Como inserir prints nesta documentação?**
  - Salve as imagens na pasta `prints/` e referencie no local apropriado.
- **Quem pode alterar as regras?**
  - Apenas administradores autenticados.

---

> **Observação:** Esta documentação pode ser expandida com mais prints, exemplos e tutoriais conforme a necessidade da equipe. 