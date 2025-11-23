<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Permissions } from '@/permission';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/vue3';
import { Clock9Icon, LayoutGrid, ListChecksIcon, Users2, UserSquare2 } from 'lucide-vue-next';
import AppLogo from './AppLogo.vue';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Admin List',
        href: '/admins',
        icon: UserSquare2,
        permission: Permissions.MANAGE_ADMINS,
    },
    {
        title: 'User List',
        href: '/users',
        icon: Users2,
        permission: Permissions.MANAGE_USERS,
    },
    {
        title: 'Attendance List',
        href: '/user-attendances',
        icon: Clock9Icon,
        permission: Permissions.MANAGE_USER_ATTENDANCES,
    },
    {
        title: 'Presence',
        href: '/attendances/create',
        icon: Clock9Icon,
        role: 'user',
    },
    {
        title: 'My Attendance',
        href: '/attendances',
        icon: ListChecksIcon,
        role: 'user',
    },
];

const footerNavItems: NavItem[] = [];
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="route('dashboard')">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
