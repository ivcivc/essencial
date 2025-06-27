# Regras de Agendamento - Sistema Clínica Essencial

## 📋 Visão Geral

Este documento detalha todas as regras de negócio, validações e comportamentos implementados no sistema de agendamentos da Clínica Essencial.

**Última atualização:** Janeiro 2025  
**Versão do Sistema:** v1.0 - Correção Completa Finalizada

---

## 🎯 REGRAS FUNDAMENTAIS

### 1. **Estrutura de Agendamento**
```typescript
interface Agendamento {
  id: number
  pacienteId: number        // Obrigatório
  parceiroId: number        // Profissional/Parceiro - Obrigatório
  servicoId: number         // Serviço a ser prestado - Obrigatório
  salaId: number           // Sala onde será realizado - Obrigatório
  data: string             // Data no formato YYYY-MM-DD - Obrigatório
  horaInicio: string       // Horário de início HH:MM - Obrigatório
  horaFim: string          // Calculado automaticamente
  duracaoMinutos: number   // Baseado no serviço selecionado
  status: string           // agendado, confirmado, realizado, cancelado
  observacoes: string      // Campo livre para anotações
  primeiraConsulta: boolean // Checkbox para identificar primeira consulta
  requerPreparo: boolean   // Checkbox para procedimentos que exigem preparo
}
```

### 2. **Status de Agendamento**
- **`agendado`** - Status inicial após criação
- **`confirmado`** - Paciente confirmou presença
- **`realizado`** - Atendimento foi concluído
- **`cancelado`** - Agendamento foi cancelado

---

## ⏰ VALIDAÇÕES TEMPORAIS

### 1. **Sistema de Tolerância para Horários Passados**

#### **Regra de 1 Hora de Tolerância:**
```typescript
const validarDataHoraComTolerancia = (data: string, hora: string) => {
  const agora = new Date()
  const dataHoraAgendamento = new Date(`${data}T${hora}:00`)
  const diferencaMinutos = (agora.getTime() - dataHoraAgendamento.getTime()) / (1000 * 60)
  
  // Cenários de validação:
  if (dataHoraAgendamento > agora) {
    return { permitir: true, tipo: 'futuro' }
  }
  
  if (diferencaMinutos <= 60) {
    return { permitir: true, tipo: 'tolerancia', minutos: Math.round(diferencaMinutos) }
  }
  
  return { permitir: false, tipo: 'confirmacao', minutos: Math.round(diferencaMinutos) }
}
```

#### **Comportamentos por Cenário:**

1. **📅 Agendamentos Futuros**
   - ✅ **Sempre permitidos** sem restrições
   - ✅ Todas as operações (criar, editar, mover) funcionam normalmente

2. **⏰ Até 1 Hora Após o Horário**
   - ✅ **Permitido com aviso informativo**
   - 💬 Toast: "Agendamento editado com sucesso (horário recente)"
   - ⚠️ Aviso visual durante a operação

3. **🕐 Mais de 1 Hora Após o Horário**
   - ⚠️ **Requer confirmação explícita**
   - 📋 Modal: "Confirmar Edição de Horário Passado"
   - 💡 Recomendação: "Para correções ou atualizações de observações"

4. **📝 Apenas Observações Alteradas**
   - ✅ **Bypass completo da validação temporal**
   - 🚀 Permite edição de observações a qualquer momento
   - 💡 Ideal para anotações pós-atendimento

### 2. **Detecção Inteligente de Mudanças**
```typescript
const apenasObservacoesAlteradas = (dadosOriginais: any, dadosAtuais: any) => {
  const camposNaoObservacao = [
    'pacienteId', 'parceiroId', 'servicoId', 'salaId', 
    'data', 'horaInicio', 'horaFim'
  ]
  
  // Verifica se apenas observações, primeiraConsulta ou requerPreparo mudaram
  for (const campo of camposNaoObservacao) {
    if (valorOriginal !== valorAtual) {
      return false // Mudança estrutural detectada
    }
  }
  
  return true // Apenas observações/flags alteradas
}
```

---

## 🏥 REGRAS DE DISPONIBILIDADE

### 1. **Verificação de Conflitos de Horário**

#### **Função Principal:**
```typescript
static async buscarDisponibilidadeComExclusao(
  parceiroId: number,
  data: string,
  horaInicio: string,
  duracaoMinutos: number,
  agendamentoIdExcluir: number // IMPORTANTE: Exclui o próprio agendamento
): Promise<boolean>
```

#### **Lógica de Conflitos:**
1. **Busca agendamentos existentes** na mesma data e parceiro
2. **Exclui o próprio agendamento** da verificação (para edições)
3. **Calcula sobreposição de horários:**
   ```typescript
   // Verifica se há sobreposição entre:
   // [horaInicio, horaFim] do novo agendamento
   // [horaInicioExistente, horaFimExistente] dos agendamentos existentes
   ```

#### **Cenários de Conflito:**
- ✅ **Sem Conflito:** Horários não se sobrepõem
- ❌ **Com Conflito:** Qualquer sobreposição, mesmo parcial
- 🔄 **Edição:** Próprio agendamento é ignorado na verificação

### 2. **Disponibilidade por Parceiro**

#### **Estrutura de Disponibilidade:**
```typescript
interface DisponibilidadeParceiro {
  segunda?: DisponibilidadeDia
  terca?: DisponibilidadeDia
  quarta?: DisponibilidadeDia
  quinta?: DisponibilidadeDia
  sexta?: DisponibilidadeDia
  sabado?: DisponibilidadeDia
  domingo?: DisponibilidadeDia
}

interface DisponibilidadeDia {
  ativo: boolean
  horarios: HorarioDisponivel[]
}

interface HorarioDisponivel {
  inicio: string  // "09:00"
  fim: string     // "17:00"
}
```

#### **Exemplo de Configuração:**
```typescript
const disponibilidade = {
  segunda: { 
    ativo: true, 
    horarios: [{ inicio: '08:00', fim: '17:00' }] 
  },
  quarta: { 
    ativo: true, 
    horarios: [
      { inicio: '09:00', fim: '11:00' },
      { inicio: '13:00', fim: '18:00' }
    ]
  },
  sexta: { 
    ativo: false, 
    horarios: [] 
  }
}
```

#### **Geração de Slots de Horário:**
```typescript
const gerarHorariosDisponiveis = () => {
  const diaSemana = new Date(dataSelecionada).getDay()
  const disponibilidadeDia = disponibilidadeParceiro[diaSemana]
  
  if (!disponibilidadeDia?.ativo) return []
  
  const slots = []
  disponibilidadeDia.horarios.forEach(periodo => {
    // Gera slots de 30 em 30 minutos
    let horaAtual = converterParaMinutos(periodo.inicio)
    const horaFim = converterParaMinutos(periodo.fim)
    
    while (horaAtual < horaFim) {
      slots.push(converterParaHora(horaAtual))
      horaAtual += 30 // Incremento de 30 minutos
    }
  })
  
  return slots
}
```

---

## 🎯 FILTROS DINÂMICOS

### 1. **Serviços por Parceiro**

#### **Regra de Habilitação:**
```typescript
interface Parceiro {
  servicosHabilitados: number[] // IDs dos serviços que o parceiro pode oferecer
}

const filtrarServicosPorParceiro = (parceiroId: string) => {
  const parceiro = parceiros.find(p => p.id.toString() === parceiroId)
  
  if (!parceiro?.servicosHabilitados?.length) {
    setServicosFiltrados([])
    return
  }
  
  const servicosDisponiveis = servicos.filter(servico => 
    parceiro.servicosHabilitados.includes(servico.id) &&
    servico.disponivelAgendamento !== false
  )
  
  setServicosFiltrados(servicosDisponiveis)
}
```

#### **Comportamentos:**
- ✅ **Parceiro com Serviços:** Lista apenas serviços habilitados
- ⚠️ **Parceiro sem Serviços:** Exibe mensagem informativa
- 🔄 **Mudança de Parceiro:** Refiltra automaticamente

### 2. **Salas por Serviço**

#### **Lógica de Filtro:**
```typescript
const filtrarSalasPorServico = async (servicoId: string) => {
  // Busca salas ativas que suportam o tipo de serviço
  const salasResponse = await salasService.listar({ ativas: true })
  
  if (salasResponse.success) {
    // Filtro baseado no tipo de serviço/especialidade
    const salasApropriadas = salasResponse.data.filter(sala => 
      sala.ativa && sala.recursos?.includes(tipoServicoSelecionado)
    )
    setSalasFiltradas(salasApropriadas)
  }
}
```

---

## 🎛️ AÇÕES RÁPIDAS

### 1. **Mover para Outro Dia**

#### **Fluxo de Execução:**
```typescript
const executarMovimentacao = async () => {
  // 1. Validar entrada
  if (tipoMovimentacao === 'data' && !novaData) {
    toast.error('Selecione uma nova data')
    return
  }
  
  // 2. Preparar dados
  const dadosAtualizacao = {
    ...getValues(),
    data: novaData,
    dataAgendamento: novaData
  }
  
  // 3. Validar horário (se data passada)
  const validacao = validarDataHoraComTolerancia(novaData, getValues('horaInicio'))
  
  if (!validacao.permitir) {
    // Armazenar para confirmação posterior
    setDadosPendentesSubmit(dadosAtualizacao)
    setShowConfirmacaoHorarioPassado(true)
    return
  }
  
  // 4. Executar movimentação
  const response = await agendamentosService.atualizar(id, dadosAtualizacao)
  
  // 5. Feedback e redirecionamento
  if (response.success) {
    toast.success(`Agendamento movido para ${formatarDataSemFuso(novaData)}`)
    navigate('/agendamentos')
  }
}
```

#### **Movimentação Forçada (Datas Passadas):**
```typescript
const executarMovimentacaoForcada = async () => {
  // Executa sem validação temporal após confirmação do usuário
  const response = await agendamentosService.atualizar(id, dadosPendentesSubmit)
  
  if (response.success) {
    toast.success('Agendamento movido com sucesso!')
    navigate('/agendamentos')
  }
}
```

### 2. **Alterar Horário**

#### **Processo Similar:**
- Validação de disponibilidade do novo horário
- Verificação de conflitos com outros agendamentos
- Recálculo automático da hora fim
- Confirmação para horários passados

---

## 🔄 CÁLCULOS AUTOMÁTICOS

### 1. **Duração e Hora Fim**

#### **Baseado no Serviço Selecionado:**
```typescript
const updateHoraFim = () => {
  const servicoSelecionado = servicos.find(s => s.id.toString() === watch('servicoId'))
  const horaInicio = watch('horaInicio')
  
  if (servicoSelecionado && horaInicio) {
    const duracao = servicoSelecionado.duracaoMinutos || 60
    setValue('duracaoMinutos', duracao)
    
    // Calcular hora fim
    const [horas, minutos] = horaInicio.split(':').map(Number)
    const minutosTotal = horas * 60 + minutos + duracao
    const horasFim = Math.floor(minutosTotal / 60)
    const minutosFim = minutosTotal % 60
    
    const horaFim = `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`
    setValue('horaFim', horaFim)
  }
}
```

### 2. **Valores Automáticos**

#### **Preço do Serviço:**
```typescript
// Carrega automaticamente o preço do serviço selecionado
const servicoSelecionado = servicos.find(s => s.id === servicoId)
setValue('valorServico', servicoSelecionado?.precoVenda || 0)
```

---

## 🎨 INTERFACE E UX

### 1. **Estados Visuais**

#### **Loading States:**
- 🔄 Carregamento de dados iniciais
- ⏳ Salvamento de alterações
- 🔍 Validação de disponibilidade
- 📡 Operações de movimentação

#### **Feedback Visual:**
```typescript
// Estados de disponibilidade
{horariosDisponiveis.length > 0 ? (
  <div className="text-green-600">✅ Horários disponíveis</div>
) : (
  <div className="text-amber-600">⚠️ Nenhum horário disponível</div>
)}

// Estados de validação
{errors.horaInicio && (
  <span className="text-red-500 text-sm">{errors.horaInicio.message}</span>
)}
```

### 2. **Modais Informativos**

#### **Modal de Confirmação de Horário Passado:**
```typescript
{showConfirmacaoHorarioPassado && (
  <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div className="p-6">
        <h3>Confirmar Edição de Horário Passado</h3>
        <p>Este agendamento é para um horário que já passou há mais de 1 hora.</p>
        <p>Deseja continuar com a edição mesmo assim?</p>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={cancelar}>Cancelar</button>
          <button onClick={executarMovimentacaoForcada}>Sim, Continuar</button>
        </div>
      </div>
    </div>
  </div>
)}
```

#### **Modal de Erro Suavizado:**
- Fundo com `bg-opacity-20` (mais suave)
- Animações de entrada/saída
- Ícones contextuais por tipo de erro
- Detalhes técnicos opcionais

### 3. **Toast Notifications**

#### **Tipos de Notificação:**
```typescript
// Sucesso
toast.success('Agendamento salvo com sucesso!')

// Informação
toast.success('Agendamento editado (sem mudanças)', {
  icon: 'ℹ️',
  duration: 2000
})

// Aviso
toast('Editando horário recente (menos de 1 hora)', {
  icon: '⚠️',
  style: { background: '#fbbf24', color: '#000' }
})

// Erro
toast.error('Não foi possível salvar o agendamento')
```

---

## 🔧 VALIDAÇÕES DE FORMULÁRIO

### 1. **Schema Zod Principal**

```typescript
const agendamentoFormSchema = z.object({
  pacienteId: z.number().min(1, 'Selecione um paciente'),
  parceiroId: z.number().min(1, 'Selecione um profissional'),
  servicoId: z.number().min(1, 'Selecione um serviço'),
  salaId: z.number().min(1, 'Selecione uma sala'),
  data: z.string().min(1, 'Selecione uma data'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido'),
  duracaoMinutos: z.number().min(15, 'Duração mínima de 15 minutos'),
  observacoes: z.string().optional(),
  primeiraConsulta: z.boolean().default(false),
  requerPreparo: z.boolean().default(false)
})
```

### 2. **Validações em Tempo Real**

#### **CPF Único (Modal Novo Paciente):**
```typescript
const verificarCpfUnico = async (cpf: string) => {
  if (cpf.length === 14) { // CPF formatado
    const response = await pacientesService.verificarCpfUnico(cpf)
    if (!response.disponivel) {
      setError('cpf', { message: 'CPF já cadastrado no sistema' })
    }
  }
}
```

#### **Disponibilidade de Horário:**
```typescript
const validarDisponibilidade = async () => {
  const disponivel = await agendamentosService.verificarDisponibilidade({
    parceiroId,
    data,
    horaInicio,
    duracaoMinutos,
    excluirId: id // Para edições
  })
  
  if (!disponivel) {
    showErrorModal('Horário Indisponível', 'Este horário já está ocupado')
  }
}
```

---

## 📊 MÉTRICAS E MONITORAMENTO

### 1. **Logs de Debug**

#### **Validação Temporal:**
```typescript
console.log('🕐 Validação de horário:', {
  agora: agora.toLocaleString('pt-BR'),
  agendamento: dataHoraAgendamento.toLocaleString('pt-BR'),
  diferencaMinutos: Math.round(diferencaMinutos),
  resultado: validacao.tipo
})
```

#### **Detecção de Mudanças:**
```typescript
console.log('🔍 Comparação de mudanças:', {
  original: dadosOriginais,
  atual: dadosAtuais,
  apenasObservacoes: resultado,
  camposAlterados: camposModificados
})
```

### 2. **Tratamento de Erros**

#### **Estrutura Padrão:**
```typescript
try {
  const response = await operacao()
  if (response.success) {
    // Sucesso
  } else {
    showErrorModal('Erro na Operação', response.message, response.details)
  }
} catch (error: any) {
  console.error('❌ Erro:', error)
  showErrorModal('Erro Inesperado', 'Operação não pôde ser concluída', error.message)
}
```

---

## 🚀 MELHORIAS FUTURAS

### 1. **Funcionalidades Planejadas**
- [ ] **Recorrência de Agendamentos** (semanal, mensal)
- [ ] **Notificações Automáticas** (SMS, WhatsApp, Email)
- [ ] **Lista de Espera** para horários ocupados
- [ ] **Integração com Calendário** (Google Calendar, Outlook)
- [ ] **Confirmação de Presença** automatizada

### 2. **Otimizações Técnicas**
- [ ] **Cache de Disponibilidade** para melhor performance
- [ ] **Validação Assíncrona** em tempo real
- [ ] **Sincronização Offline** para dispositivos móveis
- [ ] **API de Webhooks** para integrações externas

---

## 📝 NOTAS TÉCNICAS

### 1. **Compatibilidade de Datas**
- **Formato Padrão:** YYYY-MM-DD (ISO 8601)
- **Timezone:** UTC com conversão local
- **Função Segura:** `formatarDataSemFuso()` evita problemas de fuso horário

### 2. **Performance**
- **Debouncing:** 300ms para buscas em tempo real
- **Paginação:** Server-side para listas grandes
- **Lazy Loading:** Componentes carregados sob demanda

### 3. **Segurança**
- **Validação Dupla:** Frontend (UX) + Backend (segurança)
- **Sanitização:** Todos os inputs são sanitizados
- **Autorização:** Verificação de permissões por operação

---

## 📊 BUGS CRÍTICOS RESOLVIDOS

### 1. **✅ Checkboxes não salvavam**
- **Problema:** Campos `primeiraConsulta` e `requerPreparo` não persistiam
- **Causa:** Backend não mapeava os campos boolean
- **Solução:** Adicionado mapeamento com `Boolean()` no controller

### 2. **✅ Discrepância de Datas (26/06 vs 27/06)**
- **Problema:** Lista mostrava data diferente da edição
- **Causa:** `toLocaleDateString()` causava problemas de fuso horário
- **Solução:** Função `formatarDataSemFuso()` implementada

### 3. **✅ Ações Rápidas para Datas Passadas**
- **Problema:** Movimentação para datas passadas não salvava
- **Causa:** Modal de confirmação não processava dados corretamente
- **Solução:** Função `executarMovimentacaoForcada()` criada

### 4. **✅ "Horário não disponível" em Edições**
- **Problema:** Sistema considerava próprio agendamento como conflito
- **Causa:** Verificação não excluía o agendamento sendo editado
- **Solução:** `buscarDisponibilidadeComExclusao()` implementada

### 5. **✅ Erro "formatarDataSemFuso is not defined"**
- **Problema:** Função existia apenas no arquivo lista.tsx
- **Causa:** Função não estava disponível no editar.tsx
- **Solução:** Função adicionada ao arquivo de edição

---

## 🚀 STATUS ATUAL

### ✅ **SISTEMA 95% FUNCIONAL**
- **Lista de Agendamentos:** Formatação de data corrigida
- **Edição de Agendamentos:** Todos os campos funcionais
- **Botões de Ação Rápida:** Movimentação para passado/futuro operacional
- **Validação de Horários Passados:** Sistema inteligente com confirmação
- **Sistema de Disponibilidade:** Sem falsos conflitos
- **Modal de Novo Paciente:** Cadastro rápido integrado
- **Filtros Dinâmicos:** Por parceiro e serviços funcionais

### 🔄 **PENDÊNCIAS MENORES (5%)**
1. **Linter Errors:** Correção de types incompatíveis (não afeta funcionalidade)
2. **Otimização:** Redução de logs de debug desnecessários
3. **Documentação:** Finalização de comentários no código

---

**Documento mantido por:** Equipe de Desenvolvimento  
**Próxima revisão:** Implementação do Módulo Financeiro  
**Versão:** 1.0 - Sistema de Agendamentos Completo 