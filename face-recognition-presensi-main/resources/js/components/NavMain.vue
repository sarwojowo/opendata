<script setup lang="ts">
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps<{
    items: NavItem[];
}>();

const page = usePage<SharedData>();

const filteredItems = computed(() => {
    return props.items.filter((item) => {
        if (item.role) {
            return page.props.auth.user?.role == item.role;
        }

        if (item.permission) {
            return page.props.auth.user?.user_permissions?.includes(item.permission);
        }

        return true;
    });
});
</script>

<template>
    <SidebarGroup class="px-2 py-0">
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in filteredItems" :key="item.title">
                <SidebarMenuButton
                    as-child
                    :is-active="item.href.startsWith('/attendances') ? item.href == page.url : item.href.startsWith(page.url)"
                    :tooltip="item.title"
                >
                    <Link :href="item.href">
                        <component :is="item.icon" />
                        <span>{{ item.title }}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
