import { Redirect } from 'expo-router';

export default function Index() {
  // Redirecionar para a tela de profissionais
  return <Redirect href="/(tabs)/professionals" />;
}
