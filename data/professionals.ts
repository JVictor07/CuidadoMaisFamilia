export interface Professional {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  specialty?: string;
  whatsapp?: string;
}

export const professionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Ana Silva',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    specialty: 'Pediatria',
  },
  {
    id: '2',
    name: 'Dr. Carlos Oliveira',
    address: 'Rua Augusta, 500 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
    specialty: 'Cardiologia',
  },
  {
    id: '3',
    name: 'Dra. Mariana Santos',
    address: 'Rua Oscar Freire, 200 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
    specialty: 'Neurologia',
  },
  {
    id: '4',
    name: 'Dr. Ricardo Mendes',
    address: 'Av. Brigadeiro Faria Lima, 1500 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
    specialty: 'Ortopedia',
  },
  {
    id: '5',
    name: 'Dra. Juliana Costa',
    address: 'Rua Haddock Lobo, 300 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
    specialty: 'Dermatologia',
  },
  {
    id: '6',
    name: 'Dr. Fernando Almeida',
    address: 'Av. Rebouças, 800 - São Paulo, SP',
    imageUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
    specialty: 'Psiquiatria',
  },
];
