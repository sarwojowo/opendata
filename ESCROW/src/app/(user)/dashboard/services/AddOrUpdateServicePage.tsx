"use client"

import styles from '../../../ui/admin/services/AddOrUpdateServicePage.module.css'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useEffect, useState, useRef } from "react";

interface ServiceData {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
}

interface FormValues {
    name: string;
    description: string;
    price: string | number;
    image: File | null;
}

export default function AddOrUpdateServicesPage({isCreate, id,}: { isCreate: boolean; id?: string; }) {
    const router = useRouter();
    const [formData, setFormData] = useState<Partial<ServiceData>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isCreate) {
            fetchService();
        }

        // Cleanup blob URL on unmount
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, [isCreate, id]);

    const fetchService = async () => {
        if (!id) return;

        try {
            setIsLoading(true);

            const serviceRes = await axios.get(`/api/services/${id}`);
            const { name, description, price, image_url } = serviceRes.data.data;

            setFormData({ name, description, price });
            setExistingImageUrl(image_url);

        } catch (error) {
            const err = error as AxiosError;
            toast.error(err.message || "Failed to load service data");
        } finally {
            setIsLoading(false);
        }
    };

    const initialValues: FormValues = {
        name: (formData.name as string) ?? "",
        description: (formData.description as string) ?? "",
        price: (formData.price as number) ?? "",
        image: null,
    };

    const handleSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const data = new FormData();

            if (values.image) {
                data.append("image", values.image);
            }

            data.append("name", values.name);
            data.append("description", values.description);
            data.append("price", String(values.price));

            const response = isCreate
                ? await axios.post("/api/services", data)
                : await axios.put(`/api/services/${id}`, data);

            if (response.status === 201 || response.status === 200) {
                toast.success(
                    isCreate
                        ? "Service created successfully."
                        : "Service updated successfully."
                );

                router.push("/dashboard/services");
            }

        } catch (error) {
            const err = error as AxiosError;

            console.error("Service submission error:", err);

            toast.error(
                (err.response?.data as any)?.message ||
                err.message ||
                "Error processing service"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Service name is required"),
        price: Yup.number()
            .typeError("Price must be a number")
            .positive("Price must be greater than 0")
            .required("Price is required"),
        image: isCreate ? Yup.mixed().required("Image is required") : Yup.mixed().nullable(),
    });

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button
                    className={styles.back_btn}
                    onClick={() => router.back()}
                >
                    ← Back
                </button>

                <h1 className={styles.title}>
                    {isCreate ? "Add New Service" : "Update Service"}
                </h1>
            </div>

            <div className={styles.content}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ setFieldValue, values }) => (
                        <Form className={styles.form}>
                            <div className={styles.left_side}>
                                <div className={styles.image_wrapper}>

                                    {values.image ? (
                                        <img
                                            src={previewUrl || URL.createObjectURL(values.image as File)}
                                            alt="Preview"
                                            className={styles.image_preview}
                                        />
                                    ) : existingImageUrl ? (
                                        <img
                                            src={existingImageUrl}
                                            alt="Current Image"
                                            className={styles.image_preview}
                                        />
                                    ) : (
                                        <div className={styles.image_placeholder}>
                                            <span>📷</span>
                                            <p>Upload Image</p>
                                        </div>
                                    )}

                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className={styles.file_input}
                                        onChange={(e) => {
                                            const file =
                                                e.currentTarget.files?.[0] ?? null;
                                            setFieldValue("image", file);

                                            // Revoke old blob URL
                                            if (previewUrlRef.current) {
                                                URL.revokeObjectURL(
                                                    previewUrlRef.current
                                                );
                                            }

                                            // Create new blob URL only once per file change
                                            if (file) {
                                                const newUrl =
                                                    URL.createObjectURL(file);
                                                previewUrlRef.current = newUrl;
                                                setPreviewUrl(newUrl);
                                            } else {
                                                previewUrlRef.current = null;
                                                setPreviewUrl(null);
                                            }
                                        }}
                                    />

                                    <label
                                        htmlFor="image"
                                        className={styles.file_label}
                                    >
                                        Choose File
                                    </label>
                                </div>

                                <ErrorMessage
                                    name="image"
                                    component="p"
                                    className={styles.error}
                                />
                            </div>

                            <div className={styles.right_side}>
                                <div className={styles.field_group}>
                                    <label
                                        htmlFor="name"
                                        className={styles.label}
                                    >
                                        Service Name
                                    </label>

                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="e.g. Logo Design"
                                        className={styles.input}
                                    />

                                    <ErrorMessage
                                        name="name"
                                        component="p"
                                        className={styles.error}
                                    />
                                </div>

                                <div className={styles.field_group}>
                                    <label
                                        htmlFor="description"
                                        className={styles.label}
                                    >
                                        Description
                                    </label>

                                    <Field
                                        id="description"
                                        name="description"
                                        as="textarea"
                                        rows={5}
                                        placeholder="Describe your service..."
                                        className={`${styles.input} ${styles.textarea}`}
                                    />
                                </div>

                                <div className={styles.field_group}>
                                    <label
                                        htmlFor="price"
                                        className={styles.label}
                                    >
                                        Price (ETH)
                                    </label>

                                    <Field
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.001"
                                        placeholder="0.00"
                                        className={styles.input}
                                    />

                                    <ErrorMessage
                                        name="price"
                                        component="p"
                                        className={styles.error}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submit_btn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Processing..." : (isCreate ? "Publish Service" : "Update Service")}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}