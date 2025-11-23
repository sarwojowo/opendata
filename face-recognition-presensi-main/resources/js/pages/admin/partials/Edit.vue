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
import { User } from '@/types';
import { Pen } from 'lucide-vue-next';
import { ref } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const props = defineProps<{
    user: User;
}>();

const open = ref(false);
const form = useForm({
    name: props.user.name,
    email: props.user.email,
    role: props.user.role,
});

const submit = (e: Event) => {
    e.preventDefault();

    form.put(route('admins.update', props.user.id), {
        preserveScroll: true,
        onSuccess: () => closeModal(),
    });
};

const closeModal = () => {
    form.clearErrors();
    open.value = false;
};
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger as-child>
            <Button> <Pen class="-ms-1" /> Edit Admin </Button>
        </DialogTrigger>
        <DialogContent>
            <form class="space-y-6" @submit="submit">
                <DialogHeader class="space-y-3">
                    <DialogTitle>Edit User</DialogTitle>
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
                        <Label for="role">Role</Label>
                        <Select id="role" class="w-full" v-model="form.role">
                            <SelectTrigger class="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin"> Admin Satuan Kerja </SelectItem>
                                <SelectItem value="super_admin"> Admin Pusat </SelectItem>
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
