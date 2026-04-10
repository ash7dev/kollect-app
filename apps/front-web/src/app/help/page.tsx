import { redirect } from 'next/navigation';

export const metadata = {
  title: "Centre d'aide - Kollect",
  description: "Besoin d'aide ? Consultez notre FAQ ou contactez notre équipe.",
};

export default function Page() {
  redirect('/contact');
}
