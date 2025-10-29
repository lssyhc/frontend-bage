import type { Metadata } from 'next';

import AuthForm from '@/components/AuthForm';

import SignUpForm from './SignUpForm';

export const metadata: Metadata = {
  title: 'Daftar',
};

export default function SignUpPage() {
  return (
    <AuthForm
      title="Buat akun Anda"
      description="Bergabung untuk mulai berbagi"
      form={<SignUpForm />}
      linkText="Sudah punya akun?"
      linkHref="/login"
      linkActionText="Masuk"
    />
  );
}
