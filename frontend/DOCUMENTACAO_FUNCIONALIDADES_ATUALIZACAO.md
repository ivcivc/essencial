# Atualização de Funcionalidade: Múltiplos Períodos para Disponibilidade de Parceiros

## 📋 Visão Geral

Esta documentação detalha a atualização da funcionalidade de disponibilidade de parceiros para suportar múltiplos períodos por dia, permitindo maior flexibilidade na configuração de horários de atendimento.

**Versão**: 2.3.0  
**Data da Atualização**: Abril 2025  
**Sistema**: Clínica Essencial Frontend

---

## 🔄 Problema Resolvido

### Limitação Anterior:
- A disponibilidade de parceiros era limitada a **um único período por dia** (início/fim)
- Não era possível configurar horários fragmentados (ex: manhã e tarde com intervalo)
- Parceiros com horários flexíveis ou sublocação tinham dificuldade em configurar sua disponibilidade real

### Nova Solução:
- Suporte a **múltiplos períodos por dia** para cada parceiro
- Configuração semelhante à já existente para os horários de funcionamento da clínica
- Validações avançadas para evitar sobreposição de períodos

---

## 🛠️ Alterações Técnicas

### 1. Modelo de Dados Atualizado

#### Antes:
```typescript
interface DisponibilidadeDia {
  inicio: string;
  fim: string;
  ativo: boolean;
}

interface DisponibilidadeParceiro {
  seg: DisponibilidadeDia;
  ter: DisponibilidadeDia;
  qua: DisponibilidadeDia;
  qui: DisponibilidadeDia;
  sex: DisponibilidadeDia;
  sab: DisponibilidadeDia;
  dom: DisponibilidadeDia;
}
```

#### Depois:
```typescript
interface DisponibilidadeDia {
  ativo: boolean;
  periodos: Array<{
    inicio: string;  // "08:00"
    fim: string;     // "12:00"
  }>;
}

interface DisponibilidadeParceiro {
  seg: DisponibilidadeDia;
  ter: DisponibilidadeDia;
  qua: DisponibilidadeDia;
  qui: DisponibilidadeDia;
  sex: DisponibilidadeDia;
  sab: DisponibilidadeDia;
  dom: DisponibilidadeDia;
}
```

### 2. Validações Implementadas

- **Formato de Hora**: Validação de formato HH:MM
- **Ordem Temporal**: Início deve ser anterior ao fim
- **Sobreposição**: Períodos não podem se sobrepor no mesmo dia
- **Dias Ativos**: Dias marcados como ativos devem ter pelo menos um período configurado

```typescript
// Exemplo de validação de sobreposição
for (let i = 0; i < periodos.length; i++) {
  for (let j = i + 1; j < periodos.length; j++) {
    const [inicioH1, inicioM1] = periodos[i].inicio.split(':').map(Number);
    const [fimH1, fimM1] = periodos[i].fim.split(':').map(Number);
    const [inicioH2, inicioM2] = periodos[j].inicio.split(':').map(Number);
    const [fimH2, fimM2] = periodos[j].fim.split(':').map(Number);
    
    const inicio1 = inicioH1 * 60 + inicioM1;
    const fim1 = fimH1 * 60 + fimM1;
    const inicio2 = inicioH2 * 60 + inicioM2;
    const fim2 = fimH2 * 60 + fimM2;
    
    if ((inicio1 < fim2 && inicio2 < fim1)) {
      // Períodos sobrepostos
      return false;
    }
  }
}
```

---

## 🖥️ Interface de Usuário

### Nova Interface de Configuração de Disponibilidade

- **Adição de Períodos**: Botão para adicionar múltiplos períodos por dia
- **Remoção de Períodos**: Botão para remover períodos específicos
- **Validação Visual**: Feedback em tempo real para erros de validação
- **Feedback de Sobreposição**: Alerta quando períodos se sobrepõem
- **Padrões Rápidos**: Botão para aplicar padrões comuns (manhã/tarde)

![Interface de Disponibilidade](https://via.placeholder.com/800x400?text=Nova+Interface+de+Disponibilidade)

---

## 🔄 Impacto no Sistema de Agendamentos

### Verificação de Disponibilidade Atualizada

O método `verificarDisponibilidadeProfissional` foi atualizado para verificar se o horário do agendamento está contido em qualquer um dos períodos configurados para o dia:

```typescript
// Verificar se o horário está dentro de algum período do profissional
const periodos = disponibilidade[diaKey].periodos || [];

for (const periodo of periodos) {
  const [pInicioH, pInicioM] = periodo.inicio.split(':').map(Number);
  const [pFimH, pFimM] = periodo.fim.split(':').map(Number);
  const pInicioMinutos = pInicioH * 60 + pInicioM;
  const pFimMinutos = pFimH * 60 + pFimM;
  
  // Se o horário do agendamento está contido no período do profissional
  if (inicioMinutos >= pInicioMinutos && fimMinutos <= pFimMinutos) {
    return true; // Disponível neste período
  }
}
```

---

## 🔄 Migração de Dados

Para garantir compatibilidade com dados existentes, foi implementado um script de migração que converte o formato antigo para o novo:

```typescript
// Converter formato antigo para novo
novaDisponibilidade[dia] = {
  ativo: diaAtual.ativo || false,
  periodos: diaAtual.ativo ? [
    { inicio: diaAtual.inicio || '08:00', fim: diaAtual.fim || '18:00' }
  ] : []
}
```

---

## 📚 Exemplos de Uso

### Cenário 1: Médico com horário fragmentado
- **Segunda-feira**: 
  - 08:00 às 12:00 (manhã)
  - 14:00 às 18:00 (tarde)
- **Terça-feira**: 
  - 10:00 às 13:00 (único período)
- **Quarta-feira**: 
  - 08:00 às 10:00
  - 13:00 às 15:00
  - 16:00 às 18:00 (três períodos)

### Cenário 2: Profissional de sublocação
- **Segunda-feira**: 
  - 08:00 às 09:30
  - 15:00 às 18:00
- **Quinta-feira**: 
  - 14:00 às 20:00
- **Outros dias**: Inativo

---

## 🔄 Comparação com Horários de Funcionamento

### Semelhanças:
- Ambos utilizam estrutura de múltiplos períodos por dia
- Interface visual semelhante para configuração
- Mesmas validações de formato e sobreposição

### Diferenças:
- **Horários de Funcionamento**: Define quando a clínica está aberta (limite máximo)
- **Disponibilidade de Parceiros**: Define quando cada profissional atende (dentro do horário da clínica)
- **Hierarquia**: Agendamentos só são possíveis quando ambas as condições são satisfeitas

---

## 📋 Checklist de Implementação

- [x] Atualização do modelo de dados
- [x] Modificação das interfaces TypeScript
- [x] Atualização dos schemas de validação Zod
- [x] Adaptação do controller de parceiros no backend
- [x] Redesenho da interface de configuração
- [x] Atualização do serviço de verificação de disponibilidade
- [x] Script de migração de dados
- [x] Atualização da documentação

---

**Última Atualização**: Abril 2025  
**Versão da Documentação**: 1.0.0  
**Sistema**: Clínica Essencial Frontend v2.3.0