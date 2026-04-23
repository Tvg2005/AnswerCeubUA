# Robô das UAs - Extensão Automática (CEUB)

Este é um script de automação (Userscript) focado em auxiliar e avançar automaticamente pelos exercícios presentes nas plataformas baseadas no sistema Sagah, como as UAs (Unidades Avaliativas) do CEUB. Ele utiliza o Tampermonkey e uma Inteligência Artificial por meio da API Nativa do DeepSeek para selecionar respostas nativamente imitando comportamento de usuário real, desviando assim da grande maioria dos bloqueios anti-robôs.

## ⚙️ Pré-requisitos e Instalação

Siga este passo a passo cuidadosamente antes de iniciar o robô pela primeira vez.

### Passo 1: Preparar o Navegador
1. Acesse a loja de extensões do seu navegador e baixe a extensão oficial **Tampermonkey** (Disponível para [Google Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) ou Edge).
2. Pode ser necessário **Habilitar o Modo de Desenvolvedor** das extensões:
   - No Chrome: Acesse `chrome://extensions/` e ative o botão "Modo do desenvolvedor" no canto superior direito.
3. Clique no ícone da extensão Tampermonkey e verifique se a opção **Habilitar scripts de usuários** ("Enable Tampermonkey") está ativada.

### Passo 2: Configurar o Motor Inteligente (DeepSeek)
As questões são respondidas consultando a IA Native do DeepSeek. Ela oferece endpoints de altíssima eficiência e custo-benefício incrível.
1. Acesse o portal do desenvolvedor da DeepSeek em [platform.deepseek.com](https://platform.deepseek.com/).
2. Crie a sua conta (ou faça login).
3. Vá no menu esquerdo `API Keys` e clique em **"Create new API Key"**.
4. Copie a chave gerada. Não será possível vê-la novamente!

### Passo 3: Inserir o Código
1. Na barra do seu navegador, clique no ícone da extensão Tampermonkey.
2. Selecione a opção **"Criar novo script..."**.
3. Exclua o conteúdo de template visualizado na tela.
4. Abra o arquivo `scripttampermonkey.js` presente neste repositório. Confirme que ele seja a Versão 4.0 (que contorna iframes com perfeição). Copie o conteúdo inteiro e cole no seu Tampermonkey.
5. Edite as variáveis no topo do script colado e coloque suas chaves recolhidas no passo 2:
   ```javascript
   const API_KEY = "SUA_CHAVE_DO_DEEPSEEK_AQUI";
   const MODELO = "deepseek-chat"; 
   ```
6. Salve apertando `Ctrl + S` ou Indo em  `Arquivo > Salvar`.

## 🚀 Como Utilizar

1. Faça Login normalmente na plataforma educacional CEUB. O script nunca é ativado fora das telas correspondentes então fique à vontade.
2. Adentre sua grade, selecione a matéria em vigor.
3. No menu esquerdo, navegue exatamente até a seção lateral **"Exercícios"**.
4. Repare no canto inferior direito. Mágico! Agora você terá um Botão Verde **"🤖 Resolver UA"**.
5. Dê um clique leve nele, aguarde a IA pensar de até 5 segundos e desfrute da transição de telas até que ele encerre com Sucesso.

> *Lembrete*: A IA não carrega verdades absolutas, revise de tempos em tempos e caso alguma rede travar observe se o botão entrou em modo "Soneca" para aguardar e retentar novamente sozinho.
