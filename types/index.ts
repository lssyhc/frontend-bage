export interface User {
    id: number;
    name: string;
    username: string;
    profile_picture_url: string | null;
    is_followed: boolean;
    is_mine?: boolean;
}

export interface Location {
    id: number;
    name: string;
}

export interface LocationDetail {
    id: number;
    name: string;
    icon: string;
    category: string;
    address: string;
    description: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    registrar?: string;
    is_mine: boolean;
    created_at: string;
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        profile_picture_url: string | null;
    };
    is_owner: boolean;
}

export interface Media {
    type: string;
    url: string;
}

export interface Post {
    id: number;
    content: string;
    rating: number;
    total_likes: number;
    total_comments: number;
    is_liked: boolean;
    latest_comments: Comment[];
    media: Media[];
    created_at: string;
    is_mine: boolean;
    user: User;
    location: Location | null;
}

export interface NotificationData {
    message: string;
    post_id?: number;
    location_id?: number;
    location_name?: string;
    rating?: number;
    liker_username?: string;
    liker_profile_picture_url?: string | null;
    commenter_username?: string;
    commenter_profile_picture_url?: string | null;
    comment_id?: number;
    comment_content?: string;
    follower_id?: number;
    follower_username?: string;
    follower_profile_picture_url?: string | null;
    is_followed?: boolean;
}

export interface Notification {
    id: number;
    type: 'like' | 'follow' | 'comment';
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}
