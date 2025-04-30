export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categories: string[];
  link: string;
}

export const communities: Community[] = [
  {
    id: '1',
    name: 'Grupo de Apoio à Gestantes',
    description: 'Comunidade de apoio para gestantes e mães de primeira viagem, com encontros semanais e troca de experiências.',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Gestantes', 'Maternidade', 'Saúde'],
    link: 'https://t.me/apoiogestantes',
  },
  {
    id: '2',
    name: 'Idosos Ativos',
    description: 'Grupo dedicado a promover atividades físicas e sociais para idosos, melhorando a qualidade de vida e combatendo o isolamento.',
    imageUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Idosos', 'Atividade Física', 'Bem-estar'],
    link: 'https://whatsapp.com/group/idososativos',
  },
  {
    id: '3',
    name: 'Cuidadores Unidos',
    description: 'Rede de apoio para cuidadores de pessoas com necessidades especiais, oferecendo suporte emocional e troca de informações.',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Cuidadores', 'Apoio Emocional', 'Saúde Mental'],
    link: 'https://facebook.com/groups/cuidadoresunidos',
  },
  {
    id: '4',
    name: 'Nutrição Familiar',
    description: 'Grupo focado em educação nutricional para famílias, com workshops de alimentação saudável e econômica.',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Nutrição', 'Alimentação', 'Educação'],
    link: 'https://instagram.com/nutricaofamiliar',
  },
  {
    id: '5',
    name: 'Saúde Mental em Foco',
    description: 'Comunidade dedicada a promover a conscientização sobre saúde mental e oferecer suporte para pessoas com ansiedade e depressão.',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Saúde Mental', 'Bem-estar', 'Apoio Emocional'],
    link: 'https://discord.gg/saudementalemfoco',
  },
  {
    id: '6',
    name: 'Esporte para Todos',
    description: 'Iniciativa que promove atividades esportivas inclusivas para pessoas de todas as idades e habilidades.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Esporte', 'Inclusão', 'Atividade Física'],
    link: 'https://meetup.com/esporteparatodos',
  },
];
