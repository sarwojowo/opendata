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
import { Plus } from 'lucide-vue-next';
import { ref } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const open = ref(false);
const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'admin',
});

const submit = (e: Event) => {
    e.preventDefault();

    form.post(route('admins.store'), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
    });
};

const closeModal = () => {
    form.clearErrors();
    form.reset();
    open.value = false;
};
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button> <Plus class="-ms-1" /> Add Admin </Button>
        </DialogTrigger>
        <DialogContent>
            <form class="space-y-6" @submit="submit">
                <DialogHeader class="space-y-3">
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription> </DialogDescription>
                </DialogHeader>

                <div class="">
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

                    <div class="mb-6 grid gap-2">
                        <Label for="role">Role</Label>
                        <Select id="role" class="w-full" v-model="form.role">
                            <SelectTrigger class="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">
                                    Admin Satuan Kerja
                                </SelectItem>
                                <SelectItem value="super_admin">
                                    Admin Pusat
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError class="mt-1" :message="form.errors.role" />
                    </div>
                </div>

                <DialogFooter class="gap-2">
                    <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal"> Cancel </Button>
                    </DialogClose>

                    <Button :disabled="form.processing">
                        <button type="submit" :disabled="form.processing">Save Account</button>
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
