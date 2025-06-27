import React, { useState } from 'react';
import DomiexCustomSelect, { SelectOption } from '../../components/form/DomiexCustomSelect';

const SelectComparacao: React.FC = () => {
  // Opções para demonstrar com e sem descrições
  const comoConheceuOptions: SelectOption[] = [
    { 
      value: "Indicação de amigo", 
      label: "Indicação de amigo/familiar",
      description: "Recomendação pessoal",
      alias: ["amigo", "familia", "indicacao", "conhecido", "parente"]
    },
    { 
      value: "Google/Internet", 
      label: "Google / Busca na Internet",
      description: "Pesquisa online",
      alias: ["google", "internet", "pesquisa", "site", "busca", "online"]
    },
    { 
      value: "Redes sociais", 
      label: "Redes Sociais",
      description: "Facebook, Instagram, etc.",
      alias: ["facebook", "instagram", "social", "rede", "stories", "posts"]
    },
    { 
      value: "Plano de saúde/Convênio", 
      label: "Plano de Saúde / Convênio",
      description: "Através do convênio médico",
      alias: ["convenio", "plano", "saude", "unimed", "bradesco", "sulamerica"]
    },
    { 
      value: "Indicação médica", 
      label: "Indicação Médica",
      description: "Encaminhamento de outro profissional",
      alias: ["medico", "doutor", "profissional", "encaminhamento", "especialista"]
    }
  ];

  const [selectedComDescricao, setSelectedComDescricao] = useState<SelectOption | null>(null);
  const [selectedSemDescricao, setSelectedSemDescricao] = useState<SelectOption | null>(null);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Comparação: Select Com vs Sem Descrições</h4>
              <p className="text-muted mb-0">
                Demonstração das duas variações do componente customizado
              </p>
            </div>
            <div className="card-body">
              
              {/* Comparação lado a lado */}
              <div className="row">
                <div className="col-md-6">
                  <div className="border rounded p-4 bg-gray-50 dark:bg-gray-800/50">
                    <h5 className="text-lg font-medium mb-3 text-primary-600 dark:text-primary-400">
                      📝 Com Descrições (Padrão)
                    </h5>
                    <DomiexCustomSelect
                      label="Como conheceu a clínica"
                      options={comoConheceuOptions}
                      value={selectedComDescricao}
                      onChange={(selected) => setSelectedComDescricao(selected as SelectOption | null)}
                      placeholder="Selecione uma opção..."
                      isSearchable={true}
                      isClearable={true}
                      showDescription={true} // Mostra descrições
                      helperText="⚠️ Mostra descrições - fica mais alto que outros inputs"
                    />
                    
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Problema:</strong> Este select fica visivelmente maior que os outros campos do formulário
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="border rounded p-4 bg-green-50 dark:bg-green-800/20">
                    <h5 className="text-lg font-medium mb-3 text-green-600 dark:text-green-400">
                      🎯 Sem Descrições (Compacto)
                    </h5>
                    <DomiexCustomSelect
                      label="Como conheceu a clínica"
                      options={comoConheceuOptions}
                      value={selectedSemDescricao}
                      onChange={(selected) => setSelectedSemDescricao(selected as SelectOption | null)}
                      placeholder="Selecione uma opção..."
                      isSearchable={true}
                      isClearable={true}
                      showDescription={false} // Não mostra descrições
                      helperText="✅ Visual limpo - mesmo tamanho dos outros inputs"
                    />
                    
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-400">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Solução:</strong> Mantém consistência visual com outros campos do formulário
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demonstração da busca por alias */}
              <div className="row mt-6">
                <div className="col-12">
                  <div className="alert alert-info">
                    <h6 className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                      🔍 Funcionalidades Mantidas:
                    </h6>
                    <ul className="list-disc list-inside text-sm space-y-1 mb-0">
                      <li><strong>Busca por Alias:</strong> Tente digitar "google", "amigo", "convênio", "médico"</li>
                      <li><strong>Dark Mode:</strong> Funcionamento perfeito em ambos os temas</li>
                      <li><strong>Validação:</strong> Integração completa com React Hook Form e Zod</li>
                      <li><strong>Acessibilidade:</strong> Labels, placeholders e mensagens de erro</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Exemplos de inputs normais para comparação */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <h6 className="text-gray-700 dark:text-gray-300 mb-2">Input Normal (para comparação)</h6>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Campo de texto normal"
                  />
                </div>
                <div className="col-md-6">
                  <h6 className="text-gray-700 dark:text-gray-300 mb-2">Select Nativo (para comparação)</h6>
                  <select className="form-input">
                    <option>Opção 1</option>
                    <option>Opção 2</option>
                  </select>
                </div>
              </div>

              {/* Recomendação */}
              <div className="row mt-6">
                <div className="col-12">
                  <div className="alert alert-success">
                    <h6 className="text-green-600 dark:text-green-400 font-medium mb-2">
                      💡 Recomendação de Uso:
                    </h6>
                    <p className="text-sm mb-2">
                      Para formulários onde a consistência visual é importante (como cadastro de pacientes), 
                      use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">showDescription={'{false}'}</code>
                    </p>
                    <p className="text-sm mb-0">
                      As descrições ainda estarão disponíveis via tooltips ou outros mecanismos quando necessário.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectComparacao; 