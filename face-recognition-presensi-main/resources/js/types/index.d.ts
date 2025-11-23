import type { PageProps } from '@inertiajs/core';
import type { LucideIcon } from 'lucide-vue-next';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
    isActive?: boolean;
    role?: string;
    permission?: string;
}

export interface SharedData extends PageProps {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    attendance?: Attendance[];
    role?: string;
    role_translated?: string;
    user_permissions?: string[];
    photo_urls?: string[];
}

export type BreadcrumbItemType = BreadcrumbItem;

export interface Pagination<T = any> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface Attendance {
    id: number;
    user_id: number;
    date: string;
    status: 'present' | 'absent' | 'leave' | 'sick';
    check_in: string | null;
    check_out: string | null;
    check_in_photo_distance: number | null;
    check_out_photo_distance: number | null;
    check_in_photo_url?: string | null;
    check_out_photo_url?: string | null;
    created_at: string;
    updated_at: string;
    time?: string;
    user?: User
}