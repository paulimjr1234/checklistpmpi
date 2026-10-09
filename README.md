<div align="center">
  <h1>Checklist PMPI</h1>
  <p><strong>Aplicativo institucional de Checklist de Viaturas para a Polícia Militar do Estado do Piauí (PMPI)</strong></p>
</div>

Sistema web e móvel de inspeção técnica, controle operacional e emissão digital de relatórios de viaturas policiais da PMPI.

## Principais Funcionalidades

- **Vistoria Técnica de Viaturas**: Inspeção de itens mecânicos e elétricos (óleo, radiador, pneus, giroflex, rádio, estepe, macaco, faróis e ar-condicionado) com justificativa obrigatória para anomalias.
- **Registro Fotográfico Obrigatório**: Registro dos 4 ângulos obrigatórios da viatura (Frente, Lado do Motorista, Lado do Passageiro e Traseira).
- **Emissão Executiva de PDF**: Geração de documento oficial com brasão da PMPI em alta definição, molduras institucionais, frisos dourados, marca-d'água de autenticidade e assinatura digital do policial responsável.
- **Estrutura Administrativa de Unidades**: Seleção hierárquica por Grande Comando (CPM, CPLMN, CPSA, CPCE, CPE, CPCOM, COPAer, CPTRAN, CPA) e Batalhões / Companhias com proteção por senha administrativa.
- **Histórico e Compartilhamento**: Consulta de checklists finalizados, busca dinâmica, visualização detalhada e compartilhamento instantâneo.
- **Integração Google Drive**: Envio direto dos PDFs de vistorias para a nuvem seguindo a árvore de pastas oficial (`CHECKLIST VTR / [ANO] / [MÊS] / [DIA]`).

## Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20+)
- npm

### Passos
1. Clone o repositório ou acesse a pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000` no seu navegador.

