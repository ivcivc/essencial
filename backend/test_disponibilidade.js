// Teste rápido da funcionalidade de disponibilidade
const axios = require('axios')

const testarDisponibilidade = async () => {
  try {
    console.log('🧪 Testando disponibilidade de horários...')
    
    // Teste 1: Horários sem parceiro (apenas configuração da clínica)
    console.log('\n📅 Teste 1: Horários da clínica para quarta-feira')
    const response1 = await axios.post('http://localhost:3334/api/configuracoes/gerar-horarios-disponiveis', {
      data: '2025-01-29' // Quarta-feira
    })
    console.log('✅ Resultado:', response1.data)
    
    // Teste 2: Horários com parceiro (Dr. Ana Paula Ribeiro - ID 3)
    console.log('\n👩‍⚕️ Teste 2: Horários da Dr. Ana Paula para quarta-feira')
    const response2 = await axios.post('http://localhost:3334/api/configuracoes/gerar-horarios-disponiveis', {
      data: '2025-01-29', // Quarta-feira
      parceiroId: 3
    })
    console.log('✅ Resultado:', response2.data)
    
    // Teste 3: Horários com parceiro em domingo (deve dar erro)
    console.log('\n🚫 Teste 3: Horários da Dr. Ana Paula para domingo')
    const response3 = await axios.post('http://localhost:3334/api/configuracoes/gerar-horarios-disponiveis', {
      data: '2025-02-02', // Domingo
      parceiroId: 3
    })
    console.log('✅ Resultado:', response3.data)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message)
  }
}

testarDisponibilidade() 