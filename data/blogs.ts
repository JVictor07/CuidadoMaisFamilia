export interface Blog {
  id: string;
  name: string;
  imageUrl: string;
  categories: string[];
  link: string;
}

export const blogs: Blog[] = [
  {
    id: '1',
    name: 'Maternidade Real',
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Maternidade', 'Saúde', 'Desenvolvimento Infantil'],
    link: 'https://maternidadereal.com.br',
  },
  {
    id: '2',
    name: 'Vida Saudável na Terceira Idade',
    imageUrl: 'https://images.unsplash.com/photo-1569049348797-6a1db78c989a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Idosos', 'Saúde', 'Bem-estar'],
    link: 'https://terceiraidade.blog.br',
  },
  {
    id: '3',
    name: 'Nutrição Familiar',
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Nutrição', 'Alimentação', 'Família'],
    link: 'https://nutricaofamiliar.com',
  },
  {
    id: '4',
    name: 'Mente em Equilíbrio',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Saúde Mental', 'Bem-estar', 'Psicologia'],
    link: 'https://menteemequilibrio.com.br',
  },
  {
    id: '5',
    name: 'Cuidadores em Ação',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Cuidadores', 'Saúde', 'Idosos'],
    link: 'https://cuidadoresemacao.com',
  },
  {
    id: '6',
    name: 'Desenvolvimento Infantil',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    categories: ['Crianças', 'Desenvolvimento', 'Educação'],
    link: 'https://desenvolvimentoinfantil.blog',
  },
];
