'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { useForm } from 'react-hook-form';

import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import api, { getApiErrorMessage, getApiValidationErrors } from '@/lib/axios';
import TopBar from '@/components/TopBar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Spinner } from '@/components/ui/spinner';


const profileSchema = z.object({
  fullName: z.string().max(100, 'Nama tidak boleh lebih dari 100 karakter'),
  username: z
    .string()
    .max(50, 'Username tidak boleh lebih dari 50 karakter')
    .regex(/^\S*$/, 'Username tidak boleh mengandung spasi')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(150, 'Bio tidak boleh lebih dari 150 karakter').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  croppedAreaPixels: Area
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg');
  });
};

export default function ProfileSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      username: '',
      bio: '',
    },
    mode: 'onChange',
  });

  const fullNameValue = watch('fullName') || '';
  const usernameValue = watch('username') || '';
  const bioValue = watch('bio') || '';

  const MAX_FULLNAME = 100;
  const MAX_USERNAME = 50;
  const MAX_BIO = 150;

  const resetFileInput = () => {
    setSelectedFile(null);
    setIsCropping(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Hanya file PNG, JPG, atau JPEG yang diperbolehkan.');
      resetFileInput();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file harus kurang dari 2MB.');
      resetFileInput();
      return;
    }

    setSelectedFile(file);
    setIsCropping(true);
  };

  const onCropComplete = useCallback(
    (_: Area, pixels: Area) => setCroppedAreaPixels(pixels),
    []
  );

  const [serverAvatarUrl, setServerAvatarUrl] = useState<string | null>(null);
  const [serverInitials, setServerInitials] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        const user = response.data.data;
        reset({
          fullName: user.name,
          username: user.username,
          bio: user.bio,
        });

        if (user.profile_picture_url) {
          setServerAvatarUrl(user.profile_picture_url);
          setServerInitials(user.username.charAt(0).toUpperCase());
        } else {
          setServerAvatarUrl(null);
          setServerInitials(user.username.charAt(0).toUpperCase());
        }

      } catch {
        toast.error('Gagal memuat profil. Silakan coba lagi nanti.');
      }
    };
    fetchUser();
  }, [reset]);


  const handleCropSave = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    const croppedUrl = await getCroppedImg(
      URL.createObjectURL(selectedFile),
      croppedAreaPixels
    );

    setCroppedImage(croppedUrl);

    resetFileInput();
  };

  const handleResetImage = () => {
    setCroppedImage(null);
    setSelectedFile(null);
    resetFileInput();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', data.fullName);
      if (data.username) formData.append('username', data.username);
      if (data.bio) formData.append('bio', data.bio);

      if (croppedImage) {
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        formData.append('profile_picture', blob, 'profile.jpg');
      }

      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || 'Profil berhasil diperbarui');

      if (response.data.data.profile_picture_url) {
        setServerAvatarUrl(response.data.data.profile_picture_url);
        setCroppedImage(null);
      }

    } catch (error: unknown) {
      const apiErrors = getApiValidationErrors(error);

      if (apiErrors) {
        if (apiErrors.username) {
          toast.error(apiErrors.username[0]);
        }
        if (apiErrors.profile_picture) {
          toast.error(apiErrors.profile_picture[0]);
        }
      } else {
        toast.error(
          getApiErrorMessage(
            error,
            'Gagal memperbarui profil. Silakan coba lagi nanti.'
          )
        );
      }
    }
  };

  return (
    <>
      <TopBar className="flex items-center gap-3 px-4 py-4 text-xl font-semibold">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        Pengaturan Profil
      </TopBar>

      <main className="mx-auto w-full max-w-xl pb-[78px]">
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="flex flex-col gap-2">
            <Label
              className="text-md mx-auto leading-tight"
              htmlFor="profile-picture"
            >
              Foto Profil
            </Label>
            <Avatar className="mx-auto my-2 size-20">
              {croppedImage ? (
                <AvatarImage asChild src={croppedImage} alt="Foto profil">
                  <img src={croppedImage} alt="Foto profil" className="aspect-square size-full object-cover" />
                </AvatarImage>
              ) : (
                <>
                  {serverAvatarUrl ? (
                    <AvatarImage asChild src={serverAvatarUrl} alt="Foto profil">
                      <NextImage
                        src={serverAvatarUrl}
                        alt="Foto profil"
                        width={80}
                        height={80}
                        priority
                        unoptimized
                      />
                    </AvatarImage>
                  ) : null}
                  <AvatarFallback>{serverInitials}</AvatarFallback>
                </>
              )}
            </Avatar>

            {croppedImage && (
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={handleResetImage}
                className="mx-auto w-fit p-2"
              >
                <RefreshCw />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto w-fit"
              id="profile-picture"
            >
              Ganti foto
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="full-name">Nama lengkap</Label>
            <InputGroup>
              <InputGroupInput
                id="full-name"
                {...register('fullName')}
                maxLength={MAX_FULLNAME}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-muted-foreground text-xs">
                  {fullNameValue.length}/{MAX_FULLNAME}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.fullName && (
              <p className="text-destructive text-sm">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <InputGroup>
              <InputGroupInput
                id="username"
                {...register('username')}
                maxLength={MAX_USERNAME}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-muted-foreground text-xs">
                  {usernameValue.length}/{MAX_USERNAME}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.username && (
              <p className="text-destructive text-sm">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <InputGroup>
              <InputGroupTextarea
                id="bio"
                rows={4}
                {...register('bio')}
                maxLength={MAX_BIO}
              ></InputGroupTextarea>
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-muted-foreground text-xs">
                  {bioValue.length}/{MAX_BIO}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.bio && (
              <p className="text-destructive text-sm">{errors.bio.message}</p>
            )}
          </div>

          <div className="fixed bottom-0 left-0 z-60 flex w-dvw justify-center">
            <div className="bg-background border-border relative flex w-full max-w-xl justify-between gap-2 rounded-t-xl border-x border-t px-3 pt-3 pb-6 shadow-xs">
              <Button
                className="w-full"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid || (!isDirty && !croppedImage)}
              >
                {isSubmitting && <Spinner aria-hidden className="inline-block" />}
                Simpan perubahan
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Dialog
        open={isCropping}
        onOpenChange={(open) => !open && resetFileInput()}
      >
        <DialogContent className="xs:h-auto flex h-full max-w-xl flex-col justify-between gap-5 [&>button:last-child]:hidden">
          <div className="flex items-center gap-1">
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </DialogClose>
            <DialogHeader className="flex-1">
              <DialogTitle>Potong Gambar</DialogTitle>
            </DialogHeader>
            <Button onClick={handleCropSave}>Simpan</Button>
          </div>

          <div className="bg-muted relative h-60">
            {selectedFile && (
              <Cropper
                image={URL.createObjectURL(selectedFile)}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Perbesar</span>
              <Slider
                min={1}
                max={3}
                step={0.01}
                value={[zoom]}
                onValueChange={([z]) => setZoom(z)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
