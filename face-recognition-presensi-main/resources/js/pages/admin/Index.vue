<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import Loader from '@/components/Loader.vue';
import PaginationComponent from '@/components/Pagination.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout.vue';
import { debounce } from '@/lib/helpers';
import { BreadcrumbItem, Pagination, User } from '@/types';
import { Deferred, Head, Link, router } from '@inertiajs/vue3';
import { Eye } from 'lucide-vue-next';
import { onMounted, ref, watch } from 'vue';
import Add from './partials/Add.vue';

defineProps<{
    users?: Pagination<User>;
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
];

const search = ref<string>('');

const reloadData = () => {
    router.reload({
        only: ['users'],
        data: {
            search: search.value,
            page: 1,
        },
        showProgress: true,
    });
};

onMounted(() => {
    watch(() => search.value, debounce(reloadData));
});
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Admin List" />

        <div class="px-4 py-6">
            <Heading title="Admin List" description="Manage admin accounts" />

            <div class="flex flex-wrap items-center justify-between gap-4">
                <Add />

                <div class="flex gap-4">
                    <Input class="h-9" type="search" v-model="search" placeholder="Search..." />
                </div>
            </div>

            <div class="mt-7 overflow-x-auto">
                <Deferred :data="['users']">
                    <template #fallback>
                        <Loader />
                    </template>

                    <Table v-if="users != null">
                        <TableCaption>
                            <PaginationComponent :data="users" />
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead> Name </TableHead>
                                <TableHead> Email </TableHead>
                                <TableHead> Role </TableHead>
                                <TableHead class="text-center"> Action </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="(item, index) in users.data" :key="index">
                                <TableCell>{{ item.name }}</TableCell>
                                <TableCell> {{ item.email }} </TableCell>
                                <TableCell> {{ item.role_translated }} </TableCell>
                                <TableCell class="text-center">
                                    <Link :href="route('admins.show', item.id)">
                                        <Button variant="link" as="span"> <Eye class="-ms-1" /> Detail </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                            <TableRow v-if="users.data.length < 1">
                                <TableCell colspan="10" class="py-8 text-center"> No data found. </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Deferred>
            </div>
        </div>
    </AppLayout>
</template>
