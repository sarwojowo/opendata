<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/AppLayout.vue';
import { formatHumanDate } from '@/lib/helpers';
import { BreadcrumbItem, User } from '@/types';
import { Head } from '@inertiajs/vue3';
import Delete from './partials/Delete.vue';
import Edit from './partials/Edit.vue';
import ResetPassword from './partials/ResetPassword.vue';

const props = defineProps<{
    user: User;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Admin',
        href: '/admins',
    },
    {
        title: props.user.name,
        href: `/admins/${props.user.id}`,
    },
];
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Detail Admin" />

        <div class="px-4 py-6">
            <Heading title="Detail Admin" />

            <div class="mt-7 overflow-x-auto">
                <Card class="">
                    <CardHeader>
                        <div class="flex items-center justify-between">
                            <h1 class="text-lg font-semibold">Admin Details</h1>
                            <div class="flex items-center gap-2">
                                <ResetPassword :user="user" />
                                <Edit :user="user" />
                                <Delete :user="user" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div class="flex-1">
                                <h2 class="font-semibold">Name</h2>
                                <p>{{ user.name }}</p>
                            </div>
                            <div class="flex-1">
                                <h2 class="font-semibold">Email</h2>
                                <p>{{ user.email }}</p>
                            </div>
                            <div class="flex-1">
                                <h2 class="font-semibold">Role</h2>
                                <p>{{ user.role_translated }}</p>
                            </div>
                            <div class="flex-1">
                                <h2 class="font-semibold">Registered at</h2>
                                <p>{{ formatHumanDate(user.created_at, 'dd LLL yyyy, HH:mm') }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>
