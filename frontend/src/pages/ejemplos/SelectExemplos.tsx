import React, { useState } from 'react';
import DomiexCustomSelect, { SelectOption } from '../../components/form/DomiexCustomSelect';

// ... existing code ...

export default function SelectExemplos() {
  // ... existing state ...

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
    }
  ];

  const [selectedComoConheceu1, setSelectedComoConheceu1] = useState<SelectOption | null>(null);
  const [selectedComoConheceu2, setSelectedComoConheceu2] = useState<SelectOption | null>(null);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Exemplos de Select Customizado</h4>
            </div>
            <div className="card-body">
              
              {/* ... existing examples ... */}

              {/* Exemplo: Com vs Sem Descrições */}
              <div className="row mb-6">
                <div className="col-md-6">
                  <h5 className="text-lg font-medium mb-3">📝 Com Descrições (Padrão)</h5>
                  <DomiexCustomSelect
                    label="Como conheceu a clínica"
                    options={comoConheceuOptions}
                    value={selectedComoConheceu1}
                    onChange={(selected) => setSelectedComoConheceu1(selected as SelectOption | null)}
                    placeholder="Com descrições..."
                    isSearchable={true}
                    isClearable={true}
                    showDescription={true} // Mostra descrições
                    helperText="Mostra descrições nas opções"
                  />
                </div>
                
                <div className="col-md-6">
                  <h5 className="text-lg font-medium mb-3">🎯 Sem Descrições (Compacto)</h5>
                  <DomiexCustomSelect
                    label="Como conheceu a clínica"
                    options={comoConheceuOptions}
                    value={selectedComoConheceu2}
                    onChange={(selected) => setSelectedComoConheceu2(selected as SelectOption | null)}
                    placeholder="Sem descrições..."
                    isSearchable={true}
                    isClearable={true}
                    showDescription={false} // Não mostra descrições - Visual mais limpo
                    helperText="Visual mais compacto, mesmo tamanho dos outros inputs"
                  />
                </div>
              </div>

              <div className="alert alert-info">
                <h6 className="text-primary-600 dark:text-primary-400 font-medium mb-2">💡 Dica de Uso:</h6>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><strong>Com Descrições:</strong> Use quando precisar de mais informações para o usuário</li>
                  <li><strong>Sem Descrições:</strong> Use quando quiser manter consistência visual com outros inputs</li>
                  <li><strong>Dark Mode:</strong> Agora funciona perfeitamente em ambas as variações</li>
                  <li><strong>Busca por Alias:</strong> Funciona em ambas - tente digitar "google", "amigo", "convênio"</li>
                </ul>
              </div>

              {/* ... existing examples ... */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 