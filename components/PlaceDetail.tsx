'use client';

import { useRouter } from 'next/navigation';

import {
    ArrowLeft,
    Coffee,
    Ellipsis,
    Hotel,
    Landmark,
    MapPin,
    Mountain,
    Star,
    Trees,
    Utensils,
    LucideIcon,
} from 'lucide-react';

import PlaceAction from '@/components/PlaceAction';
import { LocationDetail } from '@/types';

interface PlaceDetailProps {
    location: LocationDetail;
    postCount?: number;
    averageRating?: number;
    totalRatings?: number;
}

const categoryIconMap: Record<string, LucideIcon> = {
    coffee: Coffee,
    utensils: Utensils,
    tree: Trees,
    landmark: Landmark,
    hotel: Hotel,
    mountain: Mountain,
    ellipsis: Ellipsis,
};

export default function PlaceDetail({
    location,
    postCount = 0,
    averageRating = 0,
    totalRatings = 0,
}: PlaceDetailProps) {
    const router = useRouter();

    const { name, address, category, description, coordinates, is_mine, icon } =
        location;

    const IconComponent =
        (icon && categoryIconMap[icon]) || categoryIconMap['ellipsis'] || Ellipsis;

    return (
        <>
            <div className="flex flex-col gap-6 px-4 py-6">
                <div className="flex flex-col gap-3">
                    <span className="text-xl leading-tight font-bold">{name}</span>

                    <div className="flex items-center gap-2">
                        <Star size={16} className="fill-yellow-300 text-yellow-300" />
                        <span className="text-muted-foreground text-sm leading-tight">
                            {averageRating.toFixed(1)} ({postCount} unggahan)
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <IconComponent className="text-muted-foreground" size={16} />
                        <span className="text-muted-foreground text-sm leading-tight">
                            {category}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        <span className="text-muted-foreground text-sm leading-tight">{address}</span>
                    </div>
                </div>

                {description && (
                    <span className="text-justify text-sm">{description}</span>
                )}
                <PlaceAction
                    locationId={location.id}
                    locationName={name}
                    isMine={is_mine}
                />
            </div>
        </>
    );
}
