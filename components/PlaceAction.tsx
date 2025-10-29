'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Copy, Ellipsis, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsomorphicLayoutEffect } from '@/hooks/use-isomorphic-layout-effect';
import { useMediaQuery } from '@/hooks/use-media-query';
import api from '@/lib/axios';

interface PlaceActionProps {
  locationId: number;
  locationName: string;
  isMine: boolean;
}

export default function PlaceAction({
  locationId,
  locationName,
  isMine,
}: PlaceActionProps) {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    const url = `${window.location.origin}/place?id=${locationId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Tautan berhasil disalin');
    } catch (error) {
      toast.error('Gagal menyalin tautan. Silakan coba lagi nanti.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/locations/${locationId}`);
      toast.success('Tempat berhasil dihapus!');
      router.back();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Terjadi kesalahan. Silakan coba lagi nanti.';
      toast.error('Gagal menghapus tempat', {
        description: message,
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const isXs = useMediaQuery('(max-width: 30rem)');
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="flex justify-end">
        {isXs ? (
          <Drawer>
            <DrawerTrigger asChild>
              <button
                aria-label="Opsi lainnya"
                className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
              >
                <Ellipsis size={20} />
              </button>
            </DrawerTrigger>

            <DrawerContent className="px-6">
              <DrawerHeader className="hidden">
                <DrawerTitle>
                  <VisuallyHidden>More options</VisuallyHidden>
                </DrawerTitle>
              </DrawerHeader>

              <div className="flex flex-col gap-6 py-6">
                <button
                  className="flex items-center gap-4 text-left font-bold"
                  onClick={handleCopyLink}
                >
                  <Copy size={16} />
                  Salin tautan
                </button>
                {isMine && (
                  <button
                    className="flex items-center gap-4 text-left font-bold text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash size={16} />
                    Hapus tempat
                  </button>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              asChild
              className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
            >
              <button aria-label="Opsi lainnya">
                <Ellipsis size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                className="flex items-center gap-2 px-3 py-2 font-bold"
                onClick={handleCopyLink}
              >
                <Copy size={16} />
                Salin tautan
              </DropdownMenuItem>
              {isMine && (
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 font-bold"
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash size={16} />
                  Hapus tempat
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Tempat</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus tempat ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
