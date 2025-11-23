<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import Loader from '@/components/Loader.vue';
import PaginationComponent from '@/components/Pagination.vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RangeCalendar } from '@/components/ui/range-calendar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/AppLayout.vue';
import { formatHumanDate } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Attendance, BreadcrumbItem, Pagination } from '@/types';
import { Deferred, Head, Link, router } from '@inertiajs/vue3';
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { CalendarIcon, Eye, Plus } from 'lucide-vue-next';
import { DateRange } from 'reka-ui';
import { onMounted, Ref, ref, watch } from 'vue';

defineProps<{
    attendances?: Pagination<Attendance>;
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Attendances',
        href: '/attendances',
    },
];

const df = new DateFormatter('en-US', {
    dateStyle: 'medium',
});

const value = ref({
    start: today(getLocalTimeZone()).subtract({ days: 30 }),
    end: today(getLocalTimeZone()),
}) as Ref<DateRange>;

const reloadData = () => {
    router.reload({
        only: ['attendances'],
        showProgress: true,
        data: {
            since: value.value.start?.toString(),
            until: value.value.end?.toString(),
        },
    });
};

onMounted(() => {
    const params = new URLSearchParams(window.location.search);

    const since = params.get('since');
    const until = params.get('until');
    if (since) {
        value.value.start = parseDate(since);
    }
    if (until) {
        value.value.end = parseDate(until);
    }
    watch(
        value,
        (newValue) => {
            if (newValue.start && newValue.end) {
                reloadData();
            }
        },
        { deep: true },
    );
});
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Attendance List" />

        <div class="px-4 py-6">
            <Heading
                title="Attendance List"
                description="Here you can find the list of attendance records. You can check in and check out from here."
            />

            <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
                <Link :href="route('user-attendances.create')">
                    <Button as="span"> <Plus class="-ms-1" /> Add Attendance </Button>
                </Link>

                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline" :class="cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            <template v-if="value.start">
                                <template v-if="value.end">
                                    {{ df.format(value.start.toDate(getLocalTimeZone())) }} -
                                    {{ df.format(value.end.toDate(getLocalTimeZone())) }}
                                </template>

                                <template v-else>
                                    {{ df.format(value.start.toDate(getLocalTimeZone())) }}
                                </template>
                            </template>
                            <template v-else> Pick a date </template>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                        <RangeCalendar
                            v-model="value"
                            initial-focus
                            :number-of-months="2"
                            @update:start-value="(startDate) => (value.start = startDate)"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Deferred :data="['attendances']">
                <template #fallback>
                    <Loader />
                </template>

                <Table v-if="attendances != null">
                    <TableCaption>
                        <PaginationComponent :data="attendances" />
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead> User </TableHead>
                            <TableHead> Date </TableHead>
                            <TableHead> Check in </TableHead>
                            <TableHead> Check out </TableHead>
                            <TableHead> Action </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="(item, index) in attendances.data" :key="index">
                            <TableCell>{{ item.user?.name }}</TableCell>
                            <TableCell> {{ item.date ? formatHumanDate(item.date, 'dd LLL yyyy') : '-' }} </TableCell>
                            <TableCell>{{ item?.check_in ? formatHumanDate(item?.check_in) : '-' }}</TableCell>
                            <TableCell>{{ item?.check_out ? formatHumanDate(item?.check_out) : '-' }}</TableCell>
                            <TableCell>
                                <Link :href="route('user-attendances.show', item.id)">
                                    <Button variant="link" as="span"> <Eye class="-ms-1" /> Detail </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                        <TableRow v-if="attendances.data.length < 1">
                            <TableCell colspan="10" class="py-8 text-center"> No data found. </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Deferred>
        </div>
    </AppLayout>
</template>
