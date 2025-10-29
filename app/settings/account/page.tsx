"use client"

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import api from '@/lib/axios';
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const accountSchema = z
  .object({
    email: z
      .email({ message: 'Format email tidak valid' })
      .max(100, { message: 'Email tidak boleh lebih dari 100 karakter' }),
    newPassword: z
      .string()
      .max(100, { message: 'Kata sandi tidak boleh lebih dari 100 karakter' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/, {
        message: 'Minimal 8 karakter dengan huruf besar, huruf kecil, angka, dan simbol',
      })
      .or(z.literal('')),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: 'Konfirmasi kata sandi tidak cocok',
      path: ['confirmPassword'],
    }
  );

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountSettingsPage() {
  const router = useRouter();
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    reset,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        reset({
          email: response.data.data.email,
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        toast.error('Gagal memuat data pengguna');
      }
    };
    fetchUser();
  }, [reset]);

  const onSubmit = async (data: AccountFormValues) => {
    setResponseError(null);
    try {
      const payload: any = {
        email: data.email,
      };

      if (data.newPassword) {
        payload.password = data.newPassword;
        payload.password_confirmation = data.confirmPassword;
      }

      await api.post('/profile', payload);

      toast.success('Akun berhasil diperbarui');

      reset({
        email: data.email,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        if (apiErrors.email) {
          setResponseError(apiErrors.email[0]);
        } else if (apiErrors.password) {
          setResponseError(apiErrors.password[0]);
        } else {
          setResponseError('Gagal memperbarui akun.');
        }
      } else {
        setResponseError('Terjadi kesalahan. Silakan coba lagi nanti.');
      }
    }
  };

  return (
    <>
      <TopBar className="flex w-full items-center gap-3 p-4 text-xl font-semibold">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        Pengaturan Akun
      </TopBar>

      <main className="mx-auto flex w-full max-w-xl flex-col pb-[73px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 px-4 py-6"
        >
          <section className="border-border flex flex-col gap-4 border-solid pb-6">
            <span className="text-xl leading-tight font-semibold md:text-lg">
              Informasi Akun
            </span>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-base md:text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <span className="text-destructive text-sm">
                  {errors.email.message}
                </span>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <span className="text-xl leading-tight font-semibold md:text-lg">
              Ubah Kata Sandi
            </span>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password" className="text-base md:text-sm">
                Kata Sandi Baru
              </Label>
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className={errors.newPassword ? 'border-destructive' : ''}
              />
              {errors.newPassword && (
                <span className="text-destructive text-sm">
                  {errors.newPassword.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="confirm-password"
                className="text-base md:text-sm"
              >
                Konfirmasi Kata Sandi Baru
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <span className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Checkbox
                id="show-password"
                checked={showPassword}
                onCheckedChange={(checked) => setShowPassword(!!checked)}
              />
              <label htmlFor="show-password" className="text-sm font-normal">
                Tampilkan kata sandi
              </label>
            </div>
            {responseError && (
              <span className="text-destructive mt-2 text-sm">
                {responseError}
              </span>
            )}
          </section>

          <div className="fixed bottom-0 left-0 z-60 flex w-dvw justify-center">
            <div className="bg-background border-border relative flex w-full max-w-xl justify-between gap-2 rounded-t-xl border-x border-t px-3 pt-3 pb-6 shadow-xs">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !isValid || !isDirty}
              >
                {isSubmitting && <Spinner aria-hidden className="inline-block" />}
                Simpan perubahan
              </Button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
