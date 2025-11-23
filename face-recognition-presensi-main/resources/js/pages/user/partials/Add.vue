<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';

// Components
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePondFile } from 'filepond';
import { Plus } from 'lucide-vue-next';
import { ref } from 'vue';

const open = ref(false);
const form = useForm<{
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    photos: (File | Blob)[] | null;
}>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    photos: null,
});

const submit = (e: Event) => {
    e.preventDefault();

    form.photos?.forEach((file, index) => {
        if (form.photos && file instanceof Blob) {
            form.photos[index] = new File([file], (file as File).name, { type: file.type });
        }
    });

    form.post(route('users.store'), {
        preserveScroll: true,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onSuccess: () => closeModal(),
    });
};

const closeModal = () => {
    form.clearErrors();
    form.reset();
    open.value = false;
};

const updateFiles = (fileItems: FilePondFile[]) => {
    form.photos = fileItems.map((fileItem) => fileItem.file as File | Blob) ?? null;
};
</script>

<template>
    <Dialog v-model:open="open" >
        <DialogTrigger as-child>
            <Button> <Plus class="-ms-1" /> Add User </Button>
        </DialogTrigger>
        <DialogContent class="lg:max-w-[1100px]">
            <DialogHeader class="space-y-3">
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription> </DialogDescription>
            </DialogHeader>

            <form class="space-y-6" @submit="submit">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="mb-6 grid gap-2">
                            <Label for="name">Name</Label>
                            <Input id="name" class="mt-1 block w-full" v-model="form.name" required placeholder="Full name" type="text" />
                            <InputError class="mt-1" :message="form.errors.name" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="email">Email</Label>
                            <Input id="email" class="mt-1 block w-full" v-model="form.email" required placeholder="test@example.com" type="text" />
                            <InputError class="mt-1" :message="form.errors.email" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="password">Password</Label>
                            <Input id="password" class="mt-1 block w-full" v-model="form.password" required placeholder="Password" type="password" />
                            <InputError class="mt-1" :message="form.errors.password" />
                        </div>

                        <div class="mb-6 grid gap-2">
                            <Label for="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                class="mt-1 block w-full"
                                v-model="form.password_confirmation"
                                required
                                placeholder="Confirm password"
                                type="password"
                            />
                            <InputError class="mt-1" :message="form.errors.password_confirmation" />
                        </div>
                    </div>

                    <div class="max-h-[500px] overflow-y-auto">
                        <div class="mb-6 grid gap-2">
                            <Label for="">Photos</Label>
                            <div class="mt-1 block w-full">
                                <file-pond
                                    label-idle="Drop file here..."
                                    :allow-multiple="true"
                                    :storeAsFile="true"
                                    accepted-file-types="image/jpeg,image/png,image/jpg"
                                    max-file-size="5MB"
                                    @updatefiles="updateFiles"
                                    imagePreviewMaxHeight="200"
                                />
                            </div>
                            <InputError class="mt-1" :message="form.errors.photos" />
                            <InputError class="mt-2" :message="(form.errors as any)['photos.0']?.replace('photos.0', 'photo 1')" />
                            <InputError class="mt-2" :message="(form.errors as any)['photos.1']?.replace('photos.1', 'photo 2')" />
                            <InputError class="mt-2" :message="(form.errors as any)['photos.2']?.replace('photos.2', 'photo 3')" />
                        </div>
                    </div>
                </div>

                <DialogFooter class="gap-2">
                    <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal"> Cancel </Button>
                    </DialogClose>

                    <Button type="submit" :disabled="form.processing"> Save Account </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
