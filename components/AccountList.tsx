'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import api from '@/lib/axios';
import { User } from '@/types';

import AccountItem from './AccountItem';

interface UserListProps {
  users: User[];
}

export default function UserList({ users: initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const router = useRouter();

  const handleFollowClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    targetUser: User
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const previousUsers = [...users];
    const isFollowing = targetUser.is_followed;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id ? { ...u, is_followed: !isFollowing } : u
      )
    );

    try {
      const response = await api.post(`/users/${targetUser.id}/follow`);
      const isFollowing = Boolean(response.data.data.is_following);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, is_followed: isFollowing } : u
        )
      );
    } catch (error) {
      setUsers(previousUsers);
      toast.error('Gagal memproses permintaan follow.');
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[calc(100dvh-150px)] w-full items-center justify-center">
        Daftar pengguna kosong
      </div>
    );
  }

  return (
    <div className="divide-border flex w-full flex-col divide-y divide-solid">
      {users.map((user) => (
        <AccountItem
          key={user.id}
          user={user}
          onFollow={(e) => handleFollowClick(e, user)}
        />
      ))}
    </div>
  );
}
