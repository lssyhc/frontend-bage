'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  Coffee,
  Ellipsis,
  Hotel,
  Landmark,
  Mountain,
  Trees,
  Utensils,
} from 'lucide-react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const MAX_NAME = 100;
const MAX_ADDRESS = 150;
const MAX_DESC = 150;

const JAKARTA_CENTER: [number, number] = [-6.2, 106.816666];
const PlaceMap = dynamic(() => import('@/components/PlaceMap'), { ssr: false });

interface Category {
  id: number;
  name: string;
  icon: string;
}

const categoryIconMap: Record<
  string,
  React.FC<React.SVGProps<SVGSVGElement>>
> = {
  coffee: Coffee,
  utensils: Utensils,
  tree: Trees,
  landmark: Landmark,
  hotel: Hotel,
  mountain: Mountain,
  ellipsis: Ellipsis,
};

export default function CreatePlacePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [mapCenter, setMapCenter] = useState<[number, number]>(JAKARTA_CENTER);
  const [position, setPosition] = useState<[number, number] | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [locationPermissionResolved, setLocationPermissionResolved] =
    useState(false);

  useEffect(() => {
    const getLocationFromIP = async () => {
      try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();

        if (data.latitude && data.longitude && data.country_code === 'ID') {
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);

          setMapCenter([lat, lng]);
          setPosition([lat, lng]);
        }
      } catch (error) {
      } finally {
        setLocationPermissionResolved(true);
      }
    };

    const getLocationFromGPS = () => {
      if (!navigator.geolocation) {
        getLocationFromIP();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          setMapCenter([latitude, longitude]);
          setPosition([latitude, longitude]);
          setLocationPermissionResolved(true);
        },
        () => {
          getLocationFromIP();
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    };

    getLocationFromGPS();
    getLocationFromGPS();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
      } catch (error) {
        toast.error('Gagal memuat kategori. Silakan coba lagi nanti.');
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!position) {
      toast.error('Gagal membuat tempat', {
        description: 'Mohon pilih lokasi pada peta',
      });
      return;
    }

    if (!selectedCategory) {
      toast.error('Gagal membuat tempat', {
        description: 'Mohon pilih kategori',
      });
      return;
    }

    const placeData = {
      name,
      address,
      description,
      latitude: position[0],
      longitude: position[1],
      category_id: selectedCategory.id,
    };

    setLoading(true);
    try {
      await api.post('/locations', placeData);

      toast.success('Tempat berhasil dibuat', {
        description: 'Tempat baru telah berhasil ditambahkan',
      });

      router.back();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Terjadi kesalahan. Silakan coba lagi nanti.';
      toast.error('Gagal membuat tempat', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar className="flex w-full items-center gap-3 p-4 text-xl font-semibold">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        Buat Tempat Baru
      </TopBar>

      <main className="flex flex-col items-center pb-[73px]">
        <div className="w-full max-w-xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 py-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <Label
                  className="text-md flex gap-1 leading-tight"
                  htmlFor="name"
                >
                  Nama Tempat<span className="text-red-500">*</span>
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id="name"
                    placeholder="Masukkan nama tempat..."
                    value={name}
                    onChange={(e) =>
                      e.target.value.length <= MAX_NAME &&
                      setName(e.target.value)
                    }
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText className="text-muted-foreground text-xs">
                      {name.length}/{MAX_NAME}
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-md flex gap-1 leading-tight">
                  Kategori<span className="text-red-500">*</span>
                </Label>

                <Popover
                  open={categoryPopoverOpen}
                  onOpenChange={setCategoryPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryPopoverOpen}
                      className="flex justify-between"
                    >
                      <div className="flex items-center gap-2 text-base font-normal md:text-sm">
                        {selectedCategory ? (
                          <>
                            {(() => {
                              const IconComponent =
                                categoryIconMap[selectedCategory.icon] ||
                                Ellipsis;
                              return <IconComponent className="size-4" />;
                            })()}
                            <span>{selectedCategory.name}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            Pilih kategori...
                          </span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2" size={16} />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput placeholder="Cari kategori..." />
                      <CommandList>
                        <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((cat) => {
                            const IconComponent =
                              categoryIconMap[cat.icon] || Ellipsis;
                            return (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => {
                                  setSelectedCategory(cat);
                                  setCategoryPopoverOpen(false);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <IconComponent className="size-4" />
                                  {cat.name}
                                </div>
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    selectedCategory?.id === cat.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                className="text-md flex gap-1 leading-tight"
                htmlFor="address"
              >
                Alamat<span className="text-red-500">*</span>
              </Label>
              <InputGroup>
                <InputGroupTextarea
                  id="address"
                  rows={4}
                  placeholder="Masukkan alamat lengkap..."
                  value={address}
                  onChange={(e) =>
                    e.target.value.length <= MAX_ADDRESS &&
                    setAddress(e.target.value)
                  }
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="text-muted-foreground text-xs">
                    {address.length}/{MAX_ADDRESS}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-md flex gap-1 leading-tight">
                Tandai Lokasi<span className="text-red-500">*</span>
              </Label>
              <div className="h-[300px] overflow-hidden rounded-md border">
                <PlaceMap
                  center={mapCenter}
                  position={locationPermissionResolved ? position : null}
                  onSelect={(lat, lng) => setPosition([lat, lng])}
                />
              </div>
              <span className="text-muted-foreground text-xs">
                Lokasi:
                {position && (
                  <>
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-md leading-tight" htmlFor="description">
                Deskripsi
              </Label>
              <InputGroup>
                <InputGroupTextarea
                  id="description"
                  rows={4}
                  placeholder="Deskripsikan tempat ini..."
                  value={description}
                  onChange={(e) =>
                    e.target.value.length <= MAX_DESC &&
                    setDescription(e.target.value)
                  }
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="text-muted-foreground text-xs">
                    {description.length}/{MAX_DESC}
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="fixed bottom-0 left-0 z-9999 flex w-dvw justify-center">
              <div className="bg-background border-border relative flex w-full max-w-xl justify-between gap-2 rounded-t-xl border-x border-t px-3 pt-3 pb-6 shadow-xs">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    loading ||
                    !name ||
                    !selectedCategory ||
                    !address ||
                    !position
                  }
                >
                  {loading && <Spinner aria-hidden className="inline-block" />}
                  Buat tempat
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
