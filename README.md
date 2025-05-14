# Cuidado + Família - Projeto Integrador

## Visão Geral

O Cuidado + Família é um aplicativo criado para oferecer suporte completo a pais de crianças com doenças degenerativas. Ele tem como principal missão proporcionar um ambiente seguro, acessível e informativo, reunindo em um único lugar apoio emocional, orientações práticas e acesso facilitado a profissionais da área da saúde.

## Equipe de Desenvolvimento

- JOÃO VICTOR MOREIRA DA SILVA - joaovictorms07@gmail.com - Responsável pelo desenvolvimento do aplicativo
- MARIA DA PIEDADE SENA DE OLIVEIRA – mapifrompleiades@gmail.com - Responsável pela criação do vídeo de apresentação do projeto
- BEATRIZ RIBEIRO MONTALVÃO – beatrizmontalvaor@gmail.com - Responsável pela gestão do projeto, definição de requisitos e documentação
- RICARDO CARLOS FEITOSA – ricardocarlosf@hotmail.com - Responsável pelo desenvolvimento da landing page do projeto
- JOÃO FELIPE CEOLIN BARBOSA – jfelipecb@gmail.com - Responsável pelo desenvolvimento da landing page do projeto

## Tecnologias Utilizadas

- **Frontend**: React Native com Expo
- **Backend**: Firebase (Authentication e Firestore)
- **Gerenciamento de Estado**: Context API
- **Estilização**: Componentes temáticos personalizados
- **Navegação**: Expo Router (file-based routing)

## Arquitetura do Sistema

O aplicativo segue uma arquitetura modular com os seguintes componentes principais:

1. **Sistema de Autenticação**: Utiliza Firebase Authentication para gerenciar login/cadastro com email e senha
2. **Banco de Dados**: Firebase Firestore para armazenamento de dados dos usuários e informações do aplicativo
3. **Gerenciamento de Estado**: Context API para compartilhamento de estado entre componentes
4. **Componentes UI**: Componentes temáticos personalizados como `ThemedText` e `ThemedView`

## Funcionalidades Principais

### Sistema de Usuários
- Autenticação de usuários (login/cadastro)
- Gerenciamento de perfis de usuários
- Sistema de papéis (administrador/usuário)
- Edição de informações de perfil
- Alteração de senha

### Profissionais da Saúde
- Catálogo de profissionais especializados em doenças degenerativas
- Contato direto via WhatsApp com os profissionais
- Visualização de especialidades e localização
- Gerenciamento de profissionais (adicionar/editar) para administradores

### Comunidades de Apoio
- Acesso a grupos de apoio para pais e familiares
- Conexão com comunidades online relevantes
- Integração com plataformas externas via links diretos
- Gerenciamento de comunidades (adicionar/editar) para administradores

### Blog Informativo
- Artigos e conteúdos educativos sobre doenças degenerativas
- Dicas de cuidados e suporte emocional
- Acesso a recursos externos via links
- Gerenciamento de conteúdo do blog (adicionar/editar) para administradores

## Como Executar o Projeto

1. Clone o repositório

2. Instale as dependências
   ```bash
   npm install
   ```

3. Inicie o aplicativo
   ```bash
   npx expo start
   ```

4. Escolha uma das opções para visualizar o aplicativo:
   - Emulador Android
   - Simulador iOS
   - Expo Go (dispositivo físico)
   - Web browser

## Estrutura do Projeto

```
/app                    # Diretório principal do aplicativo
  /components           # Componentes reutilizáveis
  /contexts             # Context API para gerenciamento de estado
  /services             # Serviços para interação com Firebase
  /screens              # Telas do aplicativo
  /utils                # Funções utilitárias
/assets                 # Recursos estáticos (imagens, fontes)
```

## Objetivos Educacionais

Este projeto integra conhecimentos de:
- Desenvolvimento móvel multiplataforma
- Arquitetura de software
- Integração com serviços de backend
- Experiência do usuário (UX/UI)
- Gerenciamento de estado em aplicações React
- Autenticação e segurança

---

*Projeto desenvolvido para a disciplina de Projeto Integrador - Centro Universitário SENAC.*
