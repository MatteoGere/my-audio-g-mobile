import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the main app home page in the (main) route group
  redirect('/home');
}
