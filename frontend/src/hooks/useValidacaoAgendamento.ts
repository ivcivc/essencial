import { useCallback } from 'react'
import { ParceirosService } from '../services/parceiros'
import { format } from 'date-fns'

interface ValidacaoResultado {
  valido: boolean
  motivo?: string
  detalhes?: string
  tipo: 'passado' | 'disponibilidade' | 'ok'
}

/**
 * Hook para validação de movimentação de agendamento.
 * - Valida se a data/hora é passada.
 * - Valida se o parceiro está disponível no novo dia/horário.
 * - Retorna motivo detalhado para uso em modal/feedback.
 */
export function useValidacaoAgendamento() {
  // Valida se a data/hora é no passado
  const validarDataHoraPassada = useCallback((data: string, hora: string): ValidacaoResultado => {
    const agora = new Date()
    const dataHora = new Date(`${data}T${hora}:00`)
    if (dataHora < agora) {
      return {
        valido: false,
        motivo: 'Data e horário no passado',
        detalhes: 'Você está tentando mover o agendamento para uma data e horário que já passaram. Isso só deve ser feito para corrigir lançamentos errados ou ajustes administrativos.',
        tipo: 'passado'
      }
    }
    return { valido: true, tipo: 'ok' }
  }, [])

  // Valida disponibilidade do parceiro para o novo dia
  const validarDisponibilidadeParceiro = useCallback(async (parceiro: any, data: string, hora: string): Promise<ValidacaoResultado> => {
    if (!parceiro?.disponibilidade) {
      return {
        valido: false,
        motivo: 'Parceiro sem disponibilidade configurada',
        detalhes: 'O parceiro selecionado não possui disponibilidade cadastrada. Configure a agenda do parceiro para permitir agendamentos.',
        tipo: 'disponibilidade'
      }
    }
    const diaSemana = new Date(`${data}T00:00:00`).getDay() // 0=Dom, 6=Sab
    const mapeamentoDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
    const diaKey = mapeamentoDias[diaSemana]
    const diaConfig = parceiro.disponibilidade[diaKey]
    if (!diaConfig?.ativo) {
      return {
        valido: false,
        motivo: 'Dia não permitido',
        detalhes: `O parceiro não atende neste dia (${format(new Date(data), 'dd/MM/yyyy')}). Escolha outro dia conforme a disponibilidade configurada.`,
        tipo: 'disponibilidade'
      }
    }
    // Verifica se o horário está dentro do intervalo permitido
    const [inicioH, inicioM] = diaConfig.inicio.split(':').map(Number)
    const [fimH, fimM] = diaConfig.fim.split(':').map(Number)
    const [horaH, horaM] = hora.split(':').map(Number)
    const minutosInicio = inicioH * 60 + inicioM
    const minutosFim = fimH * 60 + fimM
    const minutosAgendamento = horaH * 60 + horaM
    if (minutosAgendamento < minutosInicio || minutosAgendamento >= minutosFim) {
      return {
        valido: false,
        motivo: 'Horário fora da disponibilidade',
        detalhes: `O parceiro só atende neste dia entre ${diaConfig.inicio} e ${diaConfig.fim}. Escolha um horário dentro desse intervalo.`,
        tipo: 'disponibilidade'
      }
    }
    return { valido: true, tipo: 'ok' }
  }, [])

  return {
    validarDataHoraPassada,
    validarDisponibilidadeParceiro
  }
} 