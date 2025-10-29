'use client';

import { useState } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Ellipsis, Trash } from 'lucide-react';
import { toast } from 'sonner';

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

interface CommentActionProps {
  commentId: number;
  isMine: boolean;
  onDelete?: () => void;
  stopPropagation: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function CommentAction({
  commentId,
  isMine,
  onDelete,
  stopPropagation,
}: CommentActionProps) {
  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!confirm('Apakah anda yakin ingin menghapus komentar ini?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Komentar berhasil dihapus');
      if (onDelete) {
        onDelete();
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error('Gagal menghapus komentar. Silakan coba lagi nanti.');
    }
  };

  const isXs = useMediaQuery('(max-width: 30rem)');
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isMine) {
    return null;
  }

  return (
    <div className="flex justify-end font-normal">
      {isXs ? (
        <Drawer>
          <DrawerTrigger asChild>
            <button
              aria-label="Opsi lainnya"
              onClick={stopPropagation}
              className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
            >
              <Ellipsis size={16} />
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
                className="flex items-center gap-4 text-left font-bold text-red-600"
                onClick={handleDelete}
              >
                <Trash size={16} />
                Hapus komentar
              </button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            asChild
            onClick={stopPropagation}
            className="text-muted-foreground hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 cursor-pointer rounded-sm p-1 transition focus:outline-none focus-visible:ring-2"
          >
            <button aria-label="Opsi lainnya">
              <Ellipsis size={16} />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              className="flex items-center gap-2 px-3 py-2 font-bold"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash size={16} />
              Hapus komentar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
