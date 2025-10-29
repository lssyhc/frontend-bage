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

export const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'Nama lengkap wajib diisi' })
      .max(100, { message: 'Nama tidak boleh lebih dari 100 karakter' }),

    username: z
      .string()
      .min(1, { message: 'Username wajib diisi' })
      .max(50, { message: 'Username tidak boleh lebih dari 50 karakter' })
      .regex(/^\S+$/, { message: 'Username tidak boleh mengandung spasi' }),

    email: z
      .email({ message: 'Format email tidak valid' })
      .max(100, { message: 'Email tidak boleh lebih dari 100 karakter' }),

    password: z
      .string()
      .max(100, { message: 'Password tidak boleh lebih dari 100 karakter' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message:
          'Minimal 8 karakter, huruf besar, huruf kecil, angka, dan simbol',
      }),

    passwordConfirmation: z
      .string()
      .min(1, { message: 'Konfirmasi password wajib diisi' }),
  })

  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Konfirmasi password tidak sesuai',
    path: ['passwordConfirmation'],
  });

type FormValues = z.infer<typeof formSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(data: FormValues) {
    try {
      await api.post('/auth/register', {
        name: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
      });

      toast.success('Pendaftaran berhasil. Selamat datang :)');
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      autoComplete="off"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Input
            id="full-name"
            type="text"
            placeholder="Nama Lengkap"
            {...register('fullName')}
            aria-label="Nama Lengkap"
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && (
            <span className="text-destructive text-sm">
              {errors.fullName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="username"
            type="text"
            placeholder="Username"
            {...register('username')}
            aria-label="Username"
            className={errors.username ? 'border-destructive' : ''}
          />
          {errors.username && (
            <span className="text-destructive text-sm">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="email"
            type="text"
            placeholder="Email"
            {...register('email')}
            aria-label="Email"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <span className="text-destructive text-sm">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...register('password')}
            aria-label="Password"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <span className="text-destructive text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Konfirmasi Password"
            {...register('passwordConfirmation')}
            aria-label="Konfirmasi Password"
            className={errors.passwordConfirmation ? 'border-destructive' : ''}
          />
          {errors.passwordConfirmation && (
            <span className="text-destructive text-sm">
              {errors.passwordConfirmation.message}
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
          Daftar
        </Button>
      </div>
    </form>
  );
}
