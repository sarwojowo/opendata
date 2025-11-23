<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/AppLayout.vue';
import { BreadcrumbItem, User } from '@/types';
import { Deferred, Head, useForm } from '@inertiajs/vue3';
import { FilePondFile } from 'filepond';

defineProps<{
    users?: User[];
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Attendances',
        href: '/user-attendances',
    },
    {
        title: 'Create',
        href: '/user-attendances/create',
    },
];

const form = useForm<{
    user_id: number | null;
    date: string;
    status: string;
    check_in: string;
    check_out: string;
    check_in_photo: File | Blob | null;
    check_out_photo: File | Blob | null;
}>({
    user_id: null,
    status: 'present',
    date: '',
    check_in: '',
    check_out: '',
    check_in_photo: null,
    check_out_photo: null,
});

const submit = (e: Event) => {
    e.preventDefault();

    if (form.check_in_photo instanceof Blob) {
        form.check_in_photo = new File([form.check_in_photo], (form.check_in_photo as File).name, { type: form.check_in_photo.type });
    }

    if (form.check_out_photo instanceof Blob) {
        form.check_out_photo = new File([form.check_out_photo], (form.check_out_photo as File).name, { type: form.check_out_photo.type });
    }

    form.post(route('user-attendances.store'), {
        preserveScroll: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const updateCheckInPhoto = (fileItems: FilePondFile[]) => {
    form.check_in_photo = fileItems.map((fileItem) => fileItem.file as File | Blob)[0] ?? null;
};

const updateCheckOutPhoto = (fileItems: FilePondFile[]) => {
    form.check_out_photo = fileItems.map((fileItem) => fileItem.file as File | Blob)[0] ?? null;
};
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Create Attendance" />

        <div class="px-4 py-6">
            <Heading title="Create Attendance" description="Here you can create a new attendance record." />

            <form class="space-y-6" @submit="submit">
                <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <div class="mb-6 grid gap-2">
                            <Label for="name">User</Label>
                            <Deferred :data="['users']">
                                <template #fallback>
                                    <span>Loading...</span>
                                </template>
                                <Select id="role" class="w-full" v-model="form.user_id" required>
                                    <SelectTrigger class="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="user in users" :key="user.id" :value="user.id"> {{ user.name }} </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Deferred>
                            <InputError class="mt-1" :message="form.errors.user_id" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="date">Date</Label>
                            <Input id="date" class="mt-1 block w-full" v-model="form.date" required type="date" />
                            <InputError class="mt-1" :message="form.errors.date" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="check_in">Check in time</Label>
                            <Input id="check_in" class="mt-1 block w-full" v-model="form.check_in" required type="datetime-local" />
                            <InputError class="mt-1" :message="form.errors.check_in" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="check_out">Check out time</Label>
                            <Input id="check_out" class="mt-1 block w-full" v-model="form.check_out" required type="datetime-local" />
                            <InputError class="mt-1" :message="form.errors.check_out" />
                        </div>
                    </div>

                    <div class="">
                        <div class="mb-6 grid gap-2">
                            <Label for="">Check in photo</Label>
                            <div class="mt-1 block w-full">
                                <file-pond
                                    label-idle="Drop file here..."
                                    :allow-multiple="false"
                                    :storeAsFile="true"
                                    accepted-file-types="image/webp,image/jpeg,image/png,image/jpg"
                                    max-file-size="5MB"
                                    @updatefiles="updateCheckInPhoto"
                                    imagePreviewMaxHeight="200"
                                />
                            </div>
                            <InputError class="mt-1" :message="form.errors.check_in_photo" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="">Check out photo</Label>
                            <div class="mt-1 block w-full">
                                <file-pond
                                    label-idle="Drop file here..."
                                    :allow-multiple="false"
                                    :storeAsFile="true"
                                    accepted-file-types="image/webp,image/jpeg,image/png,image/jpg"
                                    max-file-size="5MB"
                                    @updatefiles="updateCheckOutPhoto"
                                    imagePreviewMaxHeight="200"
                                />
                            </div>
                            <InputError class="mt-1" :message="form.errors.check_out_photo" />
                        </div>
                    </div>
                </div>

                <div class="flex justify-end">
                    <Button type="submit" :disabled="form.processing"> Save </Button>
                </div>
            </form>
        </div>
    </AppLayout>
</template>
