'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Email atau username wajib diisi' })
    .max(100, { message: 'Identifier tidak boleh lebih dari 100 karakter' })
    .regex(/^\S+$/, { message: 'Username tidak boleh mengandung spasi' }),

  password: z
    .string()
    .min(1, { message: 'Password wajib diisi' })
    .max(255, { message: 'Password tidak boleh lebih dari 255 karakter' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: FormValues) {
    try {
      await api.post('/auth/login', {
        credential: data.username,
        password: data.password,
      });

      toast.success('Berhasil masuk! Selamat datang :)');
      router.push('/feed');
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
          'Terjadi kesalahan. Silakan coba lagi nanti.'
        );
      } else {
        toast.error('Terjadi kesalahan. Silakan coba lagi nanti.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="identifier" className="sr-only">
            Email atau username
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="Email atau username"
            autoComplete="username"
            {...register('username')}
          />
          {errors.username && (
            <span className="text-destructive text-sm">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <span className="text-destructive text-sm">
              {errors.password.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="show-password"
          checked={showPassword}
          onCheckedChange={(checked) => setShowPassword(!!checked)}
        />
        <label
          htmlFor="show-password"
          className="text-secondary-foreground text-sm font-normal"
        >
          Tampilkan password
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <Button
          type="submit"
          className="w-full cursor-pointer rounded-full"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting && <Spinner aria-hidden className="inline-block" />}
          Masuk
        </Button>
      </div>
    </form>
  );
}
