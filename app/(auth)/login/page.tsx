import type { Metadata } from 'next';

import AuthForm from '@/components/AuthForm';

import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Masuk',
};

export default function LoginPage() {
  return (
    <AuthForm
      title="Selamat datang"
      description="Masuk untuk melanjutkan"
      form={<LoginForm />}
      linkText="Belum punya akun?"
      linkHref="/signup"
      linkActionText="Daftar"
    />
  );
}
